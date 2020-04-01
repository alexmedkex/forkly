import * as immutable from 'immutable'

import reducer from './reducer'
import {
  Field,
  DocumentType,
  FetchDocumentTypesError,
  CreateDocumentTypeError,
  UpdateDocumentTypeSuccess,
  UpdateDocumentTypeError,
  DeleteDocumentTypeSuccess,
  DeleteDocumentTypeError,
  DocumentTypeStateFields,
  DocumentTypeState
} from '../types'
import { DocumentTypeActionType } from '../types'
import { mockProduct } from '../products/mock-data'
import { mockCategories } from '../categories/mock-data'

describe('Document-types reducers', () => {
  const defaultFields: Field[] = [
    {
      id: 'createdBy',
      name: 'createdBy',
      type: 'string',
      isArray: false
    }
  ]
  const anonDocType: DocumentType = {
    product: mockProduct,
    category: mockCategories[0],
    name: 'mock type name',
    id: '99',
    fields: defaultFields,
    predefined: false
  }

  const mockStateFields: DocumentTypeStateFields = { documentTypes: [], error: null, isLoadingDocumentTypes: false }
  const initialState: DocumentTypeState = immutable.Map(mockStateFields)

  it('should default to initialState and ignore irrelevent actions', () => {
    // Arrange
    const expected = initialState
    const anonInvalidAction = { type: 'FOO', payload: ['bar'] }
    // Act
    const actual = reducer(initialState, anonInvalidAction)
    // Assert
    expect(actual).toEqual(expected)
  })
  it('should set docTypes in response to the payload of a FETCH_DOCUMENT_TYPES_SUCCESS action', () => {
    const action = {
      type: DocumentTypeActionType.FETCH_DOCUMENT_TYPES_SUCCESS,
      payload: [anonDocType]
    }
    // Act
    const expected = initialState.get('documentTypes').concat(action.payload)
    const actual = reducer(initialState, action)
    // Assert
    expect(actual.get('documentTypes')).toEqual(expected)
  })
  it('should set an error in case FETCH_DOCUMENT_TYPES_ERROR action', () => {
    const expectedError = new Error('could not fetch the document types')
    const action: FetchDocumentTypesError = {
      type: DocumentTypeActionType.FETCH_DOCUMENT_TYPES_ERROR,
      error: expectedError
    }
    const actual = reducer(initialState, action)
    expect(actual.get('error')).toEqual(expectedError)
  })
  it('should set an error in case CREATE_DOCUMENT_TYPE_ERROR action', () => {
    const expectedError = new Error('could not create the document type')
    const action: CreateDocumentTypeError = {
      type: DocumentTypeActionType.CREATE_DOCUMENT_TYPE_ERROR,
      error: expectedError
    }
    const actual = reducer(initialState, action)
    expect(actual.get('error')).toEqual(expectedError)
  })
  it('should set an error in case UPDATE_DOCUMENT_TYPE_ERROR action', () => {
    const expectedError = new Error('could not update the document type')
    const action: UpdateDocumentTypeError = {
      type: DocumentTypeActionType.UPDATE_DOCUMENT_TYPE_ERROR,
      error: expectedError
    }
    const actual = reducer(initialState, action)
    expect(actual.get('error')).toEqual(expectedError)
  })
  it('should set an error in case DELETE_DOCUMENT_TYPE_ERROR action', () => {
    const expectedError = new Error('could not update the document type')
    const action: DeleteDocumentTypeError = {
      type: DocumentTypeActionType.DELETE_DOCUMENT_TYPE_ERROR,
      error: expectedError
    }
    const actual = reducer(initialState, action)
    expect(actual.get('error')).toEqual(expectedError)
  })
  it('should create a new document type when CREATE_DOCUMENT_TYPE_SUCCESS is created', () => {
    const action = {
      type: DocumentTypeActionType.CREATE_DOCUMENT_TYPE_SUCCESS,
      payload: anonDocType
    }
    // Act
    const expected = initialState.get('documentTypes').concat(anonDocType)
    const actual = reducer(initialState, action)
    // Assert
    expect(actual.get('documentTypes')).toEqual(expected)
  })
  it(
    'should update an existing document when UPDATE_DOCUMENT_TYPE_SUCCESS is called ' +
      'and the document is passed in the payload',
    () => {
      const preInitialisedStateFields: DocumentTypeStateFields = {
        documentTypes: [anonDocType],
        error: null,
        isLoadingDocumentTypes: false
      }
      const preInitialisedState: DocumentTypeState = immutable.Map(preInitialisedStateFields)

      const updatedDocType: DocumentType = preInitialisedState.get('documentTypes')[0]
      const newName = 'New name modified'
      updatedDocType.name = newName

      const action: UpdateDocumentTypeSuccess = {
        type: DocumentTypeActionType.UPDATE_DOCUMENT_TYPE_SUCCESS,
        payload: updatedDocType
      }
      const actual = reducer(preInitialisedState, action)
      expect(actual.get('documentTypes').find(t => t.id === updatedDocType.id)).toEqual(updatedDocType)
    }
  )

  // Skip - blocked by KOMGO-1076
  xit('should delete the document type which ID is passed in payload when DELETE_DOCUMENT_TYPE_SUCCESS', () => {
    const annonTemplate: DocumentType = initialState.get('documentTypes')[0]
    const action: DeleteDocumentTypeSuccess = {
      type: DocumentTypeActionType.DELETE_DOCUMENT_TYPE_SUCCESS
    }
    const actual = reducer(initialState, action)
    expect(actual.get('documentTypes').find(t => t.id === annonTemplate.id)).toBeUndefined()
  })
})
