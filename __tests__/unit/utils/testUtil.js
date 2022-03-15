import { Readable, Writable } from 'stream'
import { jest } from '@jest/globals'

export class TestUtil {
  static generateReadableStream(data) {
    return new Readable({
      read() {
        for(const item of data) {
          this.push(item)
        }

        return this.push(null)
      }
    })
  }
  static generateWritableStream(onData) {
    return new Writable({
      write(chunk, enc, cb) {
        onData(chunk)

        cb(null, chunk)
      }
    })
  }

  static defaultHandleParams(onData) {
    const requestStream = TestUtil.generateReadableStream([])
    const responseStream = TestUtil.generateWritableStream(() => {})

    const data = {
      request: Object.assign(requestStream, { headers: {}, method: '', url: '' }),
      response: Object.assign(responseStream, { writeHead: jest.fn(), end: jest.fn() })
    }

    return {
      values: () => Object.values(data),
      ...data,
    }
  }
}