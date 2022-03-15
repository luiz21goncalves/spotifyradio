import { expect, describe, test,beforeEach, jest } from '@jest/globals'
import path from 'path'
import fsPromises from 'fs/promises'
import fs from 'fs'

import config from '../../../server/config.js'
import { Service } from '../../../server/service.js'
import { TestUtil } from '../utils/testUtil.js'

describe('#Service', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  test('geFileInfo - should be return and object with type and name', async () => {
    const file = '/file.png'
    const type = '.png'
    const filePath = `${config.dir.publicDirectory}${file}`

    jest.spyOn(path, path.join.name).mockReturnValue(filePath)
    jest.spyOn(path, path.extname.name).mockReturnValue(type)
    jest.spyOn(fsPromises, fsPromises.access.name).mockResolvedValue()

    const service = new Service()
    const response = await service.geFileInfo(file)

    expect(response).toStrictEqual({
      type,
      name: filePath
    })
  })

  test('getFileStream - should be return and object with stream and type', async () => {
    const file = '/file.png'
    const expectedType = '.png'
    const filePath = `${config.dir.publicDirectory}${file}`
    const mockFileStream = TestUtil.generateReadableStream(['data'])
    
    jest.spyOn(fs, fs.createReadStream.name).mockReturnValue(mockFileStream)
    jest.spyOn(Service.prototype, Service.prototype.geFileInfo.name).mockResolvedValue({
      name: filePath,
      type: expectedType,
    })

    const service = new Service()
    const response = await service.getFileStream(file)

    expect(response).toStrictEqual({
      type: expectedType,
      stream: mockFileStream
    })
  })
})