import { Product, ProductId } from './product'
import { HasName, HasId, Filter } from './index'
import { Action } from 'redux'

import { ApiAction } from '../../../../utils/http'

export interface Category extends HasName, HasId {
  product: Product
}

export type CategoryCreateRequest = Filter<Category, HasId>

export type CategoryUpdateRequest = Category

export enum CategoryActionType {
  FETCH_CATEGORIES_SUCCESS = '@@docs/FETCH_CATEGORIES_SUCCESS',
  FETCH_CATEGORIES_ERROR = '@@docs/FETCH_CATEGORIES_ERROR',
  FETCH_CATEGORY_BY_ID_SUCCESS = '@@docs/FETCH_CATEGORY_BY_ID_SUCCESS',
  FETCH_CATEGORY_BY_ID_ERROR = '@@docs/FETCH_CATEGORY_BY_ID_ERROR'
}

// Actions
export type FetchCategoriesAsync = (productId: ProductId) => ApiAction

export interface FetchCategoriesSuccess extends Action {
  payload: Category[]
  type: CategoryActionType.FETCH_CATEGORIES_SUCCESS
}

export interface FetchCategoriesError extends Action {
  error: Error
  type: CategoryActionType.FETCH_CATEGORIES_ERROR
}

export type FetchCategoryById = (categoryId: string, productId: ProductId) => ApiAction

export interface FetchCategoryByIdSuccess extends Action {
  payload: Category
  type: CategoryActionType.FETCH_CATEGORY_BY_ID_SUCCESS
}

export interface FetchCategoryByIdError extends Action {
  error: Error
  type: CategoryActionType.FETCH_CATEGORY_BY_ID_ERROR
}

export type CategoryAction =
  | FetchCategoriesSuccess
  | FetchCategoriesError
  | FetchCategoryByIdSuccess
  | FetchCategoryByIdError
