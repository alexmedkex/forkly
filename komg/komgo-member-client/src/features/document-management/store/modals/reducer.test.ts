import * as immutable from 'immutable'

import { ModalName, ModalsStateFields, ModalsState, ModalActionType, ToggleModalVisible, SetModalStep } from '../types'
import reducer, { initialModalStateFields } from './reducer'

describe('Modals reducer', () => {
  const defaultState: ModalsStateFields = initialModalStateFields
  const initialState: ModalsState = immutable.fromJS(defaultState)

  it('should default to initialState and ignore irrelevant actions', () => {
    const expected = initialState
    const anonInvalidAction = { type: 'FOO', payload: ['bar'] }

    const actual = reducer(initialState, anonInvalidAction)

    expect(actual).toEqual(expected)
  })

  it('should default to initialState when passed undefined state', () => {
    const expected = initialState
    const anonInvalidAction = { type: 'FOO', payload: ['bar'] }

    const actual = reducer(undefined as any, anonInvalidAction)

    expect(actual).toEqual(expected)
  })

  it('should toggle a modal visible in response to TOGGLE_MODAL_VISIBLE action', () => {
    const validModalName: ModalName = 'addDocument'
    const action: ToggleModalVisible = {
      type: ModalActionType.TOGGLE_MODAL_VISIBLE,
      modal: validModalName
    }

    const actual = reducer(initialState, action)

    expect(actual.getIn(['modals', validModalName, 'visible'])).toBe(true)
  })

  it('should set a modal step in response to SET_MODAL_STEP action with a valid step', () => {
    const validModalName: ModalName = 'shareDocument'
    const validStepValue = 1
    const action: SetModalStep = {
      type: ModalActionType.SET_MODAL_STEP,
      modal: validModalName,
      step: validStepValue
    }

    const actual = reducer(initialState, action)

    expect(actual.getIn(['modals', validModalName, 'step'])).toBe(validStepValue)
  })

  it('should ignore SET_MODAL_STEP action with an invalid step parameter', () => {
    const validModalName: ModalName = 'shareDocument'
    const action: SetModalStep = {
      type: ModalActionType.SET_MODAL_STEP,
      modal: validModalName,
      step: -1
    }

    const actual = reducer(initialState, action)
    const expected = initialState.getIn(['modals', validModalName, 'step'])

    expect(actual.getIn(['modals', validModalName, 'step'])).toEqual(expected)
  })

  it('should ignore SET_MODAL_STEP action for a modal with no "step" state', () => {
    const invalidSteppedModalName: ModalName = 'addDocument'
    const action: SetModalStep = {
      type: ModalActionType.SET_MODAL_STEP,
      modal: invalidSteppedModalName,
      step: 22
    }

    const result = reducer(initialState, action)
    const actual = result.getIn(['modals', invalidSteppedModalName, 'step'])

    expect(actual).toBeUndefined()
  })
})
