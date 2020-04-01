import 'reflect-metadata'

const mockSession = {
  sessionId: 'test-uuid',
  staticId: 'test-static-id',
  merkle: 'test-mercle',
  metadataHash: 'test-hash',
  timestamp: 'test date',
  activated: false
}

const mockNewData = {
  merkle: 'new mercle',
  metadataHash: 'new hash',
  timestamp: 'new date',
  activated: true
}

const mockSessionNotFound = {
  message: 'Session not found',
  status: 404,
  name: '',
  errorObject: {
    errorCode: 'EVAL01',
    fields: undefined,
    message: 'Session not found',
    origin: expect.any(String)
  }
}

const create = jest.fn(({ staticId, sessionId }) => ({ staticId, sessionId }))
const findOne = jest.fn(({ sessionId }) => (sessionId === mockSession.sessionId ? mockSession : null))
const findOneAndUpdate = jest.fn((_, { $set: updatedData }) => ({ ...mockSession, ...updatedData }))

jest.mock('../models/Session', () => ({
  Session: { create, findOne, findOneAndUpdate }
}))

jest.mock('uuidv4', () => () => 'test-uuid')

import SessionDataAgent from './SessionDataAgent'

describe('SessionDataAgent', () => {
  let sessionDataAgent
  beforeEach(() => {
    sessionDataAgent = new SessionDataAgent()
    create.mockClear()
    findOne.mockClear()
    findOneAndUpdate.mockClear()
  })

  it('should create session', async () => {
    const result = await sessionDataAgent.createSession('staticId')
    expect(result).toEqual({ staticId: 'staticId', sessionId: 'test-uuid' })
  })

  it('should return session', async () => {
    const result = await sessionDataAgent.getSession('test-uuid')
    expect(result).toEqual(mockSession)
  })

  it('should throw error if session does not exists', async () => {
    await expect(sessionDataAgent.getSession('wrong session id')).rejects.toEqual(mockSessionNotFound)
  })

  it('should update session', async () => {
    const result = await sessionDataAgent.updateSession('test-uuid', mockNewData)
    expect(result).toEqual({ ...mockSession, ...mockNewData })
  })

  it('should throw error if session does not exists on update', async () => {
    await expect(sessionDataAgent.updateSession('wrong session id', {})).rejects.toEqual(mockSessionNotFound)
  })

  it('should put session', async () => {
    const result = await sessionDataAgent.putSession('test-static-id', 'test-session-id', mockNewData)
    expect(result).toEqual({
      staticId: 'test-static-id',
      sessionId: 'test-session-id',
      ...mockNewData
    })
  })
})
