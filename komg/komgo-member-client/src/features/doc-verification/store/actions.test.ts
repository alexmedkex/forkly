jest.mock('../../../utils/endpoints', () => ({
  MAGIC_LINK: 'MAGIC_LINK'
}))

import { getSession, verifyDocument } from './actions'
import { initialState } from './reducer'
import { DocumentVerificationActionType } from './types'

describe('License Management Actions', () => {
  const dispatchMock = jest.fn()
  const getState = (): any => initialState
  const httpGetAction = { type: '@http/API_GET_REQUEST' }
  const httpPostAction = { type: '@http/API_POST_REQUEST' }
  const apiMock = {
    get: jest.fn(() => httpGetAction),
    post: jest.fn(() => httpPostAction),
    patch: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }

  describe('getSession()', () => {
    it('calls api.get with correct arguments', () => {
      getSession('sessionId')(dispatchMock, getState, apiMock)

      expect(apiMock.get).toHaveBeenCalledWith('MAGIC_LINK/session/sessionId', {
        noAuth: true,
        type: DocumentVerificationActionType.GET_SESSION_REQUEST,
        onSuccess: DocumentVerificationActionType.GET_SESSION_SUCCESS,
        onError: DocumentVerificationActionType.GET_SESSION_FAILURE
      })
    })
  })

  describe('verifyDocument()', () => {
    it('calls api.post with correct arguments', () => {
      verifyDocument('sessionId', 'merkleHash')(dispatchMock, getState, apiMock)

      expect(apiMock.post).toHaveBeenCalledWith('MAGIC_LINK/session/sessionId/verify', {
        data: { merkleHash: 'merkleHash' },
        noAuth: true,
        type: DocumentVerificationActionType.VERIFY_DOCUMENT_REQUEST,
        onSuccess: DocumentVerificationActionType.VERIFY_DOCUMENT_SUCCESS,
        onError: DocumentVerificationActionType.VERIFY_DOCUMENT_FAILURE
      })
    })
  })
})
