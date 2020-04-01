import 'reflect-metadata'
import Uploader from './Uploader'

// tslint:disable-next-line:no-implicit-dependencies
const MockExpressRequest = require('mock-express-request')

const mockMulterSingle = jest.fn()
mockMulterSingle.mockImplementation((req, _, cb) => cb(null))

const mockReq = new MockExpressRequest({
  method: 'POST',
  url: '/some-url',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'multipart/form-data;'
  },
  res: { set: jest.fn(), write: jest.fn() },
  body: { field: '{"data": "test"}' }, // multer will prepare this
  file: {} // multer will prepare this
})

interface IData {
  data: string
}

describe('Uploader', () => {
  let uploader: Uploader
  beforeEach(() => {
    uploader = new Uploader(undefined, mockMulterSingle)
  })

  it('should throw if multer throws', async () => {
    mockMulterSingle.mockImplementationOnce(() => {
      throw new Error('')
    })

    const call = () => uploader.resolveMultipartData(mockReq, 'field')

    await expect(call()).rejects.toBeDefined()
  })

  it('should call multer with request', async () => {
    mockMulterSingle.mockImplementation((req, _, cb) => cb(null))

    await uploader.resolveMultipartData(mockReq, 'field')

    expect(mockMulterSingle).toHaveBeenCalledTimes(1)
    expect(mockMulterSingle.mock.calls[0][0]).toBe(mockReq)
  })

  it('should resolve to data in request if there is no error', async () => {
    const resp = {
      file: mockReq.file,
      data: JSON.parse(mockReq.body.field)
    }

    const call = () => uploader.resolveMultipartData(mockReq, 'field')

    await expect(call()).resolves.toEqual(resp)
  })

  it('should reject if there is an error messge', async () => {
    mockMulterSingle.mockImplementationOnce((req, _, cb) => cb('some error'))

    const call = () => uploader.resolveMultipartData(mockReq, 'field')

    await expect(call()).rejects.toBeDefined()
  })
})
