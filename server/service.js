import fs from 'fs'
import fsPromises from 'fs/promises'
import { join, extname } from 'path'
import { randomUUID } from 'crypto'
import { PassThrough, Writable } from 'stream'
import Throttle from 'throttle'
import childProcess from 'child_process'
import streamPromises  from 'stream/promises'
import { once } from 'events'

import { logger } from './utils.js'
import config from './config.js'

export class Service {
  constructor() {
    this.clientStreams = new Map()
    this.currentSong = config.constants.englishConversation
    this.currentBitRate = 0
    this.throttleTransform = {}
    this.currentReadable = {}
  }

  createClientStream() {
    const id = randomUUID()
    const clientStream = new PassThrough()
    this.clientStreams.set(id, clientStream)

    return {
      id,
      clientStream
    }
  }

  removeClientStream(id) {
    this.clientStreams.delete(id)
  }

  _executeSoxCommand(args) {
    logger.info(`args: ${args}`)
   return childProcess.spawn('sox', args)
  }

  async getBitRate(song) {
    try {
      const args = ['--i', '-B', song]
      
      const { stderr, stdout } = this._executeSoxCommand(args)
      await Promise.all([once(stderr, 'readable'), once(stdout, 'readable')])
      
      const [ success, error ] = [stdout, stderr].map(stream => stream.read())
      if (error) return await Promise.reject(error) 

      return success.toString().trim().replace(/k/, '000')
    } catch (error) {
      logger.error(`bitrate error: ${error}`)

      return config.constants.fallbackBitRate
    }
  }

  broadCast() {
    return new Writable({
      write: (chunk, enc, cb) => {
        for (const [id, stream] of this.clientStreams) {
          if (stream.writableEnded) {
            this.removeClientStream(id)
            continue;
          }

          stream.write(chunk)
        }

        cb()
      }
    })
  }

  createFileStream(filename) {
    return fs.createReadStream(filename)
  }

  async startStreaming() {
    logger.info(`starting with ${this.currentSong}`)

    const bitRate = this.currentBitRate = (await this.getBitRate(this.currentSong)) / config.constants.bitRateDivisor
    
    const throttleTransform = this.throttleTransform = new Throttle(bitRate)
    const songReadable = this.currentReadable = this.createFileStream(this.currentSong)
    
    return streamPromises.pipeline(songReadable, throttleTransform, this.broadCast())
  }

  stopStreaming() {
    this.throttleTransform?.end?.()
  }

  async geFileInfo(file) {
    const fullFilePath = join(config.dir.publicDirectory, file)
    await fsPromises.access(fullFilePath)

    const fileType = extname(fullFilePath)

    return {
      type: fileType,
      name: fullFilePath
    }
  }

  async getFileStream(file) {
    const { type, name } = await this.geFileInfo(file)

    return {
      stream: this.createFileStream(name),
      type,
    }
  }

  async readFxByName(fxName) {
    const songs = await fsPromises.readdir(config.dir.fxDirectory)
    const chosenSong = songs.find(filename =>  filename.toLowerCase().includes(fxName))
    
    if (!chosenSong) return Promise.reject(`the song ${fxName} wasn't found!`)

    return join(config.dir.fxDirectory, chosenSong)
  }

  appendFxStream(fx) {
    const throttleTransformable = new Throttle(this.currentBitRate)
    streamPromises.pipeline(
      throttleTransformable,
      this.broadCast()
    )

    const unpipe = () => {
      const transformStream = this.mergeAudioStreams(fx, this.currentReadable)

      this.throttleTransform = throttleTransformable
      this.currentReadable = transformStream

      this.currentReadable.removeListener('unpipe', unpipe)

      streamPromises.pipeline(
        transformStream,
        throttleTransformable
      )
    }
    
    this.throttleTransform.on('unpipe', unpipe)
    this.throttleTransform.pause()
    this.currentReadable.unpipe(this.throttleTransform)
  }

  mergeAudioStreams(song, readable) {
    const transformStream = PassThrough()

    const args = [
      '-t', config.constants.audioMediaType,
      '-v', config.constants.songVolume,
      '-m', '-',
      '-t', config.constants.audioMediaType,
      '-v', config.constants.fxVolume,
      song,
      '-t', config.constants.audioMediaType,
      '-'
    ]

    const { stdout, stdin } = this._executeSoxCommand(args)

    streamPromises.pipeline(
      readable,
      stdin
    )

    streamPromises.pipeline(
      stdout,
      transformStream
    )

    return transformStream
  }
}
