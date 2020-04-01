import 'jest'
import * as jestMock from 'jest-mock'
import * as ServerMock from 'mock-http-server'
import 'reflect-metadata'

import SessionDataAgent from '../../data-layer/data-agent/SessionDataAgent'
import JWSAgent from '../../data-layer/utils/JWSAgent'

import { SessionController } from './SessionController'

function mock(classType) {
  const mockType = jestMock.generateFromMetadata(jestMock.getMetadata(classType))
  return new mockType()
}

const serverRegistry = new ServerMock({ host: 'localhost', port: 9001 })
const sessionDataAgent = mock(SessionDataAgent)
const jwsAgent = mock(JWSAgent)

const registryBaseUrl = 'http://localhost:9001'
const mockRequestJWS = { jws: JSON.stringify({ staticId: 'staticId' }) }
const mockSession = {
  sessionId: 'test-uuid',
  staticId: 'test-static-id',
  merkle: 'test-merkle',
  metadataHash: 'test-hash',
  timestamp: '1000',
  activated: false
}
const mockedJWS = {
  staticId: 'test-static-id',
  merkle: 'test-merkle',
  metadataHash: 'test-hash',
  timestamp: '1000',
  docId: 'test doc id'
}
const companyRegistry = {
  getCompany: jest.fn(),
  getCompanyName: jest.fn().mockResolvedValue('companyName')
}
const docRegistry = {
  getTruffleContract: jest.fn(),
  getCompanyId: jest.fn().mockResolvedValue('test-static-id'),
  getHashAndTimestamp: jest.fn().mockResolvedValue([mockedJWS.merkle, mockedJWS.timestamp])
}

