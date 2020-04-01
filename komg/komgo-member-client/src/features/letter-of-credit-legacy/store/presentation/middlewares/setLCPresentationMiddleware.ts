import { Middleware } from 'redux'
import { LetterOfCreditActionType } from '../../types'
import { LCPresentationActionType } from '../types'

/**
 * We are getting presentation models together with letter of credit model,
 * but we want to store them separately.
 * This middleware catches LETTER_OF_CREDIT_SUCCESS action,
 * deletes presentation model from lc model and then dispatches FETCH_PRESENTATIONS_SUCCESS action
 * which stores presentations in our store.
 */
const setLCPresentationMiddleware: Middleware = ({ dispatch }) => (next: any) => (action: any) => {
  if (action.type === LetterOfCreditActionType.LETTER_OF_CREDIT_SUCCESS) {
    const { presentations } = action.payload
    const payload = { ...action.payload }
    delete payload.presentations
    if (presentations) {
      dispatch({
        type: LCPresentationActionType.FETCH_PRESENTATIONS_SUCCESS,
        payload: { presentations, lcReference: payload.reference }
      })
    }

    return next({ ...action, payload })
  }

  return next(action)
}

export default setLCPresentationMiddleware
