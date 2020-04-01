import {
  fetchDocumentTypesAsync,
  fetchDocumentTypesSuccess,
  fetchDocumentTypesError,
  fetchDocumentTypeByIdAsync,
  fetchDocumentTypeByIdSuccess,
  fetchDocumentTypeByIdError,
  createDocumentTypeAsync,
  createDocumentTypeSuccess,
  createDocumentTypeError,
  updateDocumentTypeAsync,
  updateDocumentTypeSuccess,
  updateDocumentTypeError,
  deleteDocumentTypeAsync,
  deleteDocumentTypeSuccess,
  deleteDocumentTypeError
} from './actions'

import { DocumentType, Field, DocumentTypeActionType, Product, Category } from '../types'
import { makeTestStore } from '../../../../utils/test-helpers'
import { ApiActionType, ApiAction, Method } from '../../../../utils/http'

const documentTypesEndpoint = '/templates/products/kyc'
const defaultFields: Field[] = [
  {
    id: 'createdBy',
    name: 'createdBy',
    type: 'string',
    isArray: false
  }
]

const anonProduct: Product = { id: 'kyc', name: 'KYC' }
const anonCategory: Category = { id: 'banking-documents', name: 'Banking Documents', product: anonProduct }
const anonDocumentType1: DocumentType = {
  product: anonProduct,
  category: anonCategory,
  name: 'Identity Documents',
  id: '1',
  fields: defaultFields,
  predefined: false
}

describe('fetch document types Actions', () => {
  it(`fetchDocumentTypesSuccess()`, () => {
    const actionFunc = fetchDocumentTypesSuccess
    const actionExpected = { type: DocumentTypeActionType.FETCH_DOCUMENT_TYPES_SUCCESS, payload: anonDocumentType1 }
    // Act
    const actual = actionFunc(anonDocumentType1)
    expect(actual).toMatchObject(actionExpected)
  })

  it(`fetchDocumentTypesError()`, () => {
    const actionFunc = fetchDocumentTypesError
    const expectedError = new Error('OH DEAR!')
    const actionExpected = {
      type: DocumentTypeActionType.FETCH_DOCUMENT_TYPES_ERROR,
      error: expectedError
    }
    // Act
    const actual = actionFunc(expectedError)
    expect(actual).toMatchObject(actionExpected)
  })

  it('fetchDocumentTypesAsync()', () => {
    // Arrange
    const store = makeTestStore()

    const expected: ApiAction = {
      type: ApiActionType.API_REQUEST,
      meta: {
        method: Method.GET,
        url: documentTypesEndpoint,
        onSuccess: fetchDocumentTypesSuccess,
        onError: fetchDocumentTypesError
      },
      payload: ''
    }
    // Assert
    const actual = store.dispatch<any>(fetchDocumentTypesAsync('kyc', '2'))
    expect(actual.meta.method).toEqual(expected.meta!.method)
    expect(actual.meta.onError).toEqual(expected.meta!.onError)
    expect(actual.meta.onSuccess).toEqual(expected.meta!.onSuccess)
  })
})
describe('fetch document types Actions', () => {
  it(`fetchDocumentTypeByIdSuccess()`, () => {
    const actionFunc = fetchDocumentTypeByIdSuccess
    const actionExpected = {
      type: DocumentTypeActionType.FETCH_DOCUMENT_TYPE_BY_ID_SUCCESS,
      payload: anonDocumentType1
    }
    // Act
    const actual = actionFunc(anonDocumentType1)
    expect(actual).toMatchObject(actionExpected)
  })
  it(`fetchDocumentTypeByIdError()`, () => {
    const actionFunc = fetchDocumentTypeByIdError
    const expectedError = new Error('OH DEAR!')
    const actionExpected = {
      type: DocumentTypeActionType.FETCH_DOCUMENT_TYPE_BY_ID_ERROR,
      error: expectedError
    }
    // Act
    const actual = actionFunc(expectedError)
    expect(actual).toMatchObject(actionExpected)
  })
  it('fetchDocumentTypeByIdAsync()', () => {
    // Arrange
    const store = makeTestStore()

    const expected: ApiAction = {
      type: ApiActionType.API_REQUEST,
      meta: {
        method: Method.GET,
        url: documentTypesEndpoint,
        onSuccess: fetchDocumentTypeByIdSuccess,
        onError: fetchDocumentTypeByIdError
      },
      payload: ''
    }
    // Assert
    const actual = store.dispatch<any>(fetchDocumentTypeByIdAsync('kyc', '2'))
    expect(actual.meta.method).toEqual(expected.meta!.method)
    expect(actual.meta.onError).toEqual(expected.meta!.onError)
    expect(actual.meta.onSuccess).toEqual(expected.meta!.onSuccess)
  })
})
describe('create document types Actions', () => {
  xit(`createDocumentTypeSuccess()`, () => {
    const actionFunc = createDocumentTypeSuccess([anonCategory], anonProduct)
    const actionExpected = {
      type: DocumentTypeActionType.CREATE_DOCUMENT_TYPE_SUCCESS,
      payload: anonDocumentType1
    }
    // Act
    const actual = actionFunc(anonDocumentType1)
    expect(actual).toMatchObject(actionExpected)
  })
  it(`createDocumentTypeError()`, () => {
    const actionFunc = createDocumentTypeError
    const expectedError = new Error('OH DEAR!')
    const actionExpected = { type: DocumentTypeActionType.CREATE_DOCUMENT_TYPE_ERROR, error: expectedError }
    // Act
    const actual = actionFunc(expectedError)
    expect(actual).toMatchObject(actionExpected)
  })
  xit('createDocumentTypeAsync()', () => {
    // Arrange
    const store = makeTestStore()

    const expected: ApiAction = {
      type: ApiActionType.API_REQUEST,
      meta: {
        method: Method.POST,
        url: documentTypesEndpoint,
        onSuccess: createDocumentTypeSuccess([anonCategory], anonProduct),
        onError: createDocumentTypeError
      },
      payload: ''
    }
    // Assert
    const actual = store.dispatch<any>(createDocumentTypeAsync('kyc', '2'))
    expect(actual.meta.method).toEqual(expected.meta!.method)
    expect(actual.meta.onError).toEqual(expected.meta!.onError)
    expect(actual.meta.onSuccess).toEqual(expected.meta!.onSuccess)
  })
})

