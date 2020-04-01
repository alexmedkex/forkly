jest.mock('../../features/notifications/store/actions', () => ({
  fetchNotificationsAsync: () => ({ type: 'fetchNotifications' }),
  displayToast: jest.fn()
}))

import { initialUIState } from './reducer'
import { ApiAction, Method, CALL_API } from '../../utils/http'
import { USERS_BASE_ENDPOINT } from '../../utils/endpoints'

import {
  setLoading,
  profileSuccess,
  getUsersError,
  getPermissions,
  permissionsSuccess,
  getProfileAndPermissons,
  profileRecivedProxy,
  setSidebarExtended,
  triggerError500,
  updateUserSettings,
  resetPassword
} from './actions'
import { ActionType, User } from './types'
import { makeTestStore } from '../../utils/test-helpers'

describe('UI Actions', () => {
  const UserMock: User = {
    id: '2',
    username: 'Rocky',
    firstName: 'Silverster',
    lastName: 'Stallone',
    email: 'email@msn.com',
    createdAt: 1533295003646,
    company: 'Oil sellers'
  }

  describe('getProfileAndPermisson()', () => {
    it('should create an action creator to getProfileAndPermisson request', async () => {
      // Arrange
      const store = makeTestStore()

      const expectedAction: ApiAction = {
        type: ActionType.GetProfileRequest,
        payload: '',
        headers: {},
        CALL_API,
        meta: {
          method: Method.GET,
          url: `${USERS_BASE_ENDPOINT}/profile`,
          params: undefined,
          responseType: 'json',
          onSuccess: profileRecivedProxy,
          onError: ActionType.GetProfileFailure
        }
      }

      // Act
      const result = await store.dispatch<any>(getProfileAndPermissons())
      // Assert
      expect(result).toEqual(expectedAction)
    })
  })

  describe('profileRecivedProxy()', () => {
    it('should call dispatch', () => {
      // Arrange
      const data = { data: 'data' }
      const mockGet = jest.fn()

      // Act
      const result = profileRecivedProxy(data)
      result(mockGet)

      // Assert
      expect(mockGet).toBeCalled()
    })
  })

  describe('profileSuccess()', () => {
    it('should create a profile received action', () => {
      // Arrange
      const profile: User = UserMock

      // Act
      const result = profileSuccess(profile)

      // Assert
      expect(result).toEqual({ payload: profile, type: ActionType.GetProfileSuccess })
    })
  })

  describe('getUsersError()', () => {
    it('should create a usersError', () => {
      // Arrange
      const error = 'error'

      // Act
      const result = getUsersError(error)

      // Assert
      expect(result).toEqual({ payload: error, type: ActionType.FETCH_USERS_ERROR })
    })
  })

  describe('getPermissions()', () => {
    it('should create a dispatch ', () => {
      // Arrange

      const data = { data: 'data' }
      const mockGet = jest.fn()
      const api = { get: mockGet, post: jest.fn(), put: jest.fn(), delete: jest.fn(), patch: jest.fn() }

      // Act
      const result = getPermissions(data)
      result(() => true, jest.fn(), api)

      // Assert
      expect(mockGet).toBeCalled()
    })
  })

  describe('permissionsSuccess()', () => {
    it('should create a profile received action', () => {
      // Arrange

      const type: string = '@@ui/PERMISSIONS_SUCCESS'
      const payload: object = { data: 'data' }

      // Act
      const result = permissionsSuccess(payload)

      // Assert

      expect(result).toEqual({ type, payload })
    })
  })

  describe('setLoading()', () => {
    it('should return an action to set loading to true when called with true', () => {
      // Arrange
      const expectation = {
        type: ActionType.LOADING,
        payload: true
      }

      // Act
      const result = setLoading(true)

      // Assert
      expect(result).toEqual(expectation)
    })

    it('should return an action to set loading to false when called with false', () => {
      // Arrange
      const expectation = {
        type: ActionType.LOADING,
        payload: false
      }

      // Act
      const result = setLoading(false)

      // Assert
      expect(result).toEqual(expectation)
    })
  })

  describe('setSiderbarExtended()', () => {
    const getState: any = null
    const api: any = null

    it('should dispatch SET_SIDEBAR_EXTENDED action', () => {
      // Arrange
      const dispatchMock = jest.fn()
      const expectation = {
        type: ActionType.SET_SIDEBAR_EXTENDED,
        payload: false
      }

      // Act
      const action = setSidebarExtended(false)

      // Assert
      expect(action).toMatchObject({
        type: ActionType.SET_SIDEBAR_EXTENDED,
        payload: false
      })
    })
  })

  describe('triggerError500()', () => {
    it('should call USERS_BASE_ENDPOINT/misc/error-500', async () => {
      const store = makeTestStore()

      const expectedAction: ApiAction = {
        type: ActionType.TRIGGER_ERROR_500_REQUEST,
        payload: '',
        headers: {},
        CALL_API,
        meta: {
          method: Method.GET,
          url: `${USERS_BASE_ENDPOINT}/misc/error-500`,
          params: undefined,
          responseType: 'json',
          onSuccess: ActionType.TRIGGER_ERROR_500_SUCCESS,
          onError: ActionType.TRIGGER_ERROR_500_FAILURE
        }
      }

      const result = await store.dispatch<any>(triggerError500())

      expect(result).toEqual(expectedAction)
    })
  })

  describe('Settings Actions', () => {
    const dispatchMock = jest.fn()
    const getState = (): any => initialUIState
    const httpGetAction = { type: '@http/API_GET_REQUEST' }
    const httpPutAction = { type: '@http/API_PUT_REQUEST' }
    const apiMock: any = {
      get: jest.fn(() => httpGetAction),
      put: jest.fn(() => httpPutAction)
    }

    beforeEach(() => {
      jest.clearAllMocks()
    })

    describe('updateUserSettings()', () => {
      it('calls api.put with correct arguments', () => {
        const data = { sendTaskNotificationsByEmail: false }
        updateUserSettings('userId', data)(dispatchMock, getState, apiMock)

        expect(apiMock.put).toHaveBeenCalledWith(`${USERS_BASE_ENDPOINT}/users/userId/settings`, {
          type: ActionType.UpdateSettingsRequest,
          data,
          onSuccess: expect.any(Function),
          onError: ActionType.UpdateSettingsFailure
        })
      })
    })

    describe('resetPassword()', () => {
      it('calls api.put with correct arguments', () => {
        const data = {
          currentPassword: 'currentPassword',
          newPassword: 'newPassword',
          confirmNewPassword: 'newPassword'
        }
        resetPassword('userId', data)(dispatchMock, getState, apiMock)

        expect(apiMock.put).toHaveBeenCalledWith(`${USERS_BASE_ENDPOINT}/users/userId/reset-password`, {
          type: ActionType.ResetPasswordRequest,
          data,
          onSuccess: expect.any(Function),
          onError: ActionType.ResetPasswordFailure
        })
      })
    })
  })
})
