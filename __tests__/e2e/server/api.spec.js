import { expect, describe, test, beforeEach, jest } from '@jest/globals'
import portfinder from 'portfinder'
import { Transform } from 'stream'
import supertest from 'supertest'
import { setTimeout } from 'timers/promises'

import config from '../../../server/config.js'
import server from '../../../server/server.js'

const RETENTION_DATA_PERIOD = 200
const commandResponse = JSON.stringify({ result: 'ok' })
const possibleCommands = {
  start: 'start',
  stop: 'stop'
}

describe('API E2E Suite Tes', () => {
  function pipeAndReadStreamData(stream, onChunk) {
    const transform = new Transform({
      transform(chunk, enc, cb) {
        onChunk(chunk)

        cb(null, chunk)
      }
    })

    return stream.pipe(transform)
  }

  describe('client workflow', () =>  {
    async function getTestServer() {
      const getSuperTest = (port) => supertest(`http://localhost:${port}`)
      
      const port = await portfinder.getPortPromise()

      return new Promise((resolve, reject) => {
        server
          .listen(port)
          .once('listening', () => {
            const testServer = getSuperTest(port)

            const response = {
              testServer,
              kill() {
                server.close()
              }
            }

            return resolve(response)
          })
          .once('error', reject)
      })
    }

    function commandSender(testServer) {
      return {
        async send(command) {
          const response = await testServer.post('/controller').send({
            command
          })

          expect(response.text).toStrictEqual(commandResponse)
        }
      }
    }

    test('is should not receive data stream if the process is not playing', async () => {
      const server = await getTestServer()
      
      const onChunk = jest.fn()
      pipeAndReadStreamData(
        server.testServer.get('/stream'),
        onChunk
      )
      await setTimeout(RETENTION_DATA_PERIOD)
      server.kill()

      expect(onChunk).not.toHaveBeenCalled()
    })
    
    test('is should receive data stream if the process is playing', async () => {
      const server = await getTestServer()
      
      const onChunk = jest.fn()
      const { send } = commandSender(server.testServer)
      pipeAndReadStreamData(
        server.testServer.get('/stream'),
        onChunk
      )

      await send(possibleCommands.start)
      await setTimeout(RETENTION_DATA_PERIOD)
      await send(possibleCommands.stop)
      server.kill()

      const [ [buffer] ] = onChunk.mock.calls


      expect(buffer).toBeInstanceOf(Buffer)
      expect(buffer.length).toBeGreaterThan(1000)
    })
  })
})
