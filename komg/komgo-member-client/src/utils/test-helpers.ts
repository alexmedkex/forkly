import { applyMiddleware, createStore, compose } from 'redux'
import reduxThunk from 'redux-thunk'

import http from '../utils/http'
import rootReducer from '..//store/reducers'

export const makeTestStore = () => {
  const middlewares = applyMiddleware(reduxThunk.withExtraArgument(http))

  const store = createStore(rootReducer, compose(middlewares))

  return store
}

describe('creating test store', () => {
  it('creates a store', () => {
    const store = makeTestStore()

    expect(store).toBeDefined()
  })
})
