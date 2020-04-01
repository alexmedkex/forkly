jest.mock('../../../utils/endpoints', () => ({
  NOTIFICATIONS_BASE_ENDPOINT: 'NOTIFICATIONS_BASE_ENDPOINT'
}))

import { getNotifications, markAsRead, markAllAsRead } from './actions'
import { initialState } from './reducer'
import { ActionType } from './types'

describe('Notification Actions', () => {
  let dispatchMock: any
  let apiMock: any
  const getState = (): any => initialState
  const httpGetAction = { type: '@http/GET_REQUEST' }
  const httpPatchAction = { type: '@http/PATCH_REQUEST' }

  beforeEach(() => {
    dispatchMock = jest.fn()
    apiMock = {
      get: jest.fn(() => httpGetAction),
      patch: jest.fn(() => httpPatchAction)
    }
  })

  describe('getNotifications()', () => {
    it('calls api.get with correct arguments', () => {
      getNotifications()(dispatchMock, getState, apiMock)

      expect(apiMock.get).toHaveBeenCalledWith('NOTIFICATIONS_BASE_ENDPOINT/notifications?offset=0&limit=5', {
        onSuccess: ActionType.GET_NOTIFICATIONS_SUCCESS,
        onError: ActionType.GET_NOTIFICATIONS_ERROR
      })
    })

    it('calls dispatch with the result of api.get() by getNotifications actions', () => {
      getNotifications()(dispatchMock, getState, apiMock)

      expect(dispatchMock).toHaveBeenCalledWith(httpGetAction)
    })
  })

  describe('markAsRead()', () => {
    const notificationId = '123'
    const isRead = true

    it('dispatches MARK_AS_READ action', () => {
      markAsRead(notificationId, isRead)(dispatchMock, getState, apiMock)

      expect(dispatchMock).toHaveBeenCalledWith({ type: ActionType.MARK_AS_READ, notificationId, isRead })
    })

    it('dispatches PATCH /notifications/is-read/:id request', () => {
      markAsRead(notificationId, isRead)(dispatchMock, getState, apiMock)

      expect(apiMock.patch.mock.calls[0][0]).toEqual('NOTIFICATIONS_BASE_ENDPOINT/notifications/is-read/123')
    })
  })

  describe('markAllAsRead()', () => {
    it('dispatches MARK_ALL_AS_READ action', () => {
      markAllAsRead()(dispatchMock, getState, apiMock)

      expect(dispatchMock).toHaveBeenCalledWith({ type: ActionType.MARK_ALL_AS_READ })
    })

    it('dispatches PATCH /notifications/is-read request', () => {
      markAllAsRead()(dispatchMock, getState, apiMock)

      expect(apiMock.patch.mock.calls[0][0]).toEqual('NOTIFICATIONS_BASE_ENDPOINT/notifications/is-read')
    })
  })
})
