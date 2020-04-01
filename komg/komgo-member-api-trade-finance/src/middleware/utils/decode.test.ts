jest.mock('jsonwebtoken', () => ({
  decode: (someToken: String) => {
    return {
      sub: '1',
      preferred_username: 'superuser',
      given_name: 'Super',
      family_name: 'User',
      email: 'super@komgo.io',
      realm_access: {
        roles: ['manage-users']
      }
    } as IDecodedJWT
  }
}))
import decode from './decode'
import IDecodedJWT from './IDecodedJWT'

describe('Decode flow', () => {
  it('should return decoded jwt token', () => {
    const someToken = 'someToken'
    const user: IDecodedJWT = decode(someToken)
    expect(user.email).toEqual('super@komgo.io')
  })
})
