import { HasName } from './index'
import { Action } from 'redux'

import { ApiAction } from '../../../../utils/http'

export type ProductId = 'kyc' | 'tradeFinance'

export interface Product extends HasName {
  id: ProductId
}

export enum ProductsActionType {
  FETCH_PRODUCTS_SUCCESS = '@@docs/FETCH_PRODUCTS_SUCCESS',
  FETCH_PRODUCTS_ERROR = '@@docs/FETCH_PRODUCTS_ERROR'
}

// Actions
export type FetchProductsAsync = () => ApiAction

export interface FetchProductsSuccess extends Action {
  payload: Product[]
  type: ProductsActionType.FETCH_PRODUCTS_SUCCESS
}

export interface FetchProductsError extends Action {
  error: Error
  type: ProductsActionType.FETCH_PRODUCTS_ERROR
}

export type ProductAction = FetchProductsSuccess | FetchProductsError
