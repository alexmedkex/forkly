import 'reflect-metadata'

import CategoryDataAgent from '../../data-layer/data-agents/CategoryDataAgent'
import InvalidItem from '../../data-layer/data-agents/exceptions/InvalidItem'
import ItemNotFound from '../../data-layer/data-agents/exceptions/ItemNotFound'
import ProductDataAgent from '../../data-layer/data-agents/ProductDataAgent'
import { category, CATEGORY_ID, fullCategory, product, PRODUCT_ID } from '../../data-layer/models/test-entities'
import { mock } from '../../mock-utils'
import { ICategoryResponse } from '../responses/category'

import { CategoriesController } from './CategoriesController'
import { expectError } from './test-utils'
import ControllerUtils from './utils'

const invalidCategoryCreateRequest = {
  name: ''
}

const invalidCategoryUpdateRequest = {
  id: CATEGORY_ID,
  name: ''
}

const bareCategoryReply = {
  id: CATEGORY_ID,
  productId: 'product-id',
  name: 'category-name'
}

const categories = [fullCategory()]

const categoryDataAgent = mock(CategoryDataAgent)
const productDataAgent = mock(ProductDataAgent)

jest.mock('../../business-layer/security/token-helpers', () => ({
  createAuthToken
}))

describe('CategoriesController', () => {
  let controller

  beforeEach(() => {
    const controllerUtils = new ControllerUtils(productDataAgent, null, null, null)
    controller = new CategoriesController(categoryDataAgent, controllerUtils)
    jest.resetAllMocks()

    productDataAgent.getAll.mockReturnValue([product()])
  })

  it('get all categories', async () => {
    categoryDataAgent.getAllByProduct.mockReturnValue(categories)

    const result: ICategoryResponse[] = await controller.GetCategories(PRODUCT_ID)
    expect(result).toEqual(categories)
  })

  it('get category by id', async () => {
    categoryDataAgent.getById.mockReturnValue(fullCategory())

    const result: ICategoryResponse = await controller.GetCategoryById(PRODUCT_ID, CATEGORY_ID)
    expect(result).toEqual(fullCategory())
    expect(categoryDataAgent.getById).toBeCalledWith(PRODUCT_ID, CATEGORY_ID)
  })

  it('throw error if category not found', async () => {
    categoryDataAgent.getById.mockReturnValue(null)

    await expectError(404, 'Category not found', controller.GetCategoryById(PRODUCT_ID, 'invalid-id'))
    expect(categoryDataAgent.getById).toBeCalledWith(PRODUCT_ID, 'invalid-id')
  })

  it('create new category', async () => {
    categoryDataAgent.create.mockReturnValue(category())

    const result = await controller.CreateNewCategory(PRODUCT_ID, category())
    expect(result).toEqual(bareCategoryReply)
    expect(categoryDataAgent.create).toBeCalledWith(PRODUCT_ID, category())
  })

  it('throw an error if product id does not exist', async () => {
    const invalidCategory = {
      name: 'category-name'
    }

    await expectError(422, 'Invalid product id', controller.CreateNewCategory('invalid-product-id', invalidCategory))
  })

  it('throw an error if new category has invalid format', async () => {
    await expectError(422, 'Invalid request', controller.CreateNewCategory(PRODUCT_ID, {}))
  })

  it('throw an error if new category does not pass validation', async () => {
    await expectError(422, 'Invalid request', controller.CreateNewCategory(PRODUCT_ID, invalidCategoryCreateRequest))
  })

  it('re-throw an error if new category failed for an unknown reason', async () => {
    const error = new Error('error')
    categoryDataAgent.create.mockRejectedValue(error)

    const result = controller.CreateNewCategory(PRODUCT_ID, category())
    await expect(result).rejects.toBe(error)
  })

  it('update category', async () => {
    categoryDataAgent.update.mockReturnValue(category())

    const result = await controller.Update(PRODUCT_ID, category())
    expect(result).toEqual(bareCategoryReply)
    expect(categoryDataAgent.update).toBeCalledWith(PRODUCT_ID, category())
  })

  it('throw an error if an updated category does not pass validation', async () => {
    await expectError(422, 'Invalid request', controller.Update(PRODUCT_ID, invalidCategoryUpdateRequest))
  })

  it('throw an error updated category does not pass validation', async () => {
    categoryDataAgent.update.mockRejectedValue(new ItemNotFound('Category not found'))

    await expectError(404, 'Category not found', controller.Update(PRODUCT_ID, category()))
  })

  it('throw an error if updated category has different product id', async () => {
    categoryDataAgent.update.mockRejectedValue(new InvalidItem('Cannot change category id'))

    await expectError(422, 'Cannot change category id', controller.Update(PRODUCT_ID, category()))
  })

  it('rethrow an error if failed for unknown reason', async () => {
    const error = new Error('error')
    categoryDataAgent.update.mockRejectedValue(error)

    const result = controller.Update(PRODUCT_ID, category())
    await expect(result).rejects.toBe(error)
  })

  it('removes a category', async () => {
    await controller.Delete(PRODUCT_ID, CATEGORY_ID)
    expect(categoryDataAgent.delete).toBeCalledWith(PRODUCT_ID, CATEGORY_ID)
  })

  it('return 404 if category to remove does not exist', async () => {
    categoryDataAgent.delete.mockRejectedValue(new ItemNotFound('Category not found'))
    await expectError(404, 'Category not found', controller.Delete(PRODUCT_ID, 'non-existing'))
  })
})
