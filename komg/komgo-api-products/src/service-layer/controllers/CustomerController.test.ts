import { ErrorCode } from '@komgo/error-utilities'
import { ErrorUtils } from '@komgo/microservice-config'

import { CustomerController } from './CustomerController'

describe('CustomerController', () => {
  let customerController
  beforeAll(() => {
    customerController = new CustomerController()
    customerController.customerDataAgent = {
      getCustomers: jest.fn(() => []),
      updateProducts: jest.fn(() => ({ products: [] })),
      addProductToCustomer: jest.fn(() => ({ products: [{}] })),
      removeProductFromCustomer: jest.fn(() => ({ products: [] }))
    }
    customerController.productManager = {
      setProducts: jest.fn()
    }
  })

  it('should return empty array', async () => {
    const result = await customerController.getCustomerProducts()
    expect(result).toEqual([])
  })

  it('should return object with products property with array', async () => {
    const result = await customerController.addProduct('memberStaticId', 'LC')
    expect(result).toEqual({ products: [{}] })
  })

  it('should return object with products property', async () => {
    const result = await customerController.removeProduct('memberStaticId', 'KYC')
    expect(result).toEqual({ products: [] })
  })

  it('should throw error if removeProduct is called with invalid product ID', async () => {
    const result = customerController.removeProduct('memberStaticId', 'invalidProductId')
    await expect(result).rejects.toEqual(
      ErrorUtils.badRequestException(ErrorCode.ValidationHttpContent, `Invalid product id invalidProductId`, {})
    )
  })
})
