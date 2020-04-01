import { loaderReducer } from './loader'
import { LoaderState } from './types'
import { fromJS, Map } from 'immutable'
import { Method, ApiActionType, CALL_API } from '../../utils/http'
import { LetterOfCreditActionType } from '../../features/letter-of-credit/store/types'

describe('loaderReducer', () => {
  let state: LoaderState

  beforeAll(() => {
    state = loaderReducer(undefined as any, { type: 'sometype' })
  })
  it('should be initialised correctly', () => {
    const expectedInitialState: LoaderState = fromJS({ requests: Map() })

    expect(state).toEqual(expectedInitialState)
  })
  it('does not change if polling is set on the action', () => {
    const newState = loaderReducer(state, {
      type: 'hello',
      CALL_API,
      meta: {
        method: Method.GET,
        url: 'hi',
        onSuccess: 'otherAction',
        onError: 'errorAction',
        params: { polling: true }
      }
    })

    expect(newState).toEqual(state)
  })
  it('does not change if action is not related to API', () => {
    const newState = loaderReducer(state, {
      type: 'hello'
    })

    expect(newState).toEqual(state)
  })
  it('sets the method|url string to true when the action comes through to begin with', () => {
    const newState = loaderReducer(state, {
      type: ApiActionType.API_REQUEST,
      CALL_API,
      meta: {
        method: Method.GET,
        url: 'hi',
        onSuccess: 'otherAction',
        onError: 'errorAction'
      }
    })

    expect((newState.toJS() as any).requests['Get|hi']).toBeTruthy()
  })
  it('sets the method|url string to false when the corresponding fetched action comes through after the outgoing action', () => {
    let newState = loaderReducer(state, {
      type: ApiActionType.API_REQUEST,
      CALL_API,
      meta: {
        method: Method.GET,
        url: 'hi',
        onSuccess: 'otherAction',
        onError: 'errorAction'
      }
    })

    newState = loaderReducer(newState, {
      type: 'abc_FETCHED',
      meta: {
        method: Method.GET,
        url: 'hi',
        onSuccess: 'otherAction',
        onError: 'errorAction'
      }
    })

    expect((newState.toJS() as any).requests['Get|hi']).toBeFalsy()
  })
  it('sets the action string to true when the outgoing action is seen', () => {
    const newState = loaderReducer(state, {
      type: 'abc_REQUEST',
      CALL_API,
      meta: {
        method: Method.GET,
        url: 'hi',
        onSuccess: 'otherAction',
        onError: 'errorAction'
      }
    })

    expect(newState.toJS().requests).toEqual({ abc: true })
  })
  it('sets the action string to false when the incoming action is seen', () => {
    let newState = loaderReducer(state, {
      type: 'abc_REQUEST',
      CALL_API,
      meta: {
        method: Method.GET,
        url: 'hi',
        onSuccess: 'abc_FETCHED',
        onError: 'errorAction'
      }
    })
    newState = loaderReducer(newState, {
      type: 'abc_FETCHED',
      meta: {
        method: Method.GET,
        url: 'hi',
        onSuccess: 'otherAction',
        onError: 'errorAction'
      }
    })

    expect(newState.toJS().requests).toEqual({ abc: false })
  })
  it('works for REJECT_LETTER_OF_CREDIT_FAILURE', () => {
    let newState = loaderReducer(state, {
      type: LetterOfCreditActionType.REJECT_LETTER_OF_CREDIT_REQUEST,
      CALL_API
    })
    newState = loaderReducer(newState, {
      type: LetterOfCreditActionType.REJECT_LETTER_OF_CREDIT_FAILURE
    })

    expect(newState.toJS().requests).toEqual({
      '@@templated-letter-of-credit/REJECT_LETTER_OF_CREDIT': false
    })
  })
  it('works for REJECT_LETTER_OF_CREDIT_SUCCESS', () => {
    let newState = loaderReducer(state, {
      type: LetterOfCreditActionType.REJECT_LETTER_OF_CREDIT_REQUEST,
      CALL_API
    })
    newState = loaderReducer(newState, {
      type: LetterOfCreditActionType.REJECT_LETTER_OF_CREDIT_SUCCESS
    })

    expect(newState.toJS().requests).toEqual({
      '@@templated-letter-of-credit/REJECT_LETTER_OF_CREDIT': false
    })
  })
  it('clears loaded action on *_CLEAR_LOADER', () => {
    const actionBase = 'DO_SOMETHING'
    const loadedAction = {
      type: `${actionBase}_SUCCESS`
    }
    const clearAction = {
      type: `${actionBase}_CLEAR_LOADER`
    }
    const firstState = loaderReducer(undefined, loadedAction)
    expect(firstState.get('requests').get('DO_SOMETHING')).toEqual(false)

    const secondState = loaderReducer(firstState, clearAction)

    expect(secondState.get('requests').get('DO_SOMETHING')).toEqual(undefined)
  })
})
