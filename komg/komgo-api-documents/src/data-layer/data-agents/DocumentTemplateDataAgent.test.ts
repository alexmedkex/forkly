import 'reflect-metadata'

import { Readable } from 'stream'

import { DocumentTemplate } from '../models/document-template'
import * as TestData from '../models/test-entities'

import DocumentTemplateDataAgent from './DocumentTemplateDataAgent'

DocumentTemplate.create = jest.fn()
DocumentTemplate.findOne = jest.fn()

const documentTemplate = TestData.documentTemplate()

const gridFsMock: DocumentTemplateDataAgent = {
  saveFileBuffer: jest.fn(),
  deleteFile: jest.fn(),
  getFileStream: jest.fn(),
  getFileBuffer: jest.fn(),
  getFileContentType: jest.fn()
}

describe('DocumentTemplateDataAgent', () => {
  const testId1 = 'test-id-1-default'
  const name = 'hello world'
  const buf = new Buffer('')
  const contentType = 'application/pdf'
  let agent

  beforeEach(async () => {
    agent = new DocumentTemplateDataAgent(gridFsMock)
  })

  describe('saveFileBuffer', () => {
    it('should simply pass arguments to gridFs.saveFileBuffer', async () => {
      await agent.saveFileBuffer({
        fileName: name,
        file: buf,
        contentType
      })

      expect(gridFsMock.saveFileBuffer).toBeCalledWith({
        id: undefined,
        fileName: name,
        file: buf,
        contentType
      })
    })
  })

  describe('deleteFile', () => {
    it('should simply pass arguments to gridFs.deleteFile', async () => {
      await agent.deleteFile(name)

      expect(gridFsMock.deleteFile).toHaveBeenCalled()
      expect(gridFsMock.deleteFile.mock.calls[0][0]).toBe(name)
    })
  })

  describe('getFileStream', () => {
    it('should simply pass arguments to gridFs.getFileStream', async () => {
      await agent.getFileStream(testId1)

      expect(gridFsMock.getFileStream).toHaveBeenCalled()
      expect(gridFsMock.getFileStream.mock.calls[0][0]).toBe(testId1)
    })

    it('should return the return value of gridFs.getFileStream', async () => {
      const strm = new Readable({})
      gridFsMock.getFileStream.mockResolvedValueOnce(strm)

      const call = agent.getFileStream()

      await expect(call).resolves.toBe(strm)
    })
  })

  describe('getFileBuffer', () => {
    it('should simply pass arguments to gridFs.getFileBuffer', async () => {
      await agent.getFileBuffer(testId1)

      expect(gridFsMock.getFileBuffer).toHaveBeenCalled()
      expect(gridFsMock.getFileBuffer.mock.calls[0][0]).toBe(testId1)
    })

    it('should return the return value of gridFs.getFileBuffer', async () => {
      const buf = new Buffer('')
      gridFsMock.getFileBuffer.mockResolvedValueOnce(buf)

      const call = agent.getFileBuffer()

      await expect(call).resolves.toBe(buf)
    })
  })

  describe('getFileContentType', () => {
    it('should simply pass arguments to gridFs.getFileContentType', async () => {
      await agent.getFileContentType(testId1)

      expect(gridFsMock.getFileContentType).toHaveBeenCalled()
      expect(gridFsMock.getFileContentType.mock.calls[0][0]).toBe(testId1)
    })

    it('should return the return value of gridFs.getFileContentType', async () => {
      const contentType = 'app/json'
      gridFsMock.getFileContentType.mockResolvedValueOnce(contentType)

      const call = agent.getFileContentType()

      await expect(call).resolves.toBe(contentType)
    })
  })

  describe('create', () => {
    it('should call create on the model', async () => {
      const newRecord = { ...documentTemplate }
      delete newRecord.id
      DocumentTemplate.create.mockReturnValueOnce(newRecord)

      const result = await agent.create(newRecord)

      expect(result).toBe(newRecord)
      expect(DocumentTemplate.create).toHaveBeenCalledWith(newRecord)
    })

    it('should fail if model create fails', async () => {
      const newRecord = { ...documentTemplate }
      DocumentTemplate.create.mockRejectedValueOnce('Failed')

      const call = agent.create(newRecord)

      await expect(call).rejects.toBeDefined()
    })
  })

  describe('getById', () => {
    it('should execute model.findOne to find the object', async () => {
      const id = 'test-id'
      const mockExec = { exec: jest.fn() }
      DocumentTemplate.findOne.mockReturnValueOnce(mockExec)

      await agent.getById(id)

      expect(DocumentTemplate.findOne).toHaveBeenCalledWith({ _id: id })
      expect(mockExec.exec).toHaveBeenCalled()
    })

    it('should fail if executing findOne fails', async () => {
      const id = 'test-id'
      const mockExec = { exec: jest.fn() }
      DocumentTemplate.findOne.mockReturnValueOnce(mockExec)
      mockExec.exec.mockImplementationOnce(() => {
        throw new Error()
      })

      const call = agent.getById(id)

      await expect(call).rejects.toBeDefined()
    })
  })
})
