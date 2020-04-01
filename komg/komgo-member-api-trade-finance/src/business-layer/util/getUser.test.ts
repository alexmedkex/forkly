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
import decode from '../../middleware/utils/decode'
import IUser from '../IUser'
import getUser from './getUser'
import IDecodedJWT from '../../middleware/utils/IDecodedJWT'

describe('getUser from decoded flow', () => {
  it('should return decoded jwt token', () => {
    const someToken = 'someToken'
    const user: IUser = getUser(decode(someToken))
    expect(user.email).toEqual('super@komgo.io')
  })
})
