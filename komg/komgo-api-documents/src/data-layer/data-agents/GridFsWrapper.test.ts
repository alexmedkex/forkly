import 'reflect-metadata'

import ItemNotFound from './exceptions/ItemNotFound'
import GridFsWrapper from './GridFsWrapper'

const docFileMock = {
  findOne: jest.fn(),
  readById: jest.fn(),
  unlinkById: jest.fn(),
  write: jest.fn()
}

describe('GridFsWrapper', () => {
  const testId1 = 'test-id-1-default'
  const name = 'hello world'
  const buf = new Buffer('')
  const contentType = 'application/pdf'
  let gridFs
  let gridFsProvider

  beforeEach(async () => {
    jest.resetAllMocks()
    gridFsProvider = () => Promise.resolve({ model: docFileMock })
    gridFs = new GridFsWrapper(gridFsProvider)
  })

  describe('saveFileBuffer', () => {
    it('should attempt to write the buffer with the correct arguments', async () => {
      docFileMock.write.mockImplementationOnce((a, b, callback) => {
        callback(null, { _id: testId1 })
      })

      await gridFs.saveFileBuffer({
        id: testId1,
        fileName: name,
        file: buf,
        contentType
      })

      expect(docFileMock.write).toHaveBeenCalledTimes(1)
      expect(docFileMock.write.mock.calls[0][0]).toEqual({
        _id: testId1,
        filename: name,
        contentType
      })
    })

    it('should return the file ID of the new file', async () => {
      docFileMock.write.mockImplementationOnce((a, b, callback) => {
        callback(null, { _id: testId1 })
      })

      const id = await gridFs.saveFileBuffer(testId1, name, buf, contentType)

      expect(id).toBe(testId1)
    })

    it('should reject if an error is passed to the write callback', async () => {
      docFileMock.write.mockImplementationOnce((a, b, callback) => {
        callback('There was an error')
      })

      const call = gridFs.saveFileBuffer('name', new Buffer(''), 'application/pdf')

      await expect(call).rejects.toBeDefined()
    })

    it('should resolve to filed ID if a created file is passed', async () => {
      const testId = 'test-id-2'
      docFileMock.write.mockImplementationOnce((a, b, callback) => {
        callback(null, { _id: testId })
      })

      const call = gridFs.saveFileBuffer(testId1, 'name', new Buffer(''), 'application/pdf')

      await expect(call).resolves.toBeDefined()
    })
  })

  describe('getFileBuffer', () => {
    it('should pass file ID to readById on document model', async () => {
      const fid = 'test-file-id'
      docFileMock.readById.mockImplementationOnce((a, callback) => {
        callback(null, new Buffer(''))
      })

      await gridFs.getFileBuffer(fid)

      expect(docFileMock.readById).toHaveBeenCalled()
      expect(docFileMock.readById.mock.calls[0][0]).toBe(fid)
    })

    it('should resolve to the buffer passed to the callback', async () => {
      docFileMock.readById.mockImplementationOnce((a, callback) => {
        callback(null, buf)
      })

      const call = gridFs.getFileBuffer('')

      await expect(call).resolves.toBe(buf)
    })

    it('should reject if error is passed to callback', async () => {
      docFileMock.readById.mockImplementationOnce((_, callback) => {
        callback('some error', new Buffer(''))
      })

      const call = gridFs.getFileBuffer('')

      await expect(call).rejects.toBeDefined()
    })

    it('should throw if readById throws', async () => {
      docFileMock.readById.mockImplementationOnce((_, callback) => {
        throw new Error()
      })

      const call = gridFs.getFileBuffer('')

      await expect(call).rejects.toBeDefined()
    })
  })

  describe('getFileStream', () => {
    it('should call model.readById with the file ID', async () => {
      const fileId = 'fileId1'

      await gridFs.getFileStream(fileId)

      expect(docFileMock.readById).toHaveBeenCalledWith(fileId)
    })

    it('should fail if readById fails', async () => {
      const fileId = 'fileId1'
      docFileMock.readById.mockImplementationOnce(() => Promise.reject('Failed'))

      const call = gridFs.getFileStream(fileId)

      await expect(call).rejects.toBeDefined()
    })
  })

  describe('getFileContentType', () => {
    it('should pass file ID to findOne on document model', async () => {
      const fid = 'test-file-id'
      docFileMock.findOne.mockImplementationOnce((_, callback) => {
        callback(null, new Buffer(''))
      })

      await gridFs.getFileContentType(fid)

      expect(docFileMock.findOne).toHaveBeenCalled()
      expect(docFileMock.findOne.mock.calls[0][0]).toEqual({ _id: fid })
    })

    it('should resolve to the buffer passed to the callback', async () => {
      const ct = 'some-random-content/type'
      docFileMock.findOne.mockImplementationOnce((a, callback) => {
        callback(null, { contentType: ct })
      })

      const call = gridFs.getFileContentType('')

      await expect(call).resolves.toBe(ct)
    })

    it('should reject if error is passed to callback', async () => {
      docFileMock.findOne.mockImplementationOnce((_, callback) => {
        callback('some error', {})
      })

      const call = gridFs.getFileContentType('')

      await expect(call).rejects.toBeDefined()
    })

    it('should throw if findOne thros', async () => {
      docFileMock.findOne.mockImplementationOnce((_, callback) => {
        throw new Error()
      })

      const call = gridFs.getFileContentType('')

      await expect(call).rejects.toBeDefined()
    })

    it('No document found, no error, empty result. Expect rejection of promise', async () => {
      // NOTE: no error but empty result
      // Expect rejection
      docFileMock.findOne.mockImplementationOnce((_, callback) => callback(null, null))

      const call = gridFs.getFileContentType('')

      await expect(call).rejects.toBeDefined()
    })
  })

  describe('deleteFile', () => {
    it('should try to find the file using the name and findOne', async () => {
      const name = 'filename1'
      docFileMock.findOne.mockImplementationOnce((_, callback) => callback(null, { _id: 'someId' }))
      // unlink still returns the unlinked file
      docFileMock.unlinkById.mockImplementationOnce((_, callback) => callback(null, { _id: 'someId' }))

      await gridFs.deleteFile(name)

      expect(docFileMock.findOne.mock.calls[0][0]).toEqual({ filename: name })
    })

    it('should reject if there is an error whilst finding record', async () => {
      docFileMock.findOne.mockImplementationOnce((_, callback) => callback('some error!', { _id: 'someId' }))
      docFileMock.unlinkById.mockImplementationOnce((_, callback) => callback(null, null))

      const call = gridFs.deleteFile('')

      await expect(call).rejects.toBeDefined()
    })

    it('should try to delete the file by ID', async () => {
      const fileId = 'someId'
      docFileMock.findOne.mockImplementationOnce((_, callback) => callback(null, { _id: fileId }))
      // unlink still returns a result
      docFileMock.unlinkById.mockImplementationOnce((_, callback) => callback(null, { _id: fileId }))

      await gridFs.deleteFile('')

      expect(docFileMock.unlinkById.mock.calls[0][0]).toEqual(fileId)
    })

    it('should return the deleted file', async () => {
      const deleted = { _id: '' }
      docFileMock.findOne.mockImplementationOnce((_, callback) => callback(null, deleted))
      docFileMock.unlinkById.mockImplementationOnce((_, callback) => callback(null, deleted))

      const f = await gridFs.deleteFile('')

      expect(f).toBe(deleted)
    })

    it('should reject if there is an error whilst deleting the record', async () => {
      docFileMock.findOne.mockImplementationOnce((_, callback) => callback(null, { _id: 'someId' }))
      docFileMock.unlinkById.mockImplementationOnce((_, callback) => callback(' an unlink error!', null))

      const call = gridFs.deleteFile('')

      await expect(call).rejects.toBeDefined()
    })

    it('should use a single gridFs Instance for multiple calls', async () => {
      gridFsProvider = jest.fn(() => Promise.resolve({ model: docFileMock }))
      gridFs = new GridFsWrapper(gridFsProvider)
      docFileMock.write.mockImplementation((a, b, callback) => {
        callback(null, { _id: testId1 })
      })
      docFileMock.findOne.mockImplementation((_, callback) => callback(null, { _id: '' }))

      // unlink still returns a valid result
      docFileMock.unlinkById.mockImplementation((_, callback) => callback(null, { _id: '' }))

      await gridFs.saveFileBuffer(name, buf, contentType)
      await gridFs.deleteFile('')
      await gridFs.getFileStream('')

      expect(gridFsProvider).toHaveBeenCalledTimes(1)
    })
  })

  describe('deleteFileById', () => {
    it('should call unlinkById with the id', async () => {
      docFileMock.unlinkById.mockImplementationOnce((_, callback) => callback(null, { _id: 'fileId1' }))

      await gridFs.deleteFileById('fileId1')

      expect(docFileMock.unlinkById).toHaveBeenCalledWith('fileId1', expect.any(Function))
    })
    it('should throw when file not found', async () => {
      docFileMock.unlinkById.mockImplementationOnce((_, callback) => callback('null', {}))

      let withError = false
      try {
        await gridFs.deleteFileById('fileId1')
      } catch (error) {
        withError = true
      } finally {
        expect(withError).toEqual(true)
      }
    })
  })
})
