import 'reflect-metadata'

import Uploader from './Uploader'

const MockExpressRequest = require('mock-express-request')

const mockMulterSingle = jest.fn()
mockMulterSingle.mockImplementation((req, _, cb) => cb(null))

const mockReq = new MockExpressRequest({
  method: 'POST',
  url: '/document-templates/compile',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'multipart/form-data;'
  },
  res: { set: jest.fn(), write: jest.fn() }
})

describe('Uploader', () => {
  let uploader
  beforeEach(() => {
    uploader = new Uploader(undefined, mockMulterSingle)
  })

  it('should throw if multer throws', async () => {
    mockMulterSingle.mockImplementationOnce(() => {
      throw new Error('')
    })

    const call = () => uploader.upload(mockReq)

    await expect(call()).rejects.toBeDefined()
  })

  it('should call multer with request', async () => {
    mockMulterSingle.mockImplementation((req, _, cb) => cb(null))

    await uploader.upload(mockReq)

    expect(mockMulterSingle).toHaveBeenCalledTimes(1)
    expect(mockMulterSingle.mock.calls[0][0]).toBe(mockReq)
  })

  it('should resolve to request in arguments if there is no error', async () => {
    const fakeReq = { ...mockReq }

    const call = () => uploader.upload(fakeReq)

    await expect(call()).resolves.toBe(fakeReq)
  })

  it('should reject if there is an error messge', async () => {
    mockMulterSingle.mockImplementationOnce((req, _, cb) => cb('some error'))

    const call = () => uploader.upload(mockReq)

    await expect(call()).rejects.toBeDefined()
  })
})
