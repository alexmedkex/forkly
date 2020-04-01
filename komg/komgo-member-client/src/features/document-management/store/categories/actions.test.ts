import {
  fetchCategoriesSuccess,
  fetchCategoriesError,
  fetchCategoriesAsync,
  fetchCategoriesByCategoryId,
  fetchCategoryByIdSuccess,
  fetchCategoryByIdError
} from './actions'
import { CategoryActionType, Category } from '../types'
import { makeTestStore } from '../../../../utils/test-helpers'
import { ApiActionType, ApiAction, Method } from '../../../../utils/http'

describe('fetch categories actions', () => {
  const fetchCategoriesEndpoint = '/categories/'
  const fetchCategoriesByCategoryIdEndpoint = '/categories/'
  const anonCategory: Category = {
    id: '1',
    name: 'identity',
    product: { id: 'kyc', name: 'KYC' }
  }
  it('fetchCategories()', () => {
    // Arrange
    const store = makeTestStore()

    const expected: ApiAction = {
      type: ApiActionType.API_REQUEST,
      meta: {
        method: Method.GET,
        url: fetchCategoriesEndpoint,
        onSuccess: fetchCategoriesSuccess,
        onError: fetchCategoriesError
      },
      payload: ''
    }
    // Assert
    const actual = store.dispatch<any>(fetchCategoriesAsync())
    expect(actual.meta.method).toEqual(expected.meta!.method)
    expect(actual.meta.onError).toEqual(expected.meta!.onError)
    expect(actual.meta.onSuccess).toEqual(expected.meta!.onSuccess)
  })
  it('fetchCategoriesByCategoryId(id)', () => {
    // Arrange
    const store = makeTestStore()

    const expected: ApiAction = {
      type: ApiActionType.API_REQUEST,
      meta: {
        method: Method.GET,
        url: fetchCategoriesByCategoryIdEndpoint,
        onSuccess: fetchCategoryByIdSuccess,
        onError: fetchCategoryByIdError
      },
      payload: ''
    }
    // Assert
    const actual = store.dispatch<any>(fetchCategoriesByCategoryId('1'))
    expect(actual.meta.method).toEqual(expected.meta!.method)
    expect(actual.meta.onError).toEqual(expected.meta!.onError)
    expect(actual.meta.onSuccess).toEqual(expected.meta!.onSuccess)
  })
  it(`fetchCategoriesSuccess()`, () => {
    const actionFunc = fetchCategoriesSuccess
    const actionExpected = {
      type: CategoryActionType.FETCH_CATEGORIES_SUCCESS,
      payload: anonCategory
    }
    // Act
    const actual = actionFunc(anonCategory)
    expect(actual).toMatchObject(actionExpected)
  })
  it(`fetchCategoriesError()`, () => {
    const actionFunc = fetchCategoriesError
    const expectedError = new Error('OH DEAR!')
    const actionExpected = {
      type: CategoryActionType.FETCH_CATEGORIES_ERROR,
      error: expectedError
    }
    // Act
    const actual = actionFunc(expectedError)
    expect(actual).toMatchObject(actionExpected)
  })
})
