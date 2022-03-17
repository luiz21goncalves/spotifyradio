import { Service } from "./service.js";
import { logger } from './utils.js'

export class Controller {
  constructor() {
    this.service = new Service()
  }

  async getFileStream(filename) {
    return this.service.getFileStream(filename)
  }

  async handleCommand({ command }) {
    logger.info(`command received: ${command}`)
    const response = { result: 'ok' }

    const cmd = command.toLowerCase()

    if(cmd.includes('start')) {
      this.service.startStreaming()
      
      return response
    }

    if(cmd.includes('stop')) {
      this.service.stopStreaming()
      
      return response
    }
  }

  createClientStream() {
    const { id, clientStream } = this.service.createClientStream()

    const onClose = () => {
      logger.info(`closing connetion of ${id}`)
      this.service.removeClientStream(id)
    }

    return {
      stream: clientStream,
      onClose,
    }
  }
}