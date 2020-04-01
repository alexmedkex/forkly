import {
  fetchTemplatesSuccess,
  fetchTemplatesError,
  fetchTemplatesAsync,
  fetchTemplateByIdSuccess,
  fetchTemplateByIdError,
  fetchTemplatebyIdAsync,
  createTemplateSuccess,
  createTemplateError,
  createTemplateAsync,
  updateTemplateSuccess,
  updateTemplateError,
  updateTemplateAsync,
  deleteTemplateSuccess,
  deleteTemplateError,
  deleteTemplateAsync
} from '../templates/actions'
import { Template, TemplateActionType, UpdateTemplateRequest } from '../types/template'
import { makeTestStore } from '../../../../utils/test-helpers'
import { ApiActionType, ApiAction, Method } from '../../../../utils/http'
import { mockProduct } from '../products/mock-data'

const mockTemplate: Template = {
  name: 'template1',
  id: '123456',
  product: mockProduct,
  predefined: true,
  types: [],
  metadata: []
}

const templatesEndpoint = '/templates/products/kyc'

describe('fetch templates Actions', () => {
  // Arrange
  it(`fetchTemplatesSuccess()`, () => {
    const actionFunc = fetchTemplatesSuccess
    const actionExpected = {
      type: TemplateActionType.FETCH_TEMPLATE_SUCCESS,
      payload: mockTemplate
    }
    // Act
    const actual = actionFunc(mockTemplate)
    expect(actual).toMatchObject(actionExpected)
  })
  it(`fetchTemplatesError()`, () => {
    const actionFunc = fetchTemplatesError
    const expectedError = new Error('OH DEAR!')
    const actionExpected = {
      type: TemplateActionType.FETCH_TEMPLATE_ERROR,
      error: expectedError
    }
    // Act
    const actual = actionFunc(expectedError)
    expect(actual).toMatchObject(actionExpected)
  })
  it(`should dispatch an API_REQUEST to the template fetch endpoint`, async () => {
    // Arrange
    const store = makeTestStore()

    const expected: ApiAction = {
      type: ApiActionType.API_REQUEST,
      meta: {
        method: Method.GET,
        url: templatesEndpoint,
        onSuccess: fetchTemplatesSuccess,
        onError: fetchTemplatesError
      },
      payload: ''
    }
    // Assert
    const actual = await store.dispatch<any>(fetchTemplatesAsync())
    expect(actual.meta.method).toEqual(expected.meta!.method)
    expect(actual.meta.onError).toEqual(expected.meta!.onError)
    expect(actual.meta.onSuccess).toEqual(expected.meta!.onSuccess)
  })
})

describe('fetch templates by id Actions', () => {
  // Arrange
  const templateId: string = '123456'
  it(`fetchTemplateByIdSuccess()`, () => {
    const actionFunc = fetchTemplateByIdSuccess
    const actionExpected = {
      type: TemplateActionType.FETCH_TEMPLATE_BY_ID_SUCCESS,
      payload: templateId
    }
    // Act
    const actual = actionFunc(templateId)
    expect(actual).toMatchObject(actionExpected)
  })
  it(`fetchTemplateByIdError()`, () => {
    const actionFunc = fetchTemplateByIdError
    const expectedError = new Error('OH DEAR!')
    const actionExpected = {
      type: TemplateActionType.FETCH_TEMPLATE_BY_ID_ERROR,
      error: expectedError
    }
    // Act
    const actual = actionFunc(expectedError)
    expect(actual).toMatchObject(actionExpected)
  })
  it(`should dispatch an API_REQUEST to the template fetch endpoint`, async () => {
    // Arrange
    const store = makeTestStore()

    const expected: ApiAction = {
      type: ApiActionType.API_REQUEST,
      meta: {
        method: Method.GET,
        url: templatesEndpoint,
        onSuccess: fetchTemplateByIdSuccess,
        onError: fetchTemplateByIdError
      },
      payload: templateId
    }
    // Assert
    const actual = await store.dispatch<any>(fetchTemplatebyIdAsync())
    expect(actual.meta.method).toEqual(expected.meta!.method)
    expect(actual.meta.onError).toEqual(expected.meta!.onError)
    expect(actual.meta.onSuccess).toEqual(expected.meta!.onSuccess)
  })
})