describe('SessionController', () => {
  let sessionController

  beforeEach(function(done) {
    serverRegistry.start(done)
    sessionController = new SessionController(registryBaseUrl, companyRegistry, sessionDataAgent, docRegistry, jwsAgent)
    jwsAgent.decodeAndVerify.mockReturnValue(mockedJWS)
    sessionDataAgent.getSession.mockReturnValue({
      sessionId: 'test-uuid',
      staticId: 'test-static-id'
    })
    reply(serverRegistry, 'GET', '/v0/registry/cache', 200, JSON.stringify([{ staticId: 'test-static-id' }]))
  })

  afterEach(function(done) {
    serverRegistry.stop(done)
  })

  describe('createSession', () => {
    it('should create session', async () => {
      sessionDataAgent.createSession.mockReturnValue(mockSession)
      const result = await sessionController.createSession(mockRequestJWS)
      expect(result).toEqual(mockSession)
    })
  })

  describe('activateSession', () => {
    it('should activate session', async () => {
      sessionDataAgent.updateSession.mockReturnValue({ ...mockSession, activated: true })

      const result = await sessionController.activateSession('', mockRequestJWS)
      expect(result).toEqual({ ...mockSession, activated: true })
    })

    it('should activate session', async () => {
      sessionDataAgent.updateSession.mockReturnValue({ ...mockSession, activated: true })

      const result = await sessionController.activateSession('', mockRequestJWS)
      expect(result).toEqual({ ...mockSession, activated: true })
    })

    it('should throw an error if session is active', async () => {
      sessionDataAgent.getSession.mockReturnValue(mockSession)
      await expect(sessionController.activateSession('', mockRequestJWS)).rejects.toEqual({
        errorObject: {
          errorCode: 'EVAL01',
          fields: undefined,
          message: 'Session is configured or activated already',
          origin: expect.any(String)
        },
        message: 'Session is configured or activated already',
        name: '',
        status: 409
      })
    })

    it('should throw an error if is document not exists on blockchain', async () => {
      reply(serverRegistry, 'GET', '/v0/registry/cache', 200, JSON.stringify([{}]))
      await expect(sessionController.activateSession('', mockRequestJWS)).rejects.toEqual({
        errorObject: {
          errorCode: 'EVAL01',
          fields: undefined,
          message: 'Document is not registered in blockchain',
          origin: expect.any(String)
        },
        message: 'Document is not registered in blockchain',
        name: '',
        status: 422
      })

      docRegistry.getCompanyId.mockResolvedValueOnce(null)
      await expect(sessionController.activateSession('', mockRequestJWS)).rejects.toEqual({
        errorObject: {
          errorCode: 'EVAL01',
          fields: undefined,
          message: 'Document is not registered in blockchain',
          origin: expect.any(String)
        },
        message: 'Document is not registered in blockchain',
        name: '',
        status: 422
      })
    })

    it('should throw an error if session is not belong to this company', async () => {
      reply(serverRegistry, 'GET', '/v0/registry/cache', 200, JSON.stringify([{ staticId: 'wrong-static-id' }]))

      await expect(sessionController.activateSession('', mockRequestJWS)).rejects.toEqual({
        errorObject: {
          errorCode: 'EVAL01',
          fields: undefined,
          message: 'You are not the owner of this document',
          origin: expect.any(String)
        },
        message: 'You are not the owner of this document',
        name: '',
        status: 422
      })
    })

    it('should throw an error if document hash is not registered in on blockchain', async () => {
      docRegistry.getHashAndTimestamp.mockResolvedValueOnce(['wrong-merkle', mockedJWS.timestamp])

      await expect(sessionController.activateSession('', mockRequestJWS)).rejects.toEqual({
        errorObject: {
          errorCode: 'EVAL01',
          fields: undefined,
          message: 'Document hash is not registered in blockchain',
          origin: expect.any(String)
        },
        message: 'Document hash is not registered in blockchain',
        name: '',
        status: 422
      })
    })
  })

  describe('deactivateSession', () => {
    it('should deactivate session', async () => {
      sessionDataAgent.getSession.mockReturnValue({ ...mockSession, activated: true })
      sessionDataAgent.updateSession.mockReturnValue({ ...mockSession, activated: false })

      const result = await sessionController.deactivateSession('', mockRequestJWS)
      expect(result).toEqual({ ...mockSession, activated: false })
    })

    it('should throw error if session is not active or not configured', async () => {
      await expect(sessionController.deactivateSession('', mockRequestJWS)).rejects.toEqual({
        errorObject: {
          errorCode: 'EVAL01',
          fields: undefined,
          message: 'Session is not configured',
          origin: expect.any(String)
        },
        message: 'Session is not configured',
        name: '',
        status: 409
      })

      sessionDataAgent.getSession.mockReturnValue(mockSession)
      await expect(sessionController.deactivateSession('', mockRequestJWS)).rejects.toEqual({
        errorObject: {
          errorCode: 'EVAL01',
          fields: undefined,
          message: 'Session is not active',
          origin: expect.any(String)
        },
        message: 'Session is not active',
        name: '',
        status: 409
      })
    })
  })

  describe('getSession', () => {
    it('should return session', async () => {
      sessionDataAgent.getSession.mockReturnValue({ ...mockSession, activated: true })
      const result = await sessionController.getSession('')
      expect(result).toEqual({ metadataHash: 'test-hash' })
    })

    it('should throw an error if session is not active', async () => {
      sessionDataAgent.getSession.mockReturnValue({ ...mockSession })
      await expect(sessionController.getSession('')).rejects.toEqual({
        errorObject: {
          errorCode: 'EVAL01',
          fields: undefined,
          message: 'The link in this document has been deactivated',
          origin: expect.any(String)
        },
        message: 'The link in this document has been deactivated',
        name: '',
        status: 409
      })
    })
  })

  describe('verifyDocument', () => {
    it('should verify document successfully', async () => {
      sessionDataAgent.getSession.mockReturnValue({ ...mockSession, activated: true })
      const result = await sessionController.verifyDocument('', { merkleHash: 'test-merkle' })
      expect(result).toEqual({
        companyName: 'companyName',
        registeredAt: '1000'
      })
    })

    it('should throw an error if session is not active', async () => {
      sessionDataAgent.getSession.mockReturnValue({ ...mockSession })
      await expect(sessionController.verifyDocument('', { merkleHash: 'test-merkle' })).rejects.toEqual({
        errorObject: {
          errorCode: 'EVAL01',
          fields: undefined,
          message: 'Session is not active',
          origin: expect.any(String)
        },
        message: 'Session is not active',
        name: '',
        status: 409
      })
    })

    it('should throw an error if document is not registered', async () => {
      sessionDataAgent.getSession.mockReturnValue({ ...mockSession, activated: true })
      await expect(sessionController.verifyDocument('', { merkleHash: 'wrong-merkle' })).rejects.toEqual({
        errorObject: {
          errorCode: 'EVAL01',
          fields: undefined,
          message:
            'The document is not registered on komgo network. Upload the document which contains the link you used to access this page',
          origin: expect.any(String)
        },
        message:
          'The document is not registered on komgo network. Upload the document which contains the link you used to access this page',
        name: '',
        status: 409
      })
    })
  })

  describe('addSession', () => {
    it('should call putSession', async () => {
      sessionDataAgent.putSession.mockReturnValue(mockSession)
      const sessionData = {
        merkle: 'merkle',
        metadataHash: 'metadataHash',
        timestamp: 'timestamp',
        activated: 'activated'
      }
      const request = {
        staticId: 'staticId',
        ...sessionData
      }
      await sessionController.putSession('sessionId', request)
      expect(sessionDataAgent.putSession).toHaveBeenCalledWith('staticId', 'sessionId', sessionData)
    })
  })

  function reply(server, method, path, status, body) {
    server.on({
      method,
      path,
      reply: {
        status,
        headers: { 'content-type': 'application/json' },
        body
      }
    })
  }
})
