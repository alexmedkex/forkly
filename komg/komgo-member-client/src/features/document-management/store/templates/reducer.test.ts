import * as immutable from 'immutable'

import reducer from './reducer'
import { TemplateState, TemplateStateFields, Category } from '../types'
import {
  Template,
  TemplateActionType,
  FetchTemplateError,
  CreateTemplateResponse,
  CreateTemplateError,
  UpdateTemplateSuccess,
  UpdateTemplateError,
  DeleteTemplateSuccess,
  DeleteTemplateError,
  CreateTemplateSuccess
} from '../types/template'

import { mockProduct } from '../products/mock-data'

describe('Template reducers', () => {
  const mockCategory: Category = { id: 'miscellaneous', name: 'miscellaneous', product: mockProduct }

  const mockTemplate: Template = {
    id: '123',
    product: mockProduct,
    name: 'mock Clients',
    predefined: true,
    types: [
      {
        id: '1',
        product: mockProduct,
        fields: [
          { id: 'createdBy', name: 'createdBy', type: 'str', isArray: false },
          { id: 'createdOn', name: 'createdOn', type: 'date', isArray: false },
          { id: 'value', name: 'value', type: 'str', isArray: false },
          { id: 'expiresOn', name: 'expiryDate', type: 'date', isArray: false }
        ],
        name: 'passport',
        predefined: true,
        category: mockCategory
      }
    ],
    metadata: []
  }

  const annonTemplates: Template[] = [mockTemplate]

  const mockStateFields: TemplateStateFields = { templates: [], error: null }
  const mockInitialState: TemplateState = immutable.Map(mockStateFields)
  it('should default to initialState and ignore irrelevent actions', () => {
    // Arrange
    const expected = mockInitialState
    const anonInvalidAction = { type: 'FOO', payload: ['bar'] }
    // Act
    const actual = reducer(mockInitialState, anonInvalidAction)
    // Assert
    expect(actual).toEqual(expected)
  })
  it('should set templates in response to the payload of a FETCH_TEMPLATE_SUCCESS action', () => {
    // Arrange
    const action = {
      type: TemplateActionType.FETCH_TEMPLATE_SUCCESS,
      payload: annonTemplates
    }
    // Act
    const expected = mockInitialState.get('templates').concat(action.payload)
    const actual = reducer(mockInitialState, action)
    // Assert
    expect(actual.get('templates')).toEqual(expected)
  })
  it('should set an error message in case FETCH_TEMPLATE_ERROR action', () => {
    const expectedError = Error('could not fetch the templates')
    const action: FetchTemplateError = {
      type: TemplateActionType.FETCH_TEMPLATE_ERROR,
      error: expectedError
    }
    const actual = reducer(mockInitialState, action)
    expect(actual.get('error')).toEqual(expectedError)
  })
  it('should create a new template when CREATE_TEMPLATE_SUCCESS action is thrown', () => {
    const annonRespCreateTemplate: CreateTemplateResponse = {
      id: '123',
      product: mockProduct,
      name: 'template1',
      predefined: false,
      metadata: [],
      types: []
    }
    const action: CreateTemplateSuccess = {
      type: TemplateActionType.CREATE_TEMPLATE_SUCCESS,
      payload: annonRespCreateTemplate
    }
    const expected = mockInitialState.get('templates').concat(annonRespCreateTemplate)
    const actual = reducer(mockInitialState, action)
    expect(actual.get('templates')).toEqual(expected)
  })
  it('should set an error message in case CREATE_TEMPLATE_ERROR action', () => {
    const expectedError = Error('could not create a template')
    const action: CreateTemplateError = {
      error: expectedError,
      type: TemplateActionType.CREATE_TEMPLATE_ERROR
    }
    const actual = reducer(mockInitialState, action)
    expect(actual.get('error')).toEqual(expectedError)
  })
  it(
    'should update an existing template in case UPDATE_TEMPLATE_SUCCESS ' +
      'action is thrown with that template as payload',
    () => {
      // Arrange
      const preInitialisedStateFields: TemplateStateFields = { templates: annonTemplates, error: null }
      const preInitialisedState: TemplateState = immutable.Map(preInitialisedStateFields)

      const updatedTemplate = preInitialisedState.get('templates')[0]
      const newName = 'New name modified'
      updatedTemplate.name = newName

      const action: UpdateTemplateSuccess = {
        type: TemplateActionType.UPDATE_TEMPLATE_SUCCESS,
        payload: updatedTemplate
      }
      const actual = reducer(preInitialisedState, action)
      expect(actual.get('templates').find(t => t.id === updatedTemplate.id)).toEqual(updatedTemplate)
    }
  )
  it('should register an error in case UPDATE_TEMPLATE_ERROR action', () => {
    const expectedError = Error('could not update a template')
    const action: UpdateTemplateError = {
      type: TemplateActionType.UPDATE_TEMPLATE_ERROR,
      error: expectedError
    }
    const actual = reducer(mockInitialState, action)
    expect(actual.get('error')).toEqual(expectedError)
  })
  it(
    'should delete an existing template when DELETE_TEMPLATE_SUCCESS is called and ' + 'the payload matches its id',
    () => {
      const preInitialisedStateFields: TemplateStateFields = { templates: annonTemplates, error: null }
      const preInitialisedState: TemplateState = immutable.Map(preInitialisedStateFields)

      const annonTemplate: Template = preInitialisedState.get('templates')[0]
      const action: DeleteTemplateSuccess = {
        type: TemplateActionType.DELETE_TEMPLATE_SUCCESS,
        payload: annonTemplate.id
      }
      const actual = reducer(preInitialisedState, action)
      expect(actual.get('templates').find(t => t.id === annonTemplate.id)).toBeUndefined()
    }
  )
  it('should register an error in case DELETE_TEMPLATE_ERROR action', () => {
    const expectedError = Error('could not delete a template')
    const action: DeleteTemplateError = {
      type: TemplateActionType.DELETE_TEMPLATE_ERROR,
      error: expectedError
    }
    const actual = reducer(mockInitialState, action)
    expect(actual.get('error')).toEqual(expectedError)
  })
})
