import { fetchProductsSuccess, fetchProductsError, fetchProductsAsync } from '../products/actions'
import { Product, ProductsActionType } from '../types/product'
import { makeTestStore } from '../../../../utils/test-helpers'
import { ApiActionType, ApiAction, Method } from '../../../../utils/http'

// Arrange
const productEndpoint = '/products'
const mockProduct: Product = { name: 'kyc', id: 'kyc' }

describe('fetch Products Actions', () => {
  // Arrange
  it(`fetchProductsSuccess()`, () => {
    const actionFunc = fetchProductsSuccess
    const actionExpected = {
      type: ProductsActionType.FETCH_PRODUCTS_SUCCESS,
      payload: mockProduct
    }
    // Act
    const actual = actionFunc(mockProduct)
    expect(actual).toMatchObject(actionExpected)
  })
  it(`fetchProductsError()`, () => {
    const actionFunc = fetchProductsError
    const expectedError = new Error('OH DEAR!')
    const actionExpected = {
      type: ProductsActionType.FETCH_PRODUCTS_ERROR,
      error: expectedError
    }
    // Act
    const actual = actionFunc(expectedError)
    expect(actual).toMatchObject(actionExpected)
  })
  it(`should dispatch an API_REQUEST to the Product fetch endpoint`, async () => {
    // Arrange
    const store = makeTestStore()

    const expected: ApiAction = {
      type: ApiActionType.API_REQUEST,
      meta: {
        method: Method.GET,
        url: productEndpoint,
        onSuccess: fetchProductsSuccess,
        onError: fetchProductsError
      },
      payload: ''
    }
    // Assert
    const actual = await store.dispatch<any>(fetchProductsAsync())
    expect(actual.meta.method).toEqual(expected.meta!.method)
    expect(actual.meta.onError).toEqual(expected.meta!.onError)
    expect(actual.meta.onSuccess).toEqual(expected.meta!.onSuccess)
  })
})
