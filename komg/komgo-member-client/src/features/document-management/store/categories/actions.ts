import { ActionCreator, Action } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { ApplicationState } from '../../../../store/reducers'
import { HttpRequest } from '../../../../utils/http'
import { DOCUMENTS_BASE_ENDPOINT } from '../../../../utils/endpoints'
import getBaseEndpoint from '../../utils/getBaseEndpoint'
import {
  CategoryActionType,
  FetchCategoriesSuccess,
  FetchCategoriesError,
  FetchCategoryByIdSuccess,
  FetchCategoryByIdError,
  Category,
  ProductId
} from '../types'

export type ActionThunk = ThunkAction<Action, ApplicationState, HttpRequest>

export const fetchCategoriesAsync: ActionCreator<ActionThunk> = (productId: ProductId) => {
  return (dispatch, getState, api): Action => {
    return dispatch(
      api.get(`${getBaseEndpoint(productId)}/products/${productId}/categories`, {
        onError: fetchCategoriesError,
        onSuccess: fetchCategoriesSuccess
      })
    )
  }
}

export const fetchCategoriesSuccess: ActionCreator<FetchCategoriesSuccess> = (categories: Category[]) => ({
  type: CategoryActionType.FETCH_CATEGORIES_SUCCESS,
  payload: categories
})

export const fetchCategoriesError: ActionCreator<FetchCategoriesError> = error => ({
  type: CategoryActionType.FETCH_CATEGORIES_ERROR,
  error
})

export const fetchCategoriesByCategoryId: ActionCreator<ActionThunk> = (categoryId: string, productId: ProductId) => {
  return (dispatch, getState, api): Action => {
    return dispatch(
      api.get(`${DOCUMENTS_BASE_ENDPOINT}/products/${productId}/categories/${categoryId}`, {
        onError: fetchCategoryByIdError,
        onSuccess: fetchCategoryByIdSuccess
      })
    )
  }
}

export const fetchCategoryByIdSuccess: ActionCreator<FetchCategoryByIdSuccess> = (category: Category) => ({
  type: CategoryActionType.FETCH_CATEGORY_BY_ID_SUCCESS,
  payload: category
})

export const fetchCategoryByIdError: ActionCreator<FetchCategoryByIdError> = error => ({
  type: CategoryActionType.FETCH_CATEGORY_BY_ID_ERROR,
  error
})
