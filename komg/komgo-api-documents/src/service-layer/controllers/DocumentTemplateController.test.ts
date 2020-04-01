import 'reflect-metadata'

import { HttpException } from '@komgo/microservice-config'
import { Readable } from 'stream'

import { DocumentTemplateCompiler } from '../../business-layer/presentation/DocumentTemplateCompiler'
import DocumentTemplateDataAgent from '../../data-layer/data-agents/DocumentTemplateDataAgent'
import { mock } from '../../mock-utils'
import * as utils from '../../utils'
import Uploader from '../utils/Uploader'

import { DocumentTemplateController } from './DocumentTemplateController'
import { product } from '../../data-layer/models/test-entities'
import ProductDataAgent from '../../data-layer/data-agents/ProductDataAgent'
import ControllerUtils from './utils'

const MockExpressRequest = require('mock-express-request')

const mockDataAgent = mock(DocumentTemplateDataAgent)
const mockPDFCompiler = mock(DocumentTemplateCompiler)
const mockUploader = mock(Uploader)

mockDataAgent.saveFileBuffer = jest.fn((...args) => {})
mockDataAgent.create = jest.fn(() => {
  return { id: 'test-id' }
})
mockDataAgent.deleteFile = jest.fn()
mockDataAgent.getById = jest.fn()
mockDataAgent.getFileStream = jest.fn(() => Promise.resolve(new Readable({})))
mockDataAgent.getById.mockResolvedValue({ content: { fileId: 'test-id' } })

mockPDFCompiler.compile = jest.fn()
mockPDFCompiler.compile.mockResolvedValue(new Buffer(''))
mockUploader.upload = jest.fn()
mockUploader.upload.mockResolvedValue({ file: { buffer: new Buffer(''), mimetype: '' } })

const streamToBufferSpy = jest.spyOn(utils, 'streamToBuffer')
const productDataAgent = mock(ProductDataAgent)

describe('DocumentTemplateController', () => {
  let controller: DocumentTemplateController
  beforeEach(() => {
    const controllerUtils = new ControllerUtils(productDataAgent, null, null, null)
    controller = new DocumentTemplateController(mockDataAgent, mockPDFCompiler, controllerUtils, mockUploader)
    productDataAgent.getAll.mockReturnValue([product()])
  })

  describe('uploadDocumentTemplate', () => {
    const fileBuf = new Buffer('')
    let request
    beforeAll(() => {
      request = new MockExpressRequest({
        method: 'POST',
        url: '/document-templates',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data;'
        },
        file: { buffer: fileBuf },
        mimetype: ''
      })
    })

    it('works in the happy path', async () => {
      const call = () => controller.uploadDocumentTemplate(request)

      await expect(call()).resolves.toBeDefined()
    })

    it('calls uploader with the request', async () => {
      await controller.uploadDocumentTemplate(request)

      expect(mockUploader.upload).toBeCalledWith(request)
    })

    it('fails to upload if request not built correctly', async () => {
      mockUploader.upload.mockResolvedValueOnce({ file: undefined })

      let errorToExpect
      try {
        await controller.uploadDocumentTemplate(request)
      } catch (error) {
        errorToExpect = error
      } finally {
        expect(errorToExpect).toBeInstanceOf(HttpException)
      }
    })

    it('saves the uploaded file by calling save file buffer on the data agent', async () => {
      mockUploader.upload.mockResolvedValueOnce({ file: { buffer: fileBuf, mimetype: 'content-type' } })

      await controller.uploadDocumentTemplate(request)

      const fileBuffer = mockDataAgent.saveFileBuffer.mock.calls[0][0]
      expect(fileBuffer).toMatchObject({
        id: undefined,
        file: fileBuf,
        contentType: 'content-type'
      })
    })

    it('creates the document referencing the file ID returned from uploading the file', async () => {
      const fileId = 'test-file-id'
      mockDataAgent.saveFileBuffer.mockResolvedValueOnce(fileId)

      await controller.uploadDocumentTemplate(request)

      expect(mockDataAgent.create.mock.calls[0][0].content.fileId).toBe(fileId)
    })

    it('throws if it fails to save the buffer', async () => {
      mockDataAgent.saveFileBuffer.mockRejectedValueOnce('Failed')

      const call = controller.uploadDocumentTemplate(request)

      await expect(call).rejects.toBeDefined()
    })

    it('deletes the file and throws if it fails to create the record', async () => {
      mockDataAgent.create.mockRejectedValueOnce('Failed')

      const call = () => controller.uploadDocumentTemplate(request)

      await expect(call()).rejects.toBeDefined()
      const fileName = mockDataAgent.saveFileBuffer.mock.calls[0][0].fileName
      expect(mockDataAgent.deleteFile).toHaveBeenCalledWith(fileName)
    })
  })

  describe('CompileDocumentTemplate', () => {
    let request: MockExpressRequest
    let fields: object
    let params
    beforeAll(() => {
      request = new MockExpressRequest({
        method: 'POST',
        url: '/document-templates/compile',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data;'
        },
        res: { set: jest.fn(), write: jest.fn() }
      })

      fields = {}
      params = { templateId: '', fields: fields }
      streamToBufferSpy.mockImplementation(() => new Buffer(''))
    })

    afterAll(() => {
      streamToBufferSpy.mockRestore()
    })

    it('fails if document with template ID is not found', async () => {
      mockDataAgent.getById.mockResolvedValueOnce(null)

      let errorToExpect
      try {
        await controller.compileDocumentTemplate(request, params)
      } catch (error) {
        errorToExpect = error
      } finally {
        expect(errorToExpect).toBeInstanceOf(HttpException)
      }
    })

    it('calls getFileStream with the appropriate fileID', async () => {
      const fileId = 'random-file-id'
      mockDataAgent.getById.mockResolvedValueOnce({ content: { fileId: fileId } })

      await controller.compileDocumentTemplate(request, params)

      expect(mockDataAgent.getFileStream).toBeCalledWith(fileId)
    })

    it('uses the PDF compiler to try to compile the JSON fields', async () => {
      const fields = {}
      const params = { templateId: '', fields: fields }

      await controller.compileDocumentTemplate(request, params)

      expect(mockPDFCompiler.compile).toHaveBeenCalledTimes(1)
      expect(mockPDFCompiler.compile.mock.calls[0][1]).toBe(fields)
    })

    it('rejects if the PDF compiler fails', async () => {
      mockPDFCompiler.compile.mockRejectedValueOnce('Failed')

      let errorToExpect
      try {
        await controller.compileDocumentTemplate(request, params)
      } catch (error) {
        errorToExpect = error
      } finally {
        expect(errorToExpect).toBeInstanceOf(HttpException)
      }
    })
  })
})