describe('update document types Actions', () => {
  it(`updateDocumentTypeSuccess()`, () => {
    const actionFunc = updateDocumentTypeSuccess
    const actionExpected = {
      type: DocumentTypeActionType.UPDATE_DOCUMENT_TYPE_SUCCESS,
      payload: anonDocumentType1
    }
    // Act
    const actual = actionFunc(anonDocumentType1)
    expect(actual).toMatchObject(actionExpected)
  })
  it(`updateDocumentTypeError()`, () => {
    const actionFunc = updateDocumentTypeError
    const expectedError = new Error('OH DEAR!')
    const actionExpected = { type: DocumentTypeActionType.UPDATE_DOCUMENT_TYPE_ERROR, error: expectedError }
    // Act
    const actual = actionFunc(expectedError)
    expect(actual).toMatchObject(actionExpected)
  })
  it('updateDocumentTypeAsync()', () => {
    // Arrange
    const store = makeTestStore()

    const expected: ApiAction = {
      type: ApiActionType.API_REQUEST,
      meta: {
        method: Method.PATCH,
        url: documentTypesEndpoint,
        onSuccess: updateDocumentTypeSuccess,
        onError: updateDocumentTypeError
      },
      payload: ''
    }
    // Assert
    const actual = store.dispatch<any>(updateDocumentTypeAsync('kyc', '2'))
    expect(actual.meta.method).toEqual(expected.meta!.method)
    expect(actual.meta.onError).toEqual(expected.meta!.onError)
    expect(actual.meta.onSuccess).toEqual(expected.meta!.onSuccess)
  })
})

describe('delete document types Actions', () => {
  // TODO: deleteDocumentTypeSuccess

  it(`deleteDocumentTypeError()`, () => {
    const actionFunc = deleteDocumentTypeError
    const expectedError = new Error('OH DEAR!')
    const actionExpected = { type: DocumentTypeActionType.DELETE_DOCUMENT_TYPE_ERROR, error: expectedError }
    // Act
    const actual = actionFunc(expectedError)
    expect(actual).toMatchObject(actionExpected)
  })
  it('deleteDocumentTypeAsync()', () => {
    // Arrange
    const store = makeTestStore()

    const expected: ApiAction = {
      type: ApiActionType.API_REQUEST,
      meta: {
        method: Method.DELETE,
        url: documentTypesEndpoint,
        onSuccess: deleteDocumentTypeSuccess,
        onError: deleteDocumentTypeError
      },
      payload: anonDocumentType1.id
    }
    // Assert
    const actual = store.dispatch<any>(deleteDocumentTypeAsync())
    expect(actual.meta.method).toEqual(expected.meta!.method)
    expect(actual.meta.onError).toEqual(expected.meta!.onError)
    expect(actual.meta.onSuccess).toEqual(expected.meta!.onSuccess)
  })
})
