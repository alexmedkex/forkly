import { ActionCreator, Action } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { ApplicationState } from '../../../../store/reducers'
import { HttpRequest } from '../../../../utils/http'

import { ProductsActionType, FetchProductsSuccess, FetchProductsError, Product } from '../types'

import { DOCUMENTS_BASE_ENDPOINT } from '../../../../utils/endpoints'

export type ActionThunk = ThunkAction<Action, ApplicationState, HttpRequest>

export const fetchProductsAsync: ActionCreator<ActionThunk> = () => {
  return (dispatch, getState, api): Action => {
    return dispatch(
      api.get(`${DOCUMENTS_BASE_ENDPOINT}/products/`, {
        onError: fetchProductsError,
        onSuccess: fetchProductsSuccess
      })
    )
  }
}

export const fetchProductsSuccess: ActionCreator<FetchProductsSuccess> = (products: Product[]) => ({
  type: ProductsActionType.FETCH_PRODUCTS_SUCCESS,
  payload: products
})

export const fetchProductsError: ActionCreator<FetchProductsError> = error => ({
  type: ProductsActionType.FETCH_PRODUCTS_ERROR,
  error
})
