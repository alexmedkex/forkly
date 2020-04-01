import { History } from 'history'
import { routerMiddleware } from 'react-router-redux'
import { createStore, applyMiddleware, compose, Store } from 'redux'
import reduxThunk from 'redux-thunk'

import http from '../utils/http'

import apiMiddleware from './middlewares/api'
import afterHandlerMiddleware from './middlewares/afterHandler'
import setLCPresentationMiddleware from '../features/letter-of-credit-legacy/store/presentation/middlewares/setLCPresentationMiddleware'
import rootReducer, { ApplicationState } from './reducers'

const initialiseStore = (history: History): Store<ApplicationState> => {
  const __REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = '__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'
  const windowIfDefined = typeof window === 'undefined' ? null : (window as any)
  const composeEnhancers =
    (process.env.NODE_ENV !== 'production' &&
      (windowIfDefined && windowIfDefined[__REDUX_DEVTOOLS_EXTENSION_COMPOSE__])) ||
    compose
  const middlewares = applyMiddleware(
    reduxThunk.withExtraArgument(http),
    routerMiddleware(history),
    apiMiddleware,
    afterHandlerMiddleware,
    setLCPresentationMiddleware
  )
  return createStore(rootReducer, composeEnhancers(middlewares))
}

export default initialiseStore