describe('create template Actions', () => {
  // Arrange
  it(`createTemplateSuccess()`, () => {
    const actionFunc = createTemplateSuccess
    const actionExpected = { type: TemplateActionType.CREATE_TEMPLATE_SUCCESS, payload: mockTemplate }
    // Act
    const actual = actionFunc(mockTemplate)
    // Assert
    expect(actual).toMatchObject(actionExpected)
  })
  it(`createTemplatesError()`, () => {
    const actionFunc = createTemplateError
    const expectedError = new Error('OH DEAR!')
    const actionExpected = { type: TemplateActionType.CREATE_TEMPLATE_ERROR, error: expectedError }
    // Act
    const actual = actionFunc(expectedError)
    expect(actual).toMatchObject(actionExpected)
  })
  it(`should dispatch an API_REQUEST to the create template endpoint`, async () => {
    // Arrange
    const store = makeTestStore()

    const expected: ApiAction = {
      type: ApiActionType.API_REQUEST,
      meta: {
        method: Method.POST,
        url: templatesEndpoint,
        onSuccess: createTemplateSuccess,
        onError: createTemplateError
      },
      payload: ''
    }
    // Assert
    const actual = await store.dispatch<any>(createTemplateAsync())
    expect(actual.meta.method).toEqual(expected.meta!.method)
    expect(actual.meta.onError).toEqual(expected.meta!.onError)
    expect(actual.meta.onSuccess).toEqual(expected.meta!.onSuccess)
  })
})

describe('update template Actions', () => {
  // Arrange
  const mockRequest: UpdateTemplateRequest = {
    name: 'template1',
    id: '123456',
    product: { name: 'KYC', id: 'kyc' },
    predefined: false,
    types: [],
    metadata: []
  }
  it(`updateTemplateSuccess()`, () => {
    const actionFunc = updateTemplateSuccess
    const actionExpected = { type: TemplateActionType.UPDATE_TEMPLATE_SUCCESS, payload: mockRequest }
    // Act
    const actual = actionFunc(mockRequest)
    // Assert
    expect(actual).toMatchObject(actionExpected)
  })
  it(`updateTemplatesError()`, () => {
    const actionFunc = updateTemplateError
    const expectedError = new Error('OH DEAR!')
    const actionExpected = { type: TemplateActionType.UPDATE_TEMPLATE_ERROR, error: expectedError }
    // Act
    const actual = actionFunc(expectedError)
    expect(actual).toMatchObject(actionExpected)
  })
  it(`should dispatch an API_REQUEST to the update template endpoint`, async () => {
    // Arrange
    const store = makeTestStore()

    const expected: ApiAction = {
      type: ApiActionType.API_REQUEST,
      meta: {
        method: Method.POST,
        url: templatesEndpoint,
        onSuccess: updateTemplateSuccess,
        onError: updateTemplateError
      },
      payload: ''
    }
    // Assert
    const actual = await store.dispatch<any>(updateTemplateAsync())
    expect(actual.meta.method).toEqual(expected.meta!.method)
    expect(actual.meta.onError).toEqual(expected.meta!.onError)
    expect(actual.meta.onSuccess).toEqual(expected.meta!.onSuccess)
  })
})

describe('delete template Actions', () => {
  // Arrange

  it(`deleteTemplateSuccess()`, () => {
    const actionFunc = deleteTemplateSuccess
    const actionExpected = { type: TemplateActionType.DELETE_TEMPLATE_SUCCESS, payload: mockTemplate.id }
    // Act
    const actual = actionFunc(mockTemplate.id)
    // Assert
    expect(actual).toMatchObject(actionExpected)
  })
  it(`deleteTemplatesError()`, () => {
    const actionFunc = deleteTemplateError
    const expectedError = new Error('OH DEAR!')
    const actionExpected = { type: TemplateActionType.DELETE_TEMPLATE_ERROR, error: expectedError }
    // Act
    const actual = actionFunc(expectedError)
    expect(actual).toMatchObject(actionExpected)
  })
  it(`should dispatch an API_REQUEST to the delete template endpoint`, async () => {
    // Arrange
    const store = makeTestStore()

    const expected: ApiAction = {
      type: ApiActionType.API_REQUEST,
      meta: {
        method: Method.DELETE,
        url: templatesEndpoint,
        onSuccess: deleteTemplateSuccess,
        onError: deleteTemplateError
      },
      payload: ''
    }
    // Assert
    const actual = await store.dispatch<any>(deleteTemplateAsync())
    expect(actual.meta.method).toEqual(expected.meta!.method)
    expect(actual.meta.onError).toEqual(expected.meta!.onError)
    expect(actual.meta.onSuccess).toEqual(expected.meta!.onSuccess)
  })
})
