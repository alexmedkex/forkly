import { ErrorCode } from '@komgo/error-utilities'
import { ErrorUtils } from '@komgo/microservice-config'
import { allProducts } from '@komgo/products'
import { Controller, Get, Put, Delete, Route, Tags, Security } from 'tsoa'

import { ICustomerDataAgent } from '../../data-layer/data-agent/CustomerDataAgent'
import { provideSingleton, inject } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { ICustomerResponse } from '../responses/customer'
import ICustomerProductManager from '../services/ICustomerProductManager'

/**
 * Health check Class
 * @export
 * @class HealthController
 * @extends {Controller}
 */
@Tags('Customers')
@Route('customers')
@provideSingleton(CustomerController)
export class CustomerController extends Controller {
  constructor(
    @inject(TYPES.CustomerDataAgent) private readonly customerDataAgent: ICustomerDataAgent,
    @inject(TYPES.CustomerProductManager) private readonly productManager: ICustomerProductManager
  ) {
    super()
  }

  /**
   * @summary get all customers
   */
  @Get()
  @Security('withPermission', ['administration', 'manageCustomerLicenses'])
  public async getCustomerProducts(): Promise<ICustomerResponse[]> {
    return this.customerDataAgent.getCustomers()
  }

  /**
   * @summary add product to customer
   */
  @Put('{memberStaticId}/products/{productId}')
  @Security('withPermission', ['administration', 'manageCustomerLicenses'])
  public addProduct(memberStaticId: string, productId: string): Promise<ICustomerResponse> {
    return this.updateProducts(memberStaticId, productId, false)
  }

  /**
   * @summary remove product from customer
   */
  @Delete('{memberStaticId}/products/{productId}')
  @Security('withPermission', ['administration', 'manageCustomerLicenses'])
  public removeProduct(memberStaticId: string, productId: string): Promise<ICustomerResponse> {
    return this.updateProducts(memberStaticId, productId, true)
  }

  private async updateProducts(memberStaticId: string, productId: string, remove: boolean): Promise<ICustomerResponse> {
    if (!allProducts.some(product => product.productId === productId)) {
      throw ErrorUtils.badRequestException(ErrorCode.ValidationHttpContent, `Invalid product id ${productId}`, {})
    }
    const updatedCustomer = remove
      ? await this.customerDataAgent.removeProductFromCustomer(productId, memberStaticId)
      : await this.customerDataAgent.addProductToCustomer(productId, memberStaticId)
    const products = allProducts.filter(product => updatedCustomer.products.indexOf(product.productId) > -1)
    await this.productManager.setProducts(updatedCustomer.memberNodeId, products)
    return updatedCustomer
  }
}
