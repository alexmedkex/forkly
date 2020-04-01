import * as immutable from 'immutable'

import reducer from './reducer'
import { RequestState, RequestStateFields } from '../types'
import {
  Request,
  RequestActionType,
  FetchRequestError,
  CreateRequestResponse,
  CreateRequestError,
  CreateRequestSuccess,
  FetchIncomingRequestError
} from '../types/request'

import { mockProduct } from '../products/mock-data'
import { mockRequest } from '../requests/mock-data'

describe('Request reducers', () => {
  const annonRequests: Request[] = mockRequest

  const mockStateFields: RequestStateFields = {
    requests: [],
    requestById: null,
    outgoingRequests: [],
    sentDocumentRequestTypes: new Map().set('-1', new Set()),
    error: null
  }
  const mockInitialState: RequestState = immutable.Map(mockStateFields)
  it('should default to initialState and ignore irrelevent actions', () => {
    // Arrange
    const expected = mockInitialState
    const anonInvalidAction = { type: 'FOO', payload: ['bar'] }
    // Act
    const actual = reducer(mockInitialState, anonInvalidAction)
    // Assert
    expect(actual).toEqual(expected)
  })
  it('should set requests in response to the payload of a FETCH_REQUEST_SUCCESS action', () => {
    // Arrange
    const action = {
      type: RequestActionType.FETCH_REQUEST_SUCCESS,
      payload: annonRequests
    }
    // Act
    const expected = mockInitialState.get('outgoingRequests')
    const actual = reducer(mockInitialState, action)
    // Assert
    expect(actual.get('requests')).toEqual(expected)
    expect(actual.get('sentDocumentRequestTypes')).toBeTruthy()
  })
  it('should set request in state when FETCH_REQUEST_BY_ID_SUCCESS is dispatched', () => {
    const action = {
      type: RequestActionType.FETCH_REQUEST_BY_ID_SUCCESS,
      payload: annonRequests[0]
    }

    const actual = reducer(mockInitialState, action)

    expect(actual.get('outgoingRequests')).toEqual([annonRequests[0]])
  })
  it('should set an error message in case FETCH_REQUEST_ERROR action', () => {
    const expectedError = Error('could not fetch the requests')
    const action: FetchRequestError = {
      type: RequestActionType.FETCH_REQUEST_ERROR,
      error: expectedError
    }
    const actual = reducer(mockInitialState, action)
    expect(actual.get('error')).toEqual(expectedError)
  })
  it('should create a new request when CREATE_REQUEST_SUCCESS action is thrown', () => {
    const annonRespCreateRequest: CreateRequestResponse = {
      id: '123',
      product: mockProduct,
      name: 'request1',
      types: [],
      companyId: '-1',
      sentDocuments: [],
      documents: [],
      notes: []
    }
    const action: CreateRequestSuccess = {
      type: RequestActionType.CREATE_REQUEST_SUCCESS,
      payload: annonRespCreateRequest
    }
    const expected = mockInitialState.get('requests').concat(annonRespCreateRequest)
    const actual = reducer(mockInitialState, action)
    expect(actual.get('requests')).toEqual(expected)
  })
  it('should set an error message in case CREATE_REQUEST_ERROR action', () => {
    const expectedError = Error('could not create a request')
    const action: CreateRequestError = {
      error: expectedError,
      type: RequestActionType.CREATE_REQUEST_ERROR
    }
    const actual = reducer(mockInitialState, action)
    expect(actual.get('error')).toEqual(expectedError)
  })

  it('should set requests in response to the payload of a FETCH_INCOMING_REQUEST_SUCCESS action', () => {
    // Arrange
    const anonIncomingRequest: Request = {
      product: mockProduct,
      types: [],
      name: 'anon incoming req',
      id: '-1',
      companyId: '-999',
      sentDocuments: [],
      documents: [],
      notes: []
    }
    const action = {
      type: RequestActionType.FETCH_INCOMING_REQ_SUCCESS,
      payload: [anonIncomingRequest]
    }
    // Act
    const expected = mockInitialState.get('requests').concat(action.payload)
    const actual = reducer(mockInitialState, action)
    // Assert
    expect(actual.get('requests')).toEqual(expected)
  })

  it('should set an error message in case FETCH_INCOMING_REQ_FAILURE action', () => {
    const expectedError = Error('could not fetch the requests')
    const action: FetchIncomingRequestError = {
      type: RequestActionType.FETCH_INCOMING_REQ_FAILURE,
      error: expectedError
    }
    const actual = reducer(mockInitialState, action)
    expect(actual.get('error')).toEqual(expectedError)
  })
})

