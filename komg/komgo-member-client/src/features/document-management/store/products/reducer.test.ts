import * as immutable from 'immutable'

import reducer from './reducer'
import { Product, FetchProductsError, ProductStateFields, ProductState } from '../types'
import { ProductsActionType } from '../types'

describe('Product reducers', () => {
  const mockProduct: Product = {
    id: 'kyc',
    name: 'kyc'
  }
  const mockStateFields: ProductStateFields = { products: [], error: null }
  const initialState: ProductState = immutable.Map(mockStateFields)

  it('should default to initialState and ignore irrelevent actions', () => {
    // Arrange
    const expected = initialState
    const anonInvalidAction = { type: 'FOO', payload: ['bar'] }
    // Act
    const actual = reducer(initialState, anonInvalidAction)
    // Assert
    expect(actual).toEqual(expected)
  })
  it('should set docTypes in response to the payload of a FETCH_PRODUCTS_SUCCESS action', () => {
    const action = {
      type: ProductsActionType.FETCH_PRODUCTS_SUCCESS,
      payload: [mockProduct]
    }
    // Act
    const expected = initialState.get('products').concat(action.payload)
    const actual = reducer(initialState, action)
    // Assert
    expect(actual.get('products')).toEqual(expected)
  })
  it('should set an error in case FETCH_PRODUCTS_ERROR action', () => {
    const expectedError = new Error('could not fetch the products')
    const action: FetchProductsError = {
      type: ProductsActionType.FETCH_PRODUCTS_ERROR,
      error: expectedError
    }
    const actual = reducer(initialState, action)
    expect(actual.get('error')).toEqual(expectedError)
  })
})
