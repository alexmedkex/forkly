import { ApiAction } from '../../../utils/http'
import { fromJS } from 'immutable'

const initialState = fromJS({
  byAction: {}
  /*
    * byAction: {
    *  FETCH_LETTER_OF_CREDIT: {
    *   message,
    *   code,
    * }
    * */
})

export const failureRegexp = /(.*)_FAILURE/
export const successRegexp = /(.*)_SUCCESS/
export const clearErrorRegexp = /(.*)_CLEAR_ERROR/
export const typeRegexp = /(.*)_REQUEST|_SUCCESS|_FAILURE|_CLEAR_ERROR/

export const errorReducer = (state = initialState, action: ApiAction) => {
  if (failureRegexp.test(action.type)) {
    const match = failureRegexp.exec(action.type) || []
    // e.g. FETCH_TRADES_FAILURE => FETCH_TRADES as key
    const [, key] = match
    const update = state.get('byAction').merge(
      fromJS({
        [key]: action.error || {
          message: action.payload
        }
      })
    )
    return state.set('byAction', update)
  }

  if (successRegexp.test(action.type)) {
    // e.g.
    // FETCH_TRADES_SUCCESS => FETCH_TRADES as key
    const match = successRegexp.exec(action.type) || []
    const [, key] = match
    const update = state.get('byAction').delete(key)
    return state.set('byAction', update)
  }

  if (clearErrorRegexp.test(action.type)) {
    // e.g.
    // FETCH_TRADES_CLEAR_ERROR => FETCH_TRADES as key
    const match = clearErrorRegexp.exec(action.type) || []
    const [, key] = match
    const update = state.get('byAction').delete(key)
    return state.set('byAction', update)
  }
  return state
}
