import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { Action } from 'redux'

import api, { ApiActionType, ApiAction, Method, CALL_API } from './http'

describe('Http', () => {
  const movieSample = {
    name: 'Terminator',
    description: 'Best movie ever'
  }

  const setupMock = () => {
    const mock = new MockAdapter(axios)
    mock.onGet('/testEndpoint').reply(200, movieSample)
  }

  beforeAll(() => {
    setupMock()
  })

  describe('get()', () => {
    it('it should return API Request action type', () => {
      const expectedAction: ApiAction = {
        type: ApiActionType.API_REQUEST,
        CALL_API,
        headers: {},
        meta: {
          method: Method.GET,
          url: '/testEndpoint',
          params: undefined,
          responseType: 'json',
          onSuccess: 'success',
          onError: 'error'
        },
        payload: ''
      }

      const result = api.get('/testEndpoint', {
        onError: 'error',
        onSuccess: 'success'
      })

      expect(result).toEqual(expectedAction)
    })

    it('it should return API Request action type with an Action parameter', () => {
      const testAction: Action = {
        type: 'Testing'
      }

      const expectedAction: ApiAction = {
        type: ApiActionType.API_REQUEST,
        CALL_API,
        headers: {},
        meta: {
          method: Method.GET,
          url: '/testEndpoint',
          params: undefined,
          responseType: 'json',
          onSuccess: testAction,
          onError: testAction
        },
        payload: ''
      }

      const result = api.get('/testEndpoint', {
        onError: testAction,
        onSuccess: testAction
      })

      expect(result).toEqual(expectedAction)
    })
    it('should pass params through', () => {
      const testAction: Action = {
        type: 'Testing'
      }
      const result = api.get('/testEndpoint', {
        data: {},
        onSuccess: testAction,
        onError: testAction,
        params: { hi: true }
      })

      expect(result.meta!.params).toEqual({ hi: true })
    })
    it('should use the action type specified if specified', () => {
      const actionType = 'GET_SOMETHING'

      const expectedAction: ApiAction = {
        type: actionType,
        CALL_API,
        headers: {},
        meta: {
          method: Method.GET,
          url: '/testEndpoint',
          params: undefined,
          responseType: 'json',
          onSuccess: 'success',
          onError: 'error'
        },
        payload: ''
      }

      const result = api.get('/testEndpoint', {
        onSuccess: 'success',
        onError: 'error',
        type: actionType
      })

      expect(result).toEqual(expectedAction)
    })

    it('should set noAuth if it is specified', () => {
      const actionType = 'GET_SOMETHING'

      const expectedAction: ApiAction = {
        type: actionType,
        CALL_API,
        headers: {},
        meta: {
          method: Method.GET,
          url: '/testEndpoint',
          params: undefined,
          noAuth: true,
          responseType: 'json',
          onSuccess: 'success',
          onError: 'error'
        },
        payload: ''
      }

      const result = api.get('/testEndpoint', {
        onSuccess: 'success',
        onError: 'error',
        noAuth: true,
        type: actionType
      })

      expect(result).toEqual(expectedAction)
    })
  })

  describe('post()', () => {
    it('it should return API Request action type', () => {
      const payload = {}

      const expectedAction: ApiAction = {
        type: ApiActionType.API_REQUEST,
        CALL_API,
        headers: {},
        meta: {
          method: Method.POST,
          url: '/testEndpoint',
          onSuccess: 'success',
          onError: 'error',
          responseType: 'json'
        },
        payload
      }

      const result = api.post('/testEndpoint', {
        data: payload,
        onSuccess: 'success',
        onError: 'error'
      })

      expect(result).toEqual(expectedAction)
    })

    it('it should return API Request action type with an Action parameter', () => {
      const payload = {}

      const testAction: Action = {
        type: 'Testing'
      }

      const expectedAction: ApiAction = {
        type: ApiActionType.API_REQUEST,
        CALL_API,
        headers: {},
        meta: {
          method: Method.POST,
          url: '/testEndpoint',
          onSuccess: testAction,
          onError: testAction,
          responseType: 'json'
        },
        payload
      }

      const result = api.post('/testEndpoint', {
        data: payload,
        onSuccess: testAction,
        onError: testAction
      })

      expect(result).toEqual(expectedAction)
    })
    it('should pass params through', () => {
      const testAction: Action = {
        type: 'Testing'
      }
      const result = api.post('/testEndpoint', {
        data: {},
        onSuccess: testAction,
        onError: testAction,
        params: { hi: true }
      })

      expect(result.meta!.params).toEqual({ hi: true })
    })
  })

  describe('delete()', () => {
    const testAction: Action = {
      type: 'Testing'
    }

    const testActionFail: Action = {
      type: 'Testing'
    }
    it('should exist', () => {
      expect(api.delete).toBeDefined()
    })
    it('should return API Request action type', () => {
      const result = api.delete('/testEndpoint', {
        onSuccess: testAction,
        onError: testActionFail
      })

      expect(result.type).toBe(ApiActionType.API_REQUEST)
    })
    it('should not include any object', () => {
      const result = api.delete('/testEndpoint', {
        data: {},
        onSuccess: testAction,
        onError: testActionFail
      })

      expect(result.payload).toBeUndefined()
    })
    it('should set method to DELETE', () => {
      const result = api.delete('/testEndpoint', {
        onSuccess: testAction,
        onError: testActionFail
      })

      expect(result.meta!.method).toEqual(Method.DELETE)
    })
    it('should call the correct URL', () => {
      const result = api.delete('/testEndpoint', {
        onSuccess: testAction,
        onError: testActionFail
      })

      expect(result.meta!.url).toEqual('/testEndpoint')
    })
    it('should pass params through', () => {
      const result = api.delete('/testEndpoint', {
        onSuccess: testAction,
        onError: testActionFail,
        params: { hi: true }
      })

      expect(result.meta!.params).toEqual({ hi: true })
    })
  })
})
