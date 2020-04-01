import 'reflect-metadata'

import { IDocumentGenerator } from '@komgo/document-generator'
import * as fs from 'fs'

import { DocumentTemplateCompiler } from './DocumentTemplateCompiler'

const docGenMock: IDocumentGenerator = {
  generate: jest.fn()
}

describe('DocumentTemplateCompiler', () => {
  let compiler
  let readFileSpy
  const docxFileBuf = new Buffer('')

  beforeAll(() => {
    readFileSpy = jest.spyOn(fs, 'readFile')
    readFileSpy.mockImplementation((fp, _, callback) => callback(null, docxFileBuf))
  })

  beforeEach(() => {
    compiler = new DocumentTemplateCompiler(docGenMock)
  })

  afterAll(() => {
    readFileSpy.mockRestore()
  })

  describe('compile', () => {
    it('should throw if generation throws', async () => {
      docGenMock.generate.mockRejectedValueOnce('Failed')

      const call = compiler.compile(new Buffer(''), {})

      await expect(call).rejects.toBeDefined()
    })

    it('should throw properties.rootError message if there is one', async () => {
      const message = 'test document generation error'
      docGenMock.generate.mockRejectedValueOnce({ properties: { rootError: message } })

      const call = compiler.compile(new Buffer(''), {})

      await expect(call).rejects.toMatchObject(new Error(`Failed to generate PDF - ${message}`))
    })

    it('should throw an error if properties.rootError is undefined', async () => {
      docGenMock.generate.mockRejectedValueOnce({ properties: { rootError: undefined } })

      const call = compiler.compile(new Buffer(''), {})

      await expect(call).rejects.toBeDefined()
    })

    it('should throw an error if properties is undefined', async () => {
      docGenMock.generate.mockRejectedValueOnce({})

      const call = compiler.compile(new Buffer(''), {})

      await expect(call).rejects.toBeDefined()
    })

    it('should call generate with appropriate arguments', async () => {
      const fp = 'path1'
      docGenMock.generate.mockResolvedValueOnce(fp)
      const docx = new Buffer('')
      const fields = {}

      await compiler.compile(docx, fields)

      expect(docGenMock.generate).toHaveBeenCalledWith(docx, fields, expect.any(String))
    })

    it('should call fs.readFile', async () => {
      const fp = 'path'
      docGenMock.generate.mockResolvedValueOnce(fp)

      await compiler.compile(new Buffer(''), {})

      expect(readFileSpy).toHaveBeenCalled()
      expect(readFileSpy.mock.calls[0][0]).toBe(fp)
    })
  })
})
