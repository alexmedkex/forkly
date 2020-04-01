const decode = jest.fn((someToken: String) => someToken)
jest.mock('jsonwebtoken', () => ({
  decode
}))
import { decodeBearerToken } from './decodeBearerToken'

describe('Decode flow', () => {
  beforeEach(() => {
    decode.mockClear()
  })
  it('should return decoded jwt token', () => {
    const someToken = 'Bearer 34567'
    const decodedToken = decodeBearerToken(someToken)
    expect(decodedToken).toEqual(someToken.substr(7))
  })
  it('should rejects', async () => {
    decode.mockImplementation(() => null)
    const someToken = 'Token1234567'
    try {
      decodeBearerToken(someToken)
    } catch (e) {
      expect(e).toEqual({
        errorObject: {
          errorCode: 'EAUT01',
          fields: {},
          message: 'invalid JWT token',
          origin: process.env.CONTAINER_HOSTNAME || '<unknown-origin>'
        },
        message: 'invalid JWT token',
        name: '',
        status: 400
      })
    }
  })
})