describe('Helper functions - sentDocumentRequestTypes', () => {
  const mockStateFields: RequestStateFields = {
    requests: [],
    requestById: null,
    outgoingRequests: [],
    sentDocumentRequestTypes: new Map(),
    error: null
  }
  const mockInitialState: RequestState = immutable.Map(mockStateFields)

  it('given single type for a single company, sentDocumentRequestTypes should create company to type mapping', () => {
    // Arrange
    const action = {
      type: RequestActionType.FETCH_REQUEST_SUCCESS,
      payload: [
        {
          types: [{ name: 'Passports of the directors' }],
          companyId: '08e9f8e3-94e5-459e-8458-ab512bee6e2c'
        }
      ]
    }

    // Act
    const expected: Map<string, Set<string>> = new Map()
    expected.set('08e9f8e3-94e5-459e-8458-ab512bee6e2c', new Set().add('Passports of the directors'))

    const actual = reducer(mockInitialState, action)
    // Assert
    expect(actual.get('sentDocumentRequestTypes')).toEqual(expected)
  })

  it('given repeated types for a single company, sentDocumentRequestTypes should have no repeated types', () => {
    const action = {
      type: RequestActionType.FETCH_REQUEST_SUCCESS,
      payload: [
        {
          types: [{ name: 'Passports of the directors' }],
          companyId: '08e9f8e3-94e5-459e-8458-ab512bee6e2c'
        },
        {
          types: [{ name: 'Passports of the directors' }],
          companyId: '08e9f8e3-94e5-459e-8458-ab512bee6e2c'
        }
      ]
    }

    // Act
    const expected: Map<string, Set<string>> = new Map()
    expected.set('08e9f8e3-94e5-459e-8458-ab512bee6e2c', new Set().add('Passports of the directors'))

    const actual = reducer(mockInitialState, action)
    // Assert
    expect(actual.get('sentDocumentRequestTypes')).toEqual(expected)
  })

  it('given repeated types for different company, sentDocumentRequestTypes should have each company with repeated types', () => {
    const action = {
      type: RequestActionType.FETCH_REQUEST_SUCCESS,
      payload: [
        {
          types: [{ name: 'Passports of the directors' }],
          companyId: '08e9f8e3-94e5-459e-8458-ab512bee6e2c'
        },
        {
          types: [{ name: 'Passports of the directors' }],
          companyId: 'cf63c1f8-1165-4c94-a8f8-9252eb4f0016'
        }
      ]
    }

    // Act
    const expected: Map<string, Set<string>> = new Map()
    expected.set('08e9f8e3-94e5-459e-8458-ab512bee6e2c', new Set().add('Passports of the directors'))
    expected.set('cf63c1f8-1165-4c94-a8f8-9252eb4f0016', new Set().add('Passports of the directors'))

    const actual = reducer(mockInitialState, action)
    // Assert
    expect(actual.get('sentDocumentRequestTypes')).toEqual(expected)
  })

  it('given different types for single company, sentDocumentRequestTypes should have company with types mapping', () => {
    const action = {
      type: RequestActionType.FETCH_REQUEST_SUCCESS,
      payload: [
        {
          types: [{ name: 'Passports of the directors' }],
          companyId: '08e9f8e3-94e5-459e-8458-ab512bee6e2c'
        },
        {
          types: [{ name: 'Article of association' }],
          companyId: '08e9f8e3-94e5-459e-8458-ab512bee6e2c'
        }
      ]
    }

    // Act
    const expected: Map<string, Set<string>> = new Map()
    expected.set(
      '08e9f8e3-94e5-459e-8458-ab512bee6e2c',
      new Set().add('Passports of the directors').add('Article of association')
    )

    const actual = reducer(mockInitialState, action)
    // Assert
    expect(actual.get('sentDocumentRequestTypes')).toEqual(expected)
  })

  it('edge case - undefined payload should return empty map', () => {
    const action = {
      type: RequestActionType.FETCH_REQUEST_SUCCESS,
      payload: undefined
    }

    // Act
    const expected: Map<string, Set<string>> = new Map()
    const actual = reducer(mockInitialState, action)
    // Assert
    expect(actual.get('sentDocumentRequestTypes')).toEqual(expected)
  })

  it('edge case - empty payload should return empty map', () => {
    const action = {
      type: RequestActionType.FETCH_REQUEST_SUCCESS,
      payload: []
    }

    // Act
    const expected: Map<string, Set<string>> = new Map()
    const actual = reducer(mockInitialState, action)
    // Assert
    expect(actual.get('sentDocumentRequestTypes')).toEqual(expected)
  })

  it('edge case - empty companyId should be discarded return empty map', () => {
    const action = {
      type: RequestActionType.FETCH_REQUEST_SUCCESS,
      payload: [
        {
          types: [{ name: 'Passports of the directors' }]
        }
      ]
    }

    // Act
    const expected: Map<string, Set<string>> = new Map()
    const actual = reducer(mockInitialState, action)
    // Assert
    expect(actual.get('sentDocumentRequestTypes')).toEqual(expected)
  })

  it('edge case - empty types should be discarded return company mapping to empty Set', () => {
    const action = {
      type: RequestActionType.FETCH_REQUEST_SUCCESS,
      payload: [
        {
          companyId: '08e9f8e3-94e5-459e-8458-ab512bee6e2c'
        }
      ]
    }

    // Act
    const expected: Map<string, Set<string>> = new Map().set('08e9f8e3-94e5-459e-8458-ab512bee6e2c', new Set())

    const actual = reducer(mockInitialState, action)
    // Assert
    expect(actual.get('sentDocumentRequestTypes')).toEqual(expected)
  })
})
