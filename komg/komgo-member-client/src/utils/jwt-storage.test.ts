import {
  KeycloakError,
  KeycloakFlow,
  KeycloakInitOptions,
  KeycloakLoginOptions,
  KeycloakProfile,
  KeycloakPromise,
  KeycloakResponseMode,
  KeycloakResponseType
} from 'keycloak-js'

jest.mock('./storage-item', () => ({
  LocalStorageItem: jest.fn((key: any) => ({
    storageKey: key,
    add: jest.fn(),
    get: jest.fn(() => (key === 'JWT_timeSkew' ? 12 : 'test value')),
    remove: jest.fn()
  }))
}))

import { JwtStorage } from './jwt-storage'

const testValue = 'test value'

describe('JwtStorage', () => {
  let jwt: JwtStorage

  beforeAll(async () => {
    jest.resetModules()
    const JwtStorage = (await import('./jwt-storage')).JwtStorage
    jwt = new JwtStorage()
  })

  it('should change JWT_token field', async () => {
    jwt.token = testValue

    expect(jwt.pToken.add).toHaveBeenCalledWith(testValue)
  })

  it('should change JWT_refreshToken field', () => {
    jwt.refreshToken = testValue

    expect(jwt.pRefreshToken.add).toHaveBeenCalledWith(testValue)
  })

  it('should change JWT_idToken field', () => {
    jwt.idToken = testValue

    expect(jwt.pIdToken.add).toHaveBeenCalledWith(testValue)
  })

  it('should change JWT_timeSkew field', () => {
    jwt.timeSkew = 10

    expect(jwt.pTimeSkew.add).toHaveBeenCalledWith('10')
  })

  it('should get JWT_token field', () => {
    jwt.token = testValue
    const test = jwt.token

    expect(test).toEqual(testValue)
    expect(jwt.pToken.get).toHaveBeenCalled()
  })

  it('should get JWT_refreshToken field', () => {
    jwt.refreshToken = testValue
    const test = jwt.refreshToken

    expect(test).toEqual(testValue)
    expect(jwt.pRefreshToken.get).toHaveBeenCalled()
  })

  it('should get JWT_idToken field', () => {
    jwt.idToken = testValue
    const test = jwt.idToken

    expect(test).toEqual(testValue)
    expect(jwt.pIdToken.get).toHaveBeenCalled()
  })

  it('should get JWT_timeSkew field', () => {
    jwt.timeSkew = 12
    const test = jwt.timeSkew

    expect(test).toEqual(12)
    expect(jwt.pTimeSkew.get).toHaveBeenCalled()
  })

  it('should set all fields', () => {
    const options: Keycloak.KeycloakInstance = {
      token: testValue,
      idToken: testValue,
      refreshToken: testValue,
      timeSkew: 10,
      init: (initOptions: KeycloakInitOptions) => null,
      login: (options?: KeycloakLoginOptions) => null,
      logout: (options?: any) => null,
      register: (options?: any) => null,
      accountManagement: () => null,
      createLoginUrl: (options?: KeycloakLoginOptions) => null,
      createLogoutUrl: (options?: any) => null,
      createRegisterUrl: (options?: KeycloakLoginOptions) => null,
      createAccountUrl: () => null,
      isTokenExpired: (minValidity?: number) => null,
      updateToken: (minValidity: number) => null,
      clearToken: () => null,
      hasRealmRole: (role: string) => null,
      hasResourceRole: (role: string, resource?: string) => null,
      loadUserProfile: () => null,
      loadUserInfo: () => null
    }
    jwt.setAll(options)

    expect(jwt.pToken.add).toHaveBeenCalledTimes(3)
    expect(jwt.pIdToken.add).toHaveBeenCalledTimes(3)
    expect(jwt.pRefreshToken.add).toHaveBeenCalledTimes(3)
    expect(jwt.pTimeSkew.add).toHaveBeenCalledTimes(3)
  })

  it('should clear all fields', () => {
    jwt.clearAll()

    expect(jwt.pToken.get).toHaveBeenCalledTimes(1)
    expect(jwt.pIdToken.get).toHaveBeenCalledTimes(1)
    expect(jwt.pRefreshToken.get).toHaveBeenCalledTimes(1)
    expect(jwt.pTimeSkew.get).toHaveBeenCalledTimes(1)
  })
})
