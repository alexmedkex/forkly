import { Middleware } from 'redux'

import axiosWithAuth, { axiosWithoutAuth } from '../../utils/axios'
import { CALL_API, ApiAction, ApiActionType } from '../../utils/http'
import { setLoading } from '../common/actions'
import { storeRequest } from '../../features/error-report/store/error-report/actions'

// The API middleware is a redux middleware which handles all API calls for the app.
// To send an API call, you can use the Http class found un the utils/ folder.
//
// The Http class currently returns an action which is of type ApiActionType.API_REQUEST.
// When this action is dispatched, it passes through each middleware. The api middleware
// specifically deals with this action type, with other metadata set through the http
// class driving which REST verb is used.
// The flow for a API_REQUEST action is:
//   - UI loading state set to true
//   - Request is sent
//   - Request resolves
//   - Result of API request is dispatched either through an action or an action creator.
//     This keeps handling of the response open ended. If you wish to dispatch several
//     actions based on the response from the API, you can set the onSuccess handler
//     within RequestConfig to an action creator. If you wish to dispatch a single action,
//     you can set the onSuccess handler to the name of the action you wish to dispatch
//     (a string).
//   - UI loading state set to false
// Like any middleware, the next handler to enter the next middleware is called when the
// logic is complete in this middleware.
// However, in the case of the action being of type API_REQUEST, the middleware is
// asynchronous. We decided this should be fine as no other middlewares should expect
// to do anything synchronous with the proceeds of an API request.
const getErrorMessage = error =>
  error.response && error.response.data
    ? typeof error.response.data === 'string'
      ? error.response.data
      : error.response.data.message && error.response.data.error
        ? error.response.data.message + ', ' + error.response.data.error
        : error.response.data.error || error.response.data.message
    : error.message
      ? error.message
      : 'Something went wrong'
const actionWith = (action: ApiAction, data?: any) => {
  const finalAction = Object.assign({}, action, data)
  delete finalAction.CALL_API
  return finalAction
}
const apiMiddleware: Middleware = ({ dispatch }) => next => (action: any) => {
  if (typeof action.CALL_API === 'symbol') {
    const { method, url, onSuccess, onError } = action.meta

    dispatch(setLoading(true))

    next(actionWith(action))

    const axiosInstance = action.meta.noAuth ? axiosWithoutAuth : axiosWithAuth

    return axiosInstance(url, {
      data: action.payload,
      params: action.meta.params,
      headers: action.headers,
      method,
      responseType: action.meta.responseType || 'json'
    })
      .then(response => {
        dispatch(
          storeRequest({
            method,
            url,
            requestId: response.headers['x-request-id']
          })
        )
        dispatch(setLoading(false))
        if (typeof onSuccess === 'function') {
          return dispatch(onSuccess(response.data, response.headers, action.meta))
        } else if (typeof onSuccess === 'string') {
          return dispatch(actionWith(action, { type: onSuccess, payload: response.data }))
        } else if (onSuccess) {
          return dispatch(actionWith(action, { ...onSuccess, payload: response.data }))
        }
      })
      .catch(error => {
        dispatch(
          storeRequest({
            method,
            url,
            requestId: error.response && error.response.headers['x-request-id']
          })
        )

        dispatch(setLoading(false))
        // TODO once we do not support API_REQUEST, we can remove this & make this clearer again
        const errorMessage = getErrorMessage(error)
        if (typeof onError === 'function') {
          return dispatch(onError(errorMessage, error))
        }

        return dispatch(
          actionWith(action, {
            type: onError,
            payload: errorMessage,
            status: error.response && error.response.status,
            error: error.response && error.response.data,
            headers: error.response && error.response.headers
          })
        )
      })
  }
  return next(action)
}

export default apiMiddleware
