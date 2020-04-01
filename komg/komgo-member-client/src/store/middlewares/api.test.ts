import { AxiosRequestConfig } from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { Middleware } from 'redux'

import axiosInstance from '../../utils/axios'
import { ApiAction, Method, ApiActionType, CALL_API } from '../../utils/http'
import { ActionType as UIActionType, ActionWithAfterHandler } from '../common/types'
import { ErrorReportActionType } from '../../features/error-report/store/types'

import apiMiddleware from './api'

// createMiddlewareTestHelpers takes a redux Middleware object and
// returns a mocked store, "next" middleware, and "invoke" function
// which takes an action, calling that middleware.
// This function was abstracted to here as this was necessary boilerplate for
// every unit test.
export const createMiddlewareTestHelpers = (middleware: Middleware) => {
  const store = {
    getState: jest.fn(() => ({})),
    dispatch: jest.fn()
  }
  const next = jest.fn()

  const invoke = (Action: any) => middleware(store)(next)(Action)

  return { store, next, invoke }
}

// Tests are following the describe / it pattern, where describe is for grouping
// and each 'it' block contains tests for something different.
// Each unit test is careful to only test one piece of functionality of the code
// without making assumptions about the rest of it.
// For example, only a test which cares about ordering should be using array indices
// directly, tests which care that a certain element is present in an array
// should be using the .filter or .find array primitives in their assertions.
describe('When the apimiddleware is called', () => {
  // Setup functions to aid the test.

  // myAction is our generic action used across many of the tests
  const myGetAction: ApiAction = {
    type: ApiActionType.API_REQUEST,
    CALL_API,
    headers: {},
    meta: {
      method: Method.GET,
      url: '/testEndpoint',
      onSuccess: 'successCall',
      onError: 'errorCall'
    }
  }

  const myPostAction: ApiAction = {
    type: ApiActionType.API_REQUEST,
    CALL_API,
    headers: {},
    payload: {
      id: 'abc',
      label: 'label',
      someArray: [
        {
          arrayitemNumber: 1
        }
      ]
    },
    meta: {
      method: Method.POST,
      url: '/testEndpoint',
      onSuccess: 'successCall',
      onError: 'errorCall'
    }
  }

  // This sets up the mock adapter for the API calls on the imported instance
  const mock = new MockAdapter(axiosInstance)
  mock.onGet('/testEndpoint').reply(
    200,
    {
      testEndPointResponse: 'hello'
    },
    {
      headers: {
        'x-request-id': 'test'
      }
    }
  )

  // A unit test. It is broken down into "arrange", "act", and "assert" parts.
  // Arrange sets up the test, act, calls the code under test, and assert
  // ensures the results are as expected.

  it('should dispatch an Action to set the UI loading state to true', () => {
    // Arrange
    const { store, invoke } = createMiddlewareTestHelpers(apiMiddleware)

    // Act
    invoke(myGetAction)

    // Assert
    expect(
      store.dispatch.mock.calls.filter(
        actionList => actionList[0].type === UIActionType.LOADING && actionList[0].payload === true
      ).length
    ).toEqual(1)
  })

  it('should set the result from axios to call the endpoint specified in the URL', async () => {
    // Arrange
    const { invoke } = createMiddlewareTestHelpers(apiMiddleware)

    // This sets the mock adapter on the default instance
    let endpointWasCalled = false
    mock.onGet('/testEndpoint').reply(() => {
      endpointWasCalled = true
      return [
        200,
        {
          testEndPointResponse: 'hello'
        },
        {
          headers: {
            'x-request-id': 'test'
          }
        }
      ]
    })

    // Act
    await invoke(myGetAction)

    // Assert
    expect(endpointWasCalled).toEqual(true)
  })

  it('should dispatch an action to set the UI loading state to false after async call has resolved', async () => {
    // Arrange
    const { store, invoke } = createMiddlewareTestHelpers(apiMiddleware)

    // Act
    await invoke(myGetAction)

    // Assert
    expect(
      store.dispatch.mock.calls.filter(
        actionList => actionList[0].type === UIActionType.LOADING && actionList[0].payload === false
      ).length
    ).toEqual(1)
  })

  it('should use axiosWithoutAuth if action.meta.noAuth is true', async () => {
    jest.mock('../../utils/axios', () => ({
      axiosWithoutAuth: jest.fn(async () => ({ headers: {} }))
    }))
    jest.resetModules()
    const api = (await require('./api')).default
    const axiosWithoutAuthMock = (await require('../../utils/axios')).axiosWithoutAuth
    const action = {
      ...myGetAction,
      meta: {
        ...myGetAction.meta,
        noAuth: true
      }
    }

    api({ dispatch: jest.fn() })(jest.fn())(action)

    expect(axiosWithoutAuthMock).toHaveBeenCalledWith('/testEndpoint', expect.any(Object))
  })

  describe('POST', () => {
    it('should set payload on the request body', async () => {
      // Arrange
      let receivedData: any
      mock.onPost('/testEndpoint').reply((config: AxiosRequestConfig) => {
        receivedData = config.data
        return [201]
      })

      const { invoke } = createMiddlewareTestHelpers(apiMiddleware)

      // Act
      await invoke(myPostAction)

      // Assert
      expect(receivedData).toEqual(JSON.stringify(myPostAction.payload))
    })
  })

  describe('DELETE', () => {
    const myDeleteAction: ApiAction = {
      type: ApiActionType.API_REQUEST,
      CALL_API,
      headers: {},
      meta: {
        url: '/testEndpoint/123',
        method: Method.DELETE,
        onSuccess: 'successCall',
        onError: 'errorCall'
      }
    }
    it('should send a DELETE request', async () => {
      let endpointCalled = false
      mock.onDelete('/testEndpoint/123').reply((config: AxiosRequestConfig) => {
        endpointCalled = true
        return [200]
      })

      const { invoke } = createMiddlewareTestHelpers(apiMiddleware)

      // Act
      await invoke(myDeleteAction)

      // Assert
      expect(endpointCalled).toBeTruthy()
    })
  })

  describe('GET', () => {
    const myGetAction: ApiAction = {
      type: ApiActionType.API_REQUEST,
      CALL_API,
      headers: {},
      meta: {
        url: '/testEndpoint/123',
        method: Method.GET,
        onSuccess: 'successCall',
        onError: 'errorCall',
        params: { sort: { etrmId: -1 } }
      }
    }
    it('should send a GET request', async () => {
      let params
      mock.onGet('/testEndpoint/123').reply((config: AxiosRequestConfig) => {
        params = config.params
        return [200]
      })

      const { invoke } = createMiddlewareTestHelpers(apiMiddleware)

      // Act
      await invoke(myGetAction)

      // Assert
      expect(params).toEqual(myGetAction.meta!.params)
    })
  })

  // A nested describe block to further group the tests.
  describe('onSuccess', () => {
    it('is a string, middleware should dispatch an action on onSuccess type', async () => {
      // Arrange
      const { store, invoke } = createMiddlewareTestHelpers(apiMiddleware)

      // Act
      await invoke(myGetAction)

      // Assert
      expect(
        store.dispatch.mock.calls.filter(actionList => actionList[0].type === myGetAction.meta!.onSuccess).length
      ).toEqual(1)
    })
    it('is a function, middleware should call function', async () => {
      // Arrange
      const { invoke } = createMiddlewareTestHelpers(apiMiddleware)

      const newAPIAction = {
        type: ApiActionType.API_REQUEST,
        CALL_API,
        headers: {},
        meta: {
          method: Method.GET,
          url: '/testEndpoint',
          onSuccess: jest.fn()
        }
      }

      // Act
      await invoke(newAPIAction)

      // Assert
      expect(newAPIAction.meta.onSuccess).toHaveBeenCalled()
    })

    it('should set loading to true, dispatch the onSuccess actions, and set loading to false in that order', async () => {
      const { invoke, store } = createMiddlewareTestHelpers(apiMiddleware)

      await invoke(myGetAction)

      expect(store.dispatch.mock.calls.length).toBe(4)
      expect(store.dispatch.mock.calls[0][0]).toEqual({ type: UIActionType.LOADING, payload: true })
      expect(store.dispatch.mock.calls[1][0]).toEqual({
        type: ErrorReportActionType.STORE_REQUEST,
        payload: { method: 'Get', requestId: undefined, url: '/testEndpoint' }
      })
      expect(store.dispatch.mock.calls[2][0]).toEqual({ type: UIActionType.LOADING, payload: false })
      expect(store.dispatch.mock.calls[3][0]).toEqual({
        headers: {},
        meta: { method: 'Get', onError: 'errorCall', onSuccess: 'successCall', url: '/testEndpoint' },
        payload: { testEndPointResponse: 'hello' },
        type: 'successCall'
      })
    })
  })

  describe('onError', () => {
    it('still calls next middleware', async () => {
      // Arrange
      mock.onGet('/testEndpoint').networkError()
      const { next, invoke } = createMiddlewareTestHelpers(apiMiddleware)

      // Act
      await invoke(myGetAction)

      const finalAction = Object.assign({}, myGetAction)
      delete finalAction.CALL_API
      // Assert
      expect(next).toHaveBeenCalledWith(finalAction)
    })
    it('sets loading state to false', async () => {
      // Arrange
      const { store, invoke } = createMiddlewareTestHelpers(apiMiddleware)
      mock.onGet('/testEndpoint').networkError()

      // Act
      await invoke(myGetAction)

      // Assert
      expect(
        store.dispatch.mock.calls.filter(
          actionList => actionList[0].type === UIActionType.LOADING && actionList[0].payload === false
        ).length
      ).toEqual(1)
    })
    it('dispatches an action of type specified in onError', async () => {
      // Arrange
      const { store, invoke } = createMiddlewareTestHelpers(apiMiddleware)
      mock.onGet('/testEndpoint').networkError()

      // Act
      await invoke(myGetAction)

      // Assert
      expect(store.dispatch.mock.calls.filter(actionList => actionList[0].type === 'errorCall').length).toEqual(1)
    })

    it('is a function, middleware should call function', async () => {
      // Arrange
      const { invoke } = createMiddlewareTestHelpers(apiMiddleware)
      mock.onGet('/testEndpoint').networkError()

      const newAPIAction = {
        type: ApiActionType.API_REQUEST,
        CALL_API,
        headers: {},
        meta: {
          method: Method.GET,
          url: '/testEndpoint',
          onError: jest.fn()
        }
      }

      // Act
      await invoke(newAPIAction)

      // Assert
      expect(newAPIAction.meta.onError).toHaveBeenCalledWith('Network Error', expect.any(Object))
    })

    it('should set loading to true, then false after action is completed, dispatch the onError actions, and set loading to false in that order', async () => {
      const { invoke, store } = createMiddlewareTestHelpers(apiMiddleware)

      await invoke(myGetAction)
      expect(store.dispatch.mock.calls.length).toBe(4)
      expect(store.dispatch.mock.calls[0][0]).toEqual({ type: UIActionType.LOADING, payload: true })
      expect(store.dispatch.mock.calls[1][0]).toEqual({
        type: ErrorReportActionType.STORE_REQUEST,
        payload: { method: 'Get', requestId: undefined, url: '/testEndpoint' }
      })
      expect(store.dispatch.mock.calls[2][0]).toEqual({ type: UIActionType.LOADING, payload: false })
      expect(store.dispatch.mock.calls[3][0].type).toEqual('errorCall')
    })
  })

  describe('call to next middleware', () => {
    it('should occur when called by an API action type', async () => {
      // Arrange
      const { next, invoke } = createMiddlewareTestHelpers(apiMiddleware)

      // Act
      await invoke(myGetAction)

      const finalAction = Object.assign({}, myGetAction)
      delete finalAction.CALL_API

      // Assert
      expect(next).toHaveBeenCalledWith(finalAction)
    })
    it('should occur when called by an non-API action type', () => {
      // Arrange
      const { next, invoke } = createMiddlewareTestHelpers(apiMiddleware)

      const nonApiAction = {
        type: UIActionType.LOADING,
        payload: true
      }

      // Act
      invoke(nonApiAction)

      // Assert
      expect(next).toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(nonApiAction)
    })
  })

  describe('when onSuccess is an action type', () => {
    it('dispatches that action with payload set to the result of the call', async () => {
      const { store, invoke } = createMiddlewareTestHelpers(apiMiddleware)

      mock.onGet('/testEndpoint').reply(
        200,
        {
          testEndPointResponse: 'hello'
        },
        {
          headers: {
            'x-request-id': 'test'
          }
        }
      )

      const actionWithOnSuccessAction: ApiAction = {
        type: ApiActionType.API_REQUEST,
        CALL_API,
        headers: {},
        meta: {
          method: Method.GET,
          url: '/testEndpoint',
          onSuccess: { type: 'NEW_TYPE', afterHandler: 'test' },
          onError: 'errorCall'
        }
      }

      await invoke(actionWithOnSuccessAction)

      const [dispatchedAction]: ActionWithAfterHandler[] = store.dispatch.mock.calls.find(
        actionList => actionList[0].type === 'NEW_TYPE'
      ) as any

      expect(dispatchedAction).toBeDefined()
      expect(dispatchedAction!.type).toEqual('NEW_TYPE')
      expect(dispatchedAction!.afterHandler).toEqual('test')
      expect(dispatchedAction.payload).toEqual({ testEndPointResponse: 'hello' })
    })
  })
})
