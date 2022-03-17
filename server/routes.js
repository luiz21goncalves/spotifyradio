import { once } from 'events'

import { logger } from './utils.js'
import config from './config.js'
import { Controller } from './controller.js'

const controller = new Controller()

async function routes(request, response) {
  const { method, url } = request

  if (method === 'GET' && url === '/') {
    response.writeHead(302, {
      'Location': config.location.home
    })
    return response.end()
  }

  if (method === 'GET' && url === '/home') {
    const { stream } = await controller.getFileStream(config.pages.homeHTML)

    return stream.pipe(response)
  }

  if (method === 'GET' && url === '/controller') {
    const { stream } = await controller.getFileStream(config.pages.controllerHTML)

    return stream.pipe(response)
  }

  if (method === 'GET' && url.includes('/stream')) {
    const { stream, onClose } = controller.createClientStream()
    request.once('close', onClose)

    response.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Accept-Rages': 'bytes'
    })

    return stream.pipe(response)
  }

  if (method === 'POST' && url === '/controller') {
    const data = await once(request, 'data')
    const item = JSON.parse(data)
    
    const result = await controller.handleCommand(item)
    
    return response.end(JSON.stringify(result))
  }

  if (method === 'GET') {
    const { stream, type } = await controller.getFileStream(url)

    const contentType = config.constants.CONTENT_TYPE[type]

    if (contentType) {
      response.writeHead(200, {
        'Content-Type': contentType
      })
    }

    return stream.pipe(response)
  }

  response.writeHead(404)
  return response.end()
}

function handleError(error, response) {
  if (error.message.includes('ENOENT')) {
    logger.warn(`asset not found ${error.stack}`)

    response.writeHead(404)
    return response.end()
  }

  logger.error(`caught error on APT ${error.stack}`)

  response.writeHead(500)
  return response.end()
}

export function handle(resquest, response) {
  return routes(resquest, response).catch(error => handleError(error, response))
}