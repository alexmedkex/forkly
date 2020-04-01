const mockGet = jest.fn(() => ({ status: 200, data: { public_key: 'dummy public key' } }))

jest.mock('axios', () => ({
  default: {
    get: mockGet
  }
}))

const keycloakMock = jest.fn()
jest.mock('keycloak-connect', () => keycloakMock)

import { ErrorCode } from '@komgo/error-utilities'
import { ErrorUtils } from '@komgo/microservice-config'

import memoryStore from '../../utils/memoryStore'

import { getKeycloak, keycloakMiddlewareWrapper, keycloakProtectMiddlewareWrapper } from './keycloak'

describe('keycloak', () => {
  process.env.KEYCLOAK_CLIENT_ID = 'KEYCLOAK_CLIENT_ID'
  process.env.KEYCLOAK_AUTH_URL = 'KEYCLOAK_AUTH_URL'
  process.env.KEYCLOAK_SERVER_AUTH_URL = 'KEYCLOAK_SERVER_AUTH_URL'

  let requestMock
  let nextMock
  let respMock
  let respJsonMock
  let respEndMock

  beforeEach(() => {
    requestMock = { komgoContext: {} }
    respEndMock = jest.fn()
    respJsonMock = jest.fn(() => ({
      end: respEndMock
    }))
    respMock = {
      status: jest.fn(() => ({
        json: respJsonMock,
        end: respEndMock
      })),
      end: respEndMock
    }
    nextMock = jest.fn()
  })

  describe('getKeycloak', () => {
    it('should init with a public key from Keycloak', async () => {
      await getKeycloak('KOMGO')

      expect(keycloakMock).toHaveBeenCalledWith(
        {
          store: memoryStore
        },
        {
          clientId: 'KEYCLOAK_CLIENT_ID',
          public: true,
          realm: 'KOMGO',
          realmPublicKey: 'dummy public key',
          serverUrl: 'KEYCLOAK_AUTH_URL',
          'ssl-required': 'external'
        }
      )
    })

    it('should call axios.get with correct arguments', async () => {
      await getKeycloak('realmName')

      expect(mockGet).toHaveBeenCalledWith('KEYCLOAK_SERVER_AUTH_URL/realms/realmName/')
    })

    it('should throw error if public key request fails', async () => {
      mockGet.mockRejectedValueOnce(new Error('oops'))

      expect(getKeycloak('realmName')).rejects.toEqual(
        ErrorUtils.internalServerException(ErrorCode.ConnectionKeycloak, 'Internal Server Error')
      )
    })
  })

  describe('keycloakMiddlewareWrapper', () => {
    it('should call keycloak middlewares if tenant object exists in komgoContext', () => {
      const kcMiddleware = jest.fn()
      requestMock.komgoContext.tenant = {
        keycloakInstance: {
          middleware: () => [kcMiddleware]
        }
      }
      keycloakMiddlewareWrapper(requestMock, respMock, nextMock)
      expect(kcMiddleware).toHaveBeenCalledWith(requestMock, respMock, expect.any(Function))
    })
    it('should call next if tenant object does not exist', () => {
      keycloakMiddlewareWrapper(requestMock, respMock, nextMock)
      expect(nextMock).toHaveBeenCalledWith()
    })
  })

  describe('keycloakProtectMiddlewareWrapper', () => {
    it('should call keycloak middlewares if tenant object exists in komgoContext', () => {
      const protectMiddleware = jest.fn()
      requestMock.komgoContext.tenant = {
        keycloakInstance: {
          protect: () => protectMiddleware
        }
      }
      keycloakProtectMiddlewareWrapper(requestMock, respMock, nextMock)
      expect(protectMiddleware).toHaveBeenCalledWith(requestMock, respMock, nextMock)
    })
  })
})
