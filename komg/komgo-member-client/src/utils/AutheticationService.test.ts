import { AutheticationService } from './AutheticationService'

describe('AutheticationService', () => {
  let authService
  let pollingServiceMock
  let keycloakMock
  let jwtStorageMock

  beforeEach(() => {
    pollingServiceMock = {
      actions: [],
      start: jest.fn(),
      stop: jest.fn()
    }
    keycloakMock = {
      init: jest.fn(() => keycloakPromiseMock(true)),
      updateToken: jest.fn(() => keycloakPromiseMock(true)),
      isTokenExpired: jest.fn(() => false),
      login: jest.fn(),
      logout: jest.fn(() => keycloakPromiseMock(true))
    }
    jwtStorageMock = {
      setAll: jest.fn(),
      clearAll: jest.fn()
    }
    authService = new AutheticationService(pollingServiceMock, keycloakMock, jwtStorageMock)
  })

  describe('authenticate', () => {
    it('should call keycloak.init() with check-sso if storage is empty', async () => {
      await authService.authenticate()

      expect(keycloakMock.init).toHaveBeenLastCalledWith({ onLoad: 'check-sso' })
    })
    it('should call keycloak.init() with a token if there is saved JWT', async () => {
      const auth = {
        token: 'token',
        refreshToken: 'refreshToken',
        idToken: 'idToken',
        timeSkew: 12
      }
      Object.assign(jwtStorageMock, auth)

      await authService.authenticate()

      expect(keycloakMock.init).toHaveBeenLastCalledWith(auth)
    })
    it('should call jwtStorage.setAll() with a keycloak instance', async () => {
      await authService.authenticate()

      expect(jwtStorageMock.setAll).toHaveBeenLastCalledWith(keycloakMock)
    })
    it('should call jwtStorage.clearAll() if authhentication fails', async () => {
      keycloakMock.init.mockReturnValueOnce(keycloakPromiseMock(false))

      await authService.authenticate()

      expect(jwtStorageMock.clearAll).toHaveBeenCalled()
    })
    it('should call keycloak.login() if authhentication fails', async () => {
      keycloakMock.init.mockReturnValueOnce(keycloakPromiseMock(false))

      await authService.authenticate()

      expect(keycloakMock.login).toHaveBeenCalled()
    })
  })

  describe('startJWTRefresh', () => {
    it('should call pollingService.start()', () => {
      authService.startJWTRefresh()

      expect(pollingServiceMock.start).toHaveBeenCalled()
    })
  })

  describe('stopJWTRefresh', () => {
    it('should call pollingService.stop()', () => {
      authService.stopJWTRefresh()

      expect(pollingServiceMock.stop).toHaveBeenCalled()
    })
  })

  describe('refreshJWT', () => {
    it('should call keycloak.updateToken() if token has expired', async () => {
      keycloakMock.isTokenExpired.mockReturnValueOnce(true)

      await authService.refreshJWT()

      expect(keycloakMock.updateToken).toHaveBeenLastCalledWith(30)
    })
    it('should not call keycloak.updateToken() if token is valid', async () => {
      await authService.refreshJWT()

      expect(keycloakMock.updateToken).not.toHaveBeenCalled()
    })
    it('should call keycloak.logout() if token falied', async () => {
      keycloakMock.isTokenExpired.mockReturnValueOnce(true)
      keycloakMock.updateToken.mockReturnValueOnce(keycloakPromiseMock(undefined, 'error'))

      await expect(authService.refreshJWT()).rejects.toBe('error')

      expect(keycloakMock.logout).toHaveBeenCalled()
    })
  })

  describe('getJWT', () => {
    it('should return token from jwtStorage', async () => {
      jwtStorageMock.token = 'my-token'
      const result = await authService.getJWT()

      expect(result).toBe('my-token')
    })
  })
})

const keycloakPromiseMock = (successValue?, errorValue?) => ({
  success: cb => {
    if (successValue !== undefined) {
      cb(successValue)
    }
    return {
      error: cb => errorValue !== undefined && cb(errorValue)
    }
  }
})
