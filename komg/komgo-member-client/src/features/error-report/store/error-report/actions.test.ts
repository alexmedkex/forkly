import { createTicket, storeRequest } from './actions'
import { initialState } from './reducer'
import { ErrorReportActionType } from '../types'

const req = {
  method: 'GET',
  url: '/test'
}

describe('Role Management Actions', () => {
  let dispatchMock: any
  let apiMock: any
  const getState = (): any => initialState
  const httpPostAction = { type: '@http/API_POST_REQUEST' }

  beforeEach(() => {
    dispatchMock = jest.fn()
    apiMock = {
      post: jest.fn(() => httpPostAction)
    }
  })

  describe('createRole()', () => {
    it('calls api.post with correct arguments', () => {
      createTicket('token', {
        subject: 'subject',
        comment: { body: 'description', uploads: {} },
        custom_fields: []
      })(dispatchMock, getState, apiMock)

      expect(apiMock.post).toHaveBeenCalledWith(`${process.env.REACT_APP_ZENDESK_BASE_URL}/api/v2/requests.json`, {
        data: {
          request: {
            subject: 'subject',
            comment: { body: 'description', uploads: [] },
            custom_fields: []
          }
        },
        headers: { Authorization: 'Bearer token' },
        onSuccess: ErrorReportActionType.CREATE_ERROR_REPORT_SUCCESS,
        onError: ErrorReportActionType.CREATE_ERROR_REPORT_FAILURE,
        type: ErrorReportActionType.CREATE_ERROR_REPORT_REQUEST
      })
    })
  })

  describe('storeRequest()', () => {
    it('should create store requests action', () => {
      const result = storeRequest(req)

      expect(result).toEqual({
        type: ErrorReportActionType.STORE_REQUEST,
        payload: req
      })
    })
  })
})
