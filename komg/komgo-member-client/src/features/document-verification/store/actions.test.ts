jest.mock('../../../utils/endpoints', () => ({
  MAGIC_LINK: 'MAGIC_LINK'
}))

import { verifyDocument } from './actions'
import { initialState } from './reducer'
import { DocumentVerificationActionType, IStatus } from './types'

const file = {
  status: IStatus.pending,
  hash: 'hash',
  key: 0,
  type: 'pdf',
  fileName: '001.pdf'
}

describe('Document Verification Actions', () => {
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

  describe('verifyDocument()', () => {
    it('should call api.get with correct arguments', () => {
      verifyDocument(file)(dispatchMock, getState, apiMock)

      expect(dispatchMock).toHaveBeenNthCalledWith(1, {
        type: DocumentVerificationActionType.VERIFY_DOCUMENT_ADD_FILE,
        payload: { file }
      })
      expect(apiMock.get).toHaveBeenCalledWith(`MAGIC_LINK/documents/${file.hash}`, {
        noAuth: true,
        type: DocumentVerificationActionType.VERIFY_DOCUMENT_REQUEST,
        onError: expect.any(Function),
        onSuccess: expect.any(Function)
      })
    })
  })
})
