jest.mock('../../../utils/endpoints', () => ({
  PRODUCTS_ENDPOINT: 'PRODUCTS_ENDPOINT'
}))

import { productLC } from '@komgo/products'
import { enableLicense, disableLicense } from './actions'
import { initialState } from './reducer'
import { LicenseActionType } from './types'
import { updateProduct } from '../../members/store/actions'

jest.mock('../../members/store/actions', () => ({
  updateProduct: jest.fn(() => jest.fn())
}))

describe('License Management Actions', () => {
  const dispatchMock = jest.fn()
  const getState = (): any => initialState
  const httpGetAction = { type: '@http/API_GET_REQUEST' }
  const httpPutAction = { type: '@http/API_PUT_REQUEST' }
  const httpDeleteAction = { type: '@http/API_DELETE_REQUEST' }
  const apiMock: any = {
    get: jest.fn(() => httpGetAction),
    put: jest.fn(() => httpPutAction),
    delete: jest.fn(() => httpDeleteAction)
  }

  describe('enableLicense()', () => {
    it('calls api.put with correct arguments', () => {
      enableLicense('customerName', 'staticId', 'productId')(dispatchMock, getState, apiMock)

      expect(apiMock.put).toHaveBeenCalledWith('PRODUCTS_ENDPOINT/customers/staticId/products/productId', {
        type: LicenseActionType.ENABLE_LICENSE_REQUEST,
        onSuccess: expect.any(Function),
        onError: LicenseActionType.ENABLE_LICENSE_FAILURE
      })
    })

    it('calls updateProduct with correct arguments after enable license', () => {
      enableLicense('customerName', 'staticId', 'productId')(dispatchMock, getState, apiMock)
      const customerRequest = { products: [productLC] }
      ;(updateProduct as jest.Mock).mockClear()
      apiMock.put.mock.calls[0][1].onSuccess(customerRequest)

      expect(updateProduct).toHaveBeenCalledWith('staticId', customerRequest.products)
    })
  })

  describe('disableLicense()', () => {
    it('calls api.delete with correct arguments', () => {
      disableLicense('customerName', 'staticId', 'productId')(dispatchMock, getState, apiMock)

      expect(apiMock.delete).toHaveBeenCalledWith('PRODUCTS_ENDPOINT/customers/staticId/products/productId', {
        type: LicenseActionType.DISABLE_LICENSE_REQUEST,
        onSuccess: expect.any(Function),
        onError: LicenseActionType.DISABLE_LICENSE_FAILURE
      })
    })

    it('calls updateProduct with correct arguments after disable license', () => {
      disableLicense('customerName', 'staticId', 'productId')(dispatchMock, getState, apiMock)
      const customerRequest = { products: [productLC] }
      ;(updateProduct as jest.Mock).mockClear()
      apiMock.put.mock.calls[0][1].onSuccess(customerRequest)

      expect(updateProduct).toHaveBeenCalledWith('staticId', customerRequest.products)
    })
  })
})
