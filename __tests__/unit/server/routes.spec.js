import { expect, describe, test,beforeEach, jest } from '@jest/globals'

import { handle } from '../../../server/routes.js'
import { TestUtil } from '../utils/testUtil.js'
import config from '../../../server/config.js'
import { Controller } from '../../../server/controller.js'

describe('#Routes - test suit for api response', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  test('GET / - should redirect to home page', async () => {
    const params = TestUtil.defaultHandleParams()
    params.request.method = 'GET'
    params.request.url = '/'

    await handle(...params.values())

    expect(params.response.writeHead).toHaveBeenCalledWith(302, {
      'Location': config.location.home
    })
    expect(params.response.end).toHaveBeenCalled()
  })

  test(`GET /home - should response with ${config.pages.homeHTML} file stream`, async () => {
    const params = TestUtil.defaultHandleParams()
    params.request.method = 'GET'
    params.request.url = '/home'

    const mockFileStream = TestUtil.generateReadableStream(['data'])
    jest
      .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
      .mockResolvedValue({ stream: mockFileStream })
    jest.spyOn(mockFileStream, 'pipe').mockResolvedValue()

    await handle(...params.values())

    expect(Controller.prototype.getFileStream).toHaveBeenCalledWith(config.pages.homeHTML)
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response)
  })

  test(`GET /controller - should response with ${config.pages.controllerHTML} file stream`, async () => {
    const params = TestUtil.defaultHandleParams()
    params.request.method = 'GET'
    params.request.url = '/controller'

    const mockFileStream = TestUtil.generateReadableStream(['data'])
    jest
      .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
      .mockResolvedValue({ stream: mockFileStream })
    jest.spyOn(mockFileStream, 'pipe').mockResolvedValue()

    await handle(...params.values())

    expect(Controller.prototype.getFileStream).toHaveBeenCalledWith(config.pages.controllerHTML)
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response)
  })

  test('GET /index.js - should response file stream', async () => {
    const params = TestUtil.defaultHandleParams()
    const fileName = '/index.js'
    params.request.method = 'GET'
    params.request.url = fileName
    const expectedType = '.js'

    const mockFileStream = TestUtil.generateReadableStream(['data'])
    jest
      .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
      .mockResolvedValue({ stream: mockFileStream, type: expectedType })
    jest.spyOn(mockFileStream, 'pipe').mockResolvedValue()

    await handle(...params.values())

    expect(Controller.prototype.getFileStream).toHaveBeenCalledWith(fileName)
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response)
    expect(params.response.writeHead).toHaveBeenCalledWith(200,  {
      'Content-Type': config.constants.CONTENT_TYPE[expectedType]
    })
  })

  test('GET /file.ext - should response file stream', async () => {
    const params = TestUtil.defaultHandleParams()
    const fileName = '/file.ext'
    params.request.method = 'GET'
    params.request.url = fileName
    const expectedType = '.ext'

    const mockFileStream = TestUtil.generateReadableStream(['data'])
    jest
      .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
      .mockResolvedValue({ stream: mockFileStream, type: expectedType })
    jest.spyOn(mockFileStream, 'pipe').mockResolvedValue()

    await handle(...params.values())

    expect(Controller.prototype.getFileStream).toHaveBeenCalledWith(fileName)
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response)
    expect(params.response.writeHead).not.toHaveBeenCalled()
  })

  test('POST /unknown - given an inexistent routes is should response with 404', async () => {
    const params = TestUtil.defaultHandleParams()
    params.request.method = 'POST'
    params.request.url = '/unknown'

    await handle(...params.values())
    
    expect(params.response.writeHead).toHaveBeenCalledWith(404)
    expect(params.response.end).toHaveBeenCalled()
  })

  describe('exceptions', () => {
    test('given inexistent file it should response with 404', async () => {
      const params = TestUtil.defaultHandleParams()
      params.request.method = 'GET'
      params.request.url = '/index.png'

      jest
        .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
        .mockRejectedValue(new Error('Error: ENOENT: no such file or directory'))
  
      await handle(...params.values())
      
      expect(params.response.writeHead).toHaveBeenCalledWith(404)
      expect(params.response.end).toHaveBeenCalled()
    })

    test('given an error it should response with 500', async () => {
      const params = TestUtil.defaultHandleParams()
      params.request.method = 'GET'
      params.request.url = '/index.png'

      jest
        .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
        .mockRejectedValue(new Error('Error: unexpected error'))
  
      await handle(...params.values())
      
      expect(params.response.writeHead).toHaveBeenCalledWith(500)
      expect(params.response.end).toHaveBeenCalled()
    })
  })
})
