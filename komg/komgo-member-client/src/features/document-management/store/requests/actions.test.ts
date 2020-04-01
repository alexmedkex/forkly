import {
  fetchRequestsSuccess,
  fetchRequestsError,
  fetchRequestsAsync,
  fetchRequestbyIdAsync,
  fetchRequestByIdSuccess,
  fetchRequestByIdError,
  createRequestAsync,
  createRequestError,
  createRequestSuccess
} from '../requests/actions'
import { Request, RequestActionType } from '../types/request'
import { makeTestStore } from '../../../../utils/test-helpers'
import { ApiActionType, ApiAction, Method } from '../../../../utils/http'
import { mockProduct } from '../products/mock-data'

// Arrange
const requestByIdEndpoint = '/requests/products/kyc'
const mockRequest: Request = {
  name: 'request1',
  id: '123456',
  product: mockProduct,
  types: [],
  companyId: '-1',
  sentDocuments: [],
  documents: [],
  notes: []
}

describe('fetch requests Actions', () => {
  it(`fetchRequestsSuccess()`, () => {
    const actionFunc = fetchRequestsSuccess
    const actionExpected = {
      type: RequestActionType.FETCH_REQUEST_SUCCESS,
      payload: mockRequest
    }
    // Act
    const actual = actionFunc(mockRequest)
    expect(actual).toMatchObject(actionExpected)
  })
  it(`fetchRequestsError()`, () => {
    const actionFunc = fetchRequestsError
    const expectedError = new Error('OH DEAR!')
    const actionExpected = {
      type: RequestActionType.FETCH_REQUEST_ERROR,
      error: expectedError
    }
    // Act
    const actual = actionFunc(expectedError)
    expect(actual).toMatchObject(actionExpected)
  })
  it(`should dispatch an API_REQUEST to the request fetch endpoint`, async () => {
    // Arrange
    const store = makeTestStore()

    const expected: ApiAction = {
      type: ApiActionType.API_REQUEST,
      meta: {
        method: Method.GET,
        url: requestByIdEndpoint,
        onSuccess: fetchRequestsSuccess,
        onError: fetchRequestsError
      },
      payload: ''
    }
    // Assert
    const actual = await store.dispatch<any>(fetchRequestsAsync())
    expect(actual.meta.method).toEqual(expected.meta!.method)
    expect(actual.meta.onError).toEqual(expected.meta!.onError)
    expect(actual.meta.onSuccess).toEqual(expected.meta!.onSuccess)
  })
})

describe('fetch requests by id Actions', () => {
  it(`fetchRequestByIdSuccess()`, () => {
    const actionFunc = fetchRequestByIdSuccess
    const actionExpected = {
      type: RequestActionType.FETCH_REQUEST_BY_ID_SUCCESS,
      payload: mockRequest
    }
    // Act
    const actual = actionFunc(mockRequest)
    expect(actual).toMatchObject(actionExpected)
  })
  it(`fetchRequestByIdError()`, () => {
    const actionFunc = fetchRequestByIdError
    const expectedError = new Error('OH DEAR!')
    const actionExpected = {
      type: RequestActionType.FETCH_REQUEST_BY_ID_ERROR,
      error: expectedError
    }
    // Act
    const actual = actionFunc(expectedError)
    expect(actual).toMatchObject(actionExpected)
  })
  it(`should dispatch an API_REQUEST to the request fetch endpoint`, async () => {
    // Arrange
    const store = makeTestStore()

    const expected: ApiAction = {
      type: ApiActionType.API_REQUEST,
      meta: {
        method: Method.GET,
        url: requestByIdEndpoint,
        onSuccess: fetchRequestByIdSuccess,
        onError: fetchRequestByIdError
      },
      payload: ''
    }
    // Assert
    const actual = await store.dispatch<any>(fetchRequestbyIdAsync())
    expect(actual.meta.method).toEqual(expected.meta!.method)
    expect(actual.meta.onError).toEqual(expected.meta!.onError)
    expect(actual.meta.onSuccess).toEqual(expected.meta!.onSuccess)
  })
})

describe('create request Actions', () => {
  it(`createRequestSuccess()`, () => {
    const actionFunc = createRequestSuccess
    const actionExpected = {
      type: RequestActionType.CREATE_REQUEST_SUCCESS,
      payload: mockRequest
    }
    // Act
    const actual = actionFunc(mockRequest)
    expect(actual).toMatchObject(actionExpected)
  })
  it(`createRequestError()`, () => {
    const actionFunc = createRequestError
    const expectedError = new Error('OH DEAR!')
    const actionExpected = {
      type: RequestActionType.CREATE_REQUEST_ERROR,
      error: expectedError
    }
    // Act
    const actual = actionFunc(expectedError)
    expect(actual).toMatchObject(actionExpected)
  })
  it(`should dispatch an API_REQUEST to the create request  endpoint`, async () => {
    // Arrange
    const store = makeTestStore()

    const expected: ApiAction = {
      type: ApiActionType.API_REQUEST,
      meta: {
        method: Method.POST,
        url: requestByIdEndpoint,
        onSuccess: createRequestSuccess,
        onError: createRequestError
      },
      payload: ''
    }
    // Assert
    const actual = await store.dispatch<any>(createRequestAsync())
    expect(actual.meta.method).toEqual(expected.meta!.method)
    expect(actual.meta.onError).toEqual(expected.meta!.onError)
    expect(actual.meta.onSuccess).toEqual(expected.meta!.onSuccess)
  })
})
