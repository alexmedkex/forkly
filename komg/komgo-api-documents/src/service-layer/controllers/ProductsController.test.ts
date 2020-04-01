import 'reflect-metadata'

import ProductDataAgent from '../../data-layer/data-agents/ProductDataAgent'
import { product } from '../../data-layer/models/test-entities'
import { mock } from '../../mock-utils'

import { ProductsController } from './ProductsController'

const dataAgent = mock(ProductDataAgent)

const products = [product()]

jest.mock('../../business-layer/security/token-helpers', () => ({
  createAuthToken
}))

describe('ProductsController', () => {
  let controller

  beforeEach(() => {
    controller = new ProductsController(dataAgent)
    jest.resetAllMocks()
  })

  it('get all products', async () => {
    dataAgent.getAll.mockReturnValue(products)

    const result = await controller.GetProducts()
    expect(result).toEqual(products)
  })
})
