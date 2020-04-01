jest.mock('jsonwebtoken', () => ({
  decode: (someToken: string) => {
    return someToken
  }
}))
import decode from './decode'

describe('Decode flow', () => {
  it('should return decoded jwt token', () => {
    const someToken = 'Token123'
    const decodedToken = decode(someToken)
    expect(decodedToken).toEqual(someToken)
  })
})
