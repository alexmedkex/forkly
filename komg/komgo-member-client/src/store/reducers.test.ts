jest.mock('redux-immutable', () => ({
  combineReducers: () => 'info from combineReducer'
}))

import rootReducer from './reducers'

describe('Reducers create reducer', () => {
  it('should return value of combineReducers', () => {
    expect(rootReducer).toEqual('info from combineReducer')
  })
})
