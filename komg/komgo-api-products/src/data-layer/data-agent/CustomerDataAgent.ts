import { injectable } from 'inversify'

import { Customer } from '../models/Customer'
import ICustomer from '../models/ICustomer'
import ICustomerDocument from '../models/ICustomerDocument'

import CustomerNotFoundError from './errors/CustomerNotFoundError'

export interface ICustomerDataAgent {
  getCustomers(): Promise<ICustomerDocument[]>
  getCustomer(memberStaticId: string): Promise<ICustomerDocument>
  createCustomer(data: ICustomer): Promise<ICustomerDocument>
  updateCustomer(data: ICustomer): Promise<ICustomerDocument>
  addProductToCustomer(productId: string, memberStaticId: string): Promise<ICustomerDocument>
  removeProductFromCustomer(productId: string, memberStaticId: string): Promise<ICustomerDocument>
}

const customerNotFoundError = 'Customer not found'

@injectable()
export default class CustomerDataAgent implements ICustomerDataAgent {
  getCustomers(): Promise<ICustomerDocument[]> {
    return Customer.find().exec()
  }

  async getCustomer(memberStaticId: string): Promise<ICustomerDocument> {
    const result = await Customer.findOne({ memberStaticId }).exec()
    if (!result) {
      throw new CustomerNotFoundError(customerNotFoundError)
    }
    return result
  }

  createCustomer(data: ICustomer): Promise<ICustomerDocument> {
    return Customer.create(data)
  }

  updateCustomer(data: ICustomer): Promise<ICustomerDocument> {
    return Customer.findOneAndUpdate(
      {
        memberStaticId: data.memberStaticId,
        $or: [
          {
            blockHeight: {
              $lt: data.blockHeight
            }
          },
          { blockHeight: { $eq: null } }
        ]
      },
      data,
      {
        upsert: true,
        new: true
      }
    ).exec()
  }

  async addProductToCustomer(productId: string, memberStaticId: string): Promise<ICustomerDocument> {
    // check if a customer exists
    await this.getCustomer(memberStaticId)

    const result = await Customer.findOneAndUpdate(
      { memberStaticId },
      { $addToSet: { products: productId } },
      { new: true }
    ).exec()

    if (!result) {
      throw new CustomerNotFoundError(customerNotFoundError)
    }

    return result
  }

  async removeProductFromCustomer(productId: string, memberStaticId: string): Promise<ICustomerDocument> {
    // check if a customer exists
    await this.getCustomer(memberStaticId)

    const result = await Customer.findOneAndUpdate(
      { memberStaticId },
      { $pull: { products: productId } },
      { new: true }
    ).exec()

    if (!result) {
      throw new CustomerNotFoundError(customerNotFoundError)
    }

    return result
  }
}
