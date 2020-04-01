import 'reflect-metadata'

import mockingoose from 'mockingoose'

import { product, PRODUCT_ID } from '../models/test-entities'
import ProductDataAgent from './ProductDataAgent'

describe('ProductDataAgent', () => {
  let agent

  beforeEach(() => {
    mockingoose.resetAll()

    agent = new ProductDataAgent()
  })

  it('get all Products', async () => {
    mockingoose.Product.toReturn([product()], 'find')

    const result = await agent.getAll()
    expect(result).toMatchObject([product()])
  })

  it('product with correct id exists', async () => {
    mockingoose.Product.toReturn(product(), 'findOne')

    const exists = await agent.exists(PRODUCT_ID)
    expect(exists).toEqual(true)
  })

  it('product with incorrect id doest not exist', async () => {
    mockingoose.Product.toReturn(null, 'findOne')

    const exists = await agent.exists('invalid-id')
    expect(exists).toEqual(false)
  })
})
