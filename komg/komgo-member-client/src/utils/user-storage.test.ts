import { getItem, setItem, createUserSpecificStorage, getRealmNameFromJWT, getRealmName } from './user-storage'
import { JWT } from './jwt-storage'
import { fakeJWTIdToken } from '../store/common/faker'

describe('get and set Item', () => {
  it('gets null if not set', () => {
    expect(getItem('test-item-id-1')).toEqual(null)
  })
  it('gets an item if set', () => {
    setItem('test-item-id-2', { content: 'test-item' })

    expect(getItem('test-item-id-2')).toEqual({ content: 'test-item' })
  })
  it('overrides an item previously set', () => {
    setItem('test-item-id-3', { content: 'test-item-1' })
    setItem('test-item-id-3', { content: 'test-item-2' })

    expect(getItem('test-item-id-3')).toEqual({ content: 'test-item-2' })
  })
  describe('createUserSpecificStorage', () => {
    it('sets the same ID twice for different users without overriding', () => {
      const userStorage1 = createUserSpecificStorage(
        { idToken: fakeJWTIdToken({ email: 'mmatthews@komgo.io' }) } as any,
        localStorage
      )
      const userStorage2 = createUserSpecificStorage(
        { idToken: fakeJWTIdToken({ email: 'lphilby@komgo.io' }) } as any,
        localStorage
      )

      userStorage1.setItem('item-id', '123')
      userStorage2.setItem('item-id', '567')

      expect(userStorage1.getItem('item-id')).toEqual('123')
      expect(userStorage2.getItem('item-id')).toEqual('567')
    })
    it('updates an id if set twice', () => {
      const userStorage1 = createUserSpecificStorage(JWT, localStorage)

      userStorage1.setItem('item-id', '123')
      userStorage1.setItem('item-id', '567')

      expect(userStorage1.getItem('item-id')).toEqual('567')
    })
    it('should pick up the first well defined idToken ', () => {
      JWT.idToken = undefined

      // id is undefined,
      const userStorage1 = createUserSpecificStorage(JWT, localStorage)

      // id is set later (async), but before setItem
      JWT.idToken = '123'
      userStorage1.setItem('item-id', 'abc')

      expect(userStorage1.getItem('item-id')).toEqual('abc')
    })
  })
})

describe('getRealmNameFromJWT', () => {
  it('should return the part after the last slash of the issue claim', () => {
    localStorage.setItem(
      'JWT_token',
      fakeJWTIdToken({
        email: 'some@email',
        exp: 1554540588448,
        iss: 'http://localhost:10070/auth/realms/realmName'
      })
    )
    expect(getRealmNameFromJWT()).toEqual('realmName')
  })
  it('should return empty string if JWT is not set', () => {
    localStorage.setItem('JWT_token', '')
    expect(getRealmNameFromJWT()).toEqual('')
  })
})

describe('getRealmName', () => {
  beforeEach(() => {
    process.env.REACT_APP_KEYCLOAK_REALM_NAME = 'KOMGO'
    process.env.REACT_APP_IS_LMS_NODE = 'true'
    localStorage.setItem(
      'JWT_token',
      fakeJWTIdToken({
        email: 'some@email',
        exp: 1554540588448,
        iss: 'http://localhost:10070/auth/realms/realmName'
      })
    )
  })

  it('should return realm name from JWT for LMS', () => {
    expect(getRealmName()).toEqual('realmName')
  })

  it('should return realm name env var for non-LMS', () => {
    process.env.REACT_APP_IS_LMS_NODE = 'false'
    expect(getRealmName()).toEqual('KOMGO')
  })
})
