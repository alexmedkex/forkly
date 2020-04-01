import * as immutable from 'immutable'
import { Reducer } from 'redux'

import { ProductAction, ProductsActionType, ProductState, ProductStateFields } from '../types'

export const intialStateFields: ProductStateFields = {
  products: [],
  error: null
}

export const initialState: ProductState = immutable.Map(intialStateFields)

const reducer: Reducer<ProductState> = (state = initialState, action: ProductAction): ProductState => {
  switch (action.type) {
    case ProductsActionType.FETCH_PRODUCTS_SUCCESS: {
      const categories = state.get('products')
      return state.set('products', action.payload)
    }
    case ProductsActionType.FETCH_PRODUCTS_ERROR: {
      return state.set('error', action.error)
    }
    default:
      return state
  }
}

export default reducer
