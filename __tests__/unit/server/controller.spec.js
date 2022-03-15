import { expect, describe, test,beforeEach, jest } from '@jest/globals'

import { Controller } from '../../../server/controller.js'
import { Service } from '../../../server/service.js'
import { TestUtil } from '../utils/testUtil.js'

describe('#Controller', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  test('getFileStream - should return an object with stream and type', async () => {
    const filename = 'index.js'
    const expectedType = '.js'
    
    const mockFileStream = TestUtil.generateReadableStream(['data'])
    jest.spyOn(Service.prototype, Service.prototype.getFileStream.name).mockReturnValue({ stream: mockFileStream, type: expectedType })

    const controller = new Controller()
    const response = await controller.getFileStream(filename)
  
    expect(Service.prototype.getFileStream).toHaveBeenCalledWith(filename)
    expect(response).toStrictEqual({ stream: mockFileStream, type: expectedType })
  })
})
