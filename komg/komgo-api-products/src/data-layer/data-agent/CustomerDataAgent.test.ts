import * as jestMock from 'jest-mock'
import mockingoose from 'mockingoose'
import 'reflect-metadata'

import { Customer } from '../models/Customer'

import CustomerDataAgent from './CustomerDataAgent'
import CustomerNotFoundError from './errors/CustomerNotFoundError'

const customer = {
  memberNodeId: '0x000',
  memberStaticId: 'some_string',
  products: []
}
type IClassType<T> = new (...args: any[]) => T

function mock_injectable<T>(classType: IClassType<T>): jest.Mocked<T> {
  const mockType = jestMock.generateFromMetadata(jestMock.getMetadata(classType))
  return new mockType()
}

describe('CustomerDataAgent', () => {
  let customerDataAgent

  beforeEach(() => {
    customerDataAgent = new CustomerDataAgent()
  })

  it('should return empty array', async () => {
    mockingoose.customer.toReturn([], 'find')

    const result = await customerDataAgent.getCustomers()
    expect(result).toEqual([])
  })

  it('should return customer', async () => {
    mockingoose.customer.toReturn(new Customer(customer), 'findOne')
    const result = await customerDataAgent.getCustomer('id')
    expect(result.toJSON()).toEqual(customer)
  })

  it('should create customer', async () => {
    mockingoose.customer.toReturn(customer, 'save')

    const result = await customerDataAgent.createCustomer(customer)
    expect(result.toJSON()).toEqual(customer)
  })

  it('should update customer', async () => {
    mockingoose.customer.toReturn(customer, 'findOneAndUpdate')

    const result = await customerDataAgent.updateCustomer(customer)
    expect(result.toJSON()).toEqual(customer)
  })

  it('should trow CustomerNotFoundError from addProductToCustomer', async () => {
    mockingoose.customer.toReturn(null, 'findOne')
    mockingoose.customer.toReturn(customer, 'find')

    const call = customerDataAgent.addProductToCustomer('productId', customer)
    await expect(call).rejects.toThrowError(CustomerNotFoundError)
  })

  it('should trow CustomerNotFoundError from removeProductFromCustomer ', async () => {
    mockingoose.customer.toReturn(customer, 'find')

    const call = customerDataAgent.removeProductFromCustomer('productId', customer)
    await expect(call).rejects.toThrowError(CustomerNotFoundError)
  })

  it('should add product to customer', async () => {
    const customerDocument = new Customer(customer)
    mockingoose.customer.toReturn(customerDocument, 'findOne')
    mockingoose.customer.toReturn(customerDocument, 'find')

    const result = await customerDataAgent.addProductToCustomer('productId', customer)
    expect(result.toJSON()).toEqual(customer)
  })

  it('should remove product from customer', async () => {
    const customerDocument = new Customer(customer)
    mockingoose.customer.toReturn(customerDocument, 'findOne')
    mockingoose.customer.toReturn(customerDocument, 'find')

    const result = await customerDataAgent.removeProductFromCustomer('productId', customer)
    expect(result.toJSON()).toEqual(customer)
  })
})
