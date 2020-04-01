import { Map } from 'immutable'

import reducer, { initialUIState } from './reducer'
import { ActionType, UIState, UIStateFields, Profile } from './types'

const mockUser = {
  id: '1',
  username: 'Arnold',
  firstname: 'Arnold',
  lastname: 'Schwarzenegger',
  email: 'email@msn.com',
  admin: true,
  isLoggedIn: true,
  createdAt: new Date(2018, 1, 1),
  modifiedAt: new Date(2018, 1, 1)
}
const mockSettings = {
  userId: 'userId',
  sendInformationNotificationsByEmail: true,
  sendTaskNotificationsByEmail: true
}

describe('UIReducer', () => {
  it('should be initialised correctly', () => {
    // Arrange
    const expectedInitialUIState: UIState = Map({
      loading: false,
      sidebarExtended: false,
      isActiveUser: true,
      usersAssigned: [],
      users: []
    } as UIStateFields)

    // Act
    const newState = reducer(undefined as any, { type: 'example' })

    // Assert
    expect(newState).toEqual(expectedInitialUIState)
    expect(newState.get('loading')).toEqual(false)
    expect(newState.get('isActiveUser')).toEqual(true)
  })

  it('should change loading state to true when loading action passed in', () => {
    // Arrange
    const setLoadingTrue = {
      type: ActionType.LOADING,
      payload: true
    }

    // Act
    const newState = reducer(initialUIState, setLoadingTrue)

    // Assert
    expect(newState.get('loading')).toEqual(true)
  })

  it('should change loading state to false when loading action passed in', () => {
    // Arrange
    const setLoadingFalse = {
      type: ActionType.LOADING,
      payload: false
    }

    // Act
    const newState = reducer(initialUIState, setLoadingFalse)

    // Assert
    expect(newState.get('loading')).toEqual(false)
  })

  it('should change user state to mockUser when profileSuccess action passed in', () => {
    // Arrange
    const GetProfile = {
      type: ActionType.GetProfileSuccess,
      payload: mockUser
    }

    // Act
    const newState = reducer(initialUIState, GetProfile)

    // Assert
    expect(newState.get('profile')).toEqual(mockUser)
    expect(newState.get('error')).toEqual(null)
  })

  it('should change error state to mockErr when error action passed in', () => {
    // Arrange
    const ErrorAction = {
      type: ActionType.ERROR,
      payload: 'test error'
    }

    // Act
    const newState = reducer(initialUIState, ErrorAction)

    // Assert
    expect(newState.get('error')).toEqual('test error')
  })

  it('should change menu extended state when action is called', () => {
    // Arrange
    const MenuExtendAction = {
      type: ActionType.SET_SIDEBAR_EXTENDED,
      payload: true
    }

    // Act
    const newState = reducer(initialUIState, MenuExtendAction)

    // Assert
    expect(newState.get('sidebarExtended')).toEqual(true)
  })

  it('updates settings on UpdateSettingsSuccess', () => {
    const updatedMockSettings = {
      userId: 'userId',
      sendInformationNotificationsByEmail: true,
      sendTaskNotificationsByEmail: false
    }
    const state = initialUIState.update('profile', (profile: Profile) => ({
      ...profile,
      settings: mockSettings
    }))
    const newState = reducer(state, {
      type: ActionType.UpdateSettingsSuccess,
      payload: updatedMockSettings
    })

    expect(newState.get('profile').settings).toEqual(updatedMockSettings)
  })
})
