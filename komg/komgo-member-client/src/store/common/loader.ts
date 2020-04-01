import { fromJS, Map as ImmutableMap } from 'immutable'
import { ApiAction, ApiActionType } from '../../utils/http'
import { LoaderState } from '../../store/common/types'

const initialState: LoaderState = fromJS({
  requests: ImmutableMap()
})

export const apiCallRequestRegexp = /(.*)_REQUEST/
export const apiCallResponseRegexp = /(.*)_(SUCCESS|FAILURE|FETCHED)/
export const clearLoaderRegexp = /(.*)_CLEAR_LOADER/

export const loaderReducer = (state = initialState, action: ApiAction) => {
  const { type, meta } = action
  const { method, url, params } = meta || {
    method: undefined,
    url: undefined,
    params: undefined
  }

  // LS we don't care about loading status if it's a polling action
  if (params && params.polling) {
    return state
  }

  switch (type) {
    // TODO RR remove once we remove the console.warn from the api middleware about this type
    case ApiActionType.API_REQUEST:
      const requests = state.get('requests').mergeDeep(fromJS({ [`${method}|${url}`]: true }))
      return state.set('requests', requests)
    default:
      if (clearLoaderRegexp.test(type)) {
        const [, clearAction] = clearLoaderRegexp.exec(type)
        return state.set('requests', state.get('requests').delete(clearAction))
      }
      return requestResponseReducer(state, action)
  }
}

const requestResponseReducer = (state = initialState, action: ApiAction) => {
  const { type, meta } = action
  const { method, url } = meta || {
    method: undefined,
    url: undefined
  }

  const [, actionRequest] = apiCallRequestRegexp.exec(type) || [undefined, undefined]
  const [, actionResponse] = apiCallResponseRegexp.exec(type) || [undefined, undefined]
  if (actionRequest) {
    const reqs = state.get('requests').mergeDeep(fromJS({ [`${actionRequest}`]: true }))
    return state.set('requests', reqs)
  } else if (actionResponse) {
    // TODO RR remove the if once we remove the console.warn from the api middleware about this type
    if (state.get('requests').get(`${method}|${url}`)) {
      const reqs = state.get('requests').mergeDeep(fromJS({ [`${method}|${url}`]: false }))
      return state.set('requests', reqs)
    }

    const reqs = state.get('requests').mergeDeep(fromJS({ [`${actionResponse}`]: false }))
    return state.set('requests', reqs)
  }
  return state
}
