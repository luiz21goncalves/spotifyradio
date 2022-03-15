import fs from 'fs'
import fsPromises from 'fs/promises'
import { join, extname } from 'path'

import config from './config.js'

export class Service {
  createFileStream(filename) {
    return fs.createReadStream(filename)
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
}
