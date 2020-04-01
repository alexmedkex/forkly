import 'reflect-metadata'

import CategoryDataAgent from '../../data-layer/data-agents/CategoryDataAgent'
import ItemNotFound from '../../data-layer/data-agents/exceptions/ItemNotFound'
import ProductDataAgent from '../../data-layer/data-agents/ProductDataAgent'
import TypeDataAgent from '../../data-layer/data-agents/TypeDataAgent'
import {
  CATEGORY_ID,
  field,
  fullCategory,
  fullType,
  PRODUCT_ID,
  type,
  TYPE_ID,
  product
} from '../../data-layer/models/test-entities'
import { mock } from '../../mock-utils'

import { expectError } from './test-utils'
import { TypesController } from './TypesController'
import ControllerUtils from './utils'

const invalidTypeCreateRequest = {
  categoryId: 'proof-of-identity',
  name: '',
  fields: [field]
}

const invalidTypeUpdateRequest = {
  id: TYPE_ID,
  categoryId: 'categoryId',
  name: ''
}

const createTypeRequest = {
  productId: PRODUCT_ID,
  categoryId: CATEGORY_ID,
  name: 'type-name',
  fields: [field()]
}

const bareTypeResponse = {
  id: TYPE_ID,
  productId: PRODUCT_ID,
  categoryId: CATEGORY_ID,
  name: 'type-name',
  fields: [field()],
  predefined: false,
  vaktId: 'vakt-id'
}

const productDataAgent = mock(ProductDataAgent)
const categoryDataAgent = mock(CategoryDataAgent)
const typeDataAgent = mock(TypeDataAgent)

jest.mock('../../business-layer/security/token-helpers', () => ({
  createAuthToken
}))

describe('TypesController', () => {
  let controller

  beforeEach(() => {
    const controllerUtils = new ControllerUtils(productDataAgent, typeDataAgent, null, null)
    controller = new TypesController(categoryDataAgent, typeDataAgent, controllerUtils)
    jest.resetAllMocks()
    productDataAgent.getAll.mockReturnValue([product()])
  })

  it('get all types', async () => {
    typeDataAgent.getAllByProduct.mockReturnValue([fullType()])

    const result = await controller.GetTypesInCategory(PRODUCT_ID)
    expect(result).toEqual([fullType()])
  })

  it('get all types in category', async () => {
    categoryDataAgent.getById.mockReturnValue(fullCategory())
    typeDataAgent.getAllInCategory.mockReturnValue([fullType()])

    const result = await controller.GetTypesInCategory(PRODUCT_ID, CATEGORY_ID)
    expect(result).toEqual([fullType()])
  })

  it('return 404 if requesting types in non-existing category', async () => {
    categoryDataAgent.getById.mockReturnValue(null)
    typeDataAgent.getAllInCategory.mockReturnValue([])

    const result = controller.GetTypesInCategory(PRODUCT_ID, CATEGORY_ID)
    await expectError(404, 'Category not found', result)
    expect(categoryDataAgent.getById).toBeCalledWith(PRODUCT_ID, CATEGORY_ID)
  })

  it('get type by id', async () => {
    typeDataAgent.getById.mockReturnValue(fullType())

    const result = await controller.GetTypeById(PRODUCT_ID, TYPE_ID)
    expect(result).toEqual(fullType())
    expect(typeDataAgent.getById).toBeCalledWith(PRODUCT_ID, TYPE_ID)
  })

  it('throw an error if type not found', async () => {
    typeDataAgent.getById.mockReturnValue(null)

    await expectError(404, 'Type not found', controller.GetTypeById(PRODUCT_ID, 'invalid-id'))
    expect(typeDataAgent.getById).toBeCalledWith(PRODUCT_ID, 'invalid-id')
  })

  it('create new type', async () => {
    typeDataAgent.create.mockReturnValue(type())

    const result = await controller.CreateNewType(PRODUCT_ID, createTypeRequest)
    expect(result).toEqual(bareTypeResponse)
    expect(typeDataAgent.create).toBeCalledWith(PRODUCT_ID, {
      ...createTypeRequest,
      predefined: false
    })
  })

  it('throw an error if new type has invalid format', async () => {
    await expectError(422, 'Invalid request', controller.CreateNewType(PRODUCT_ID, {}))
  })

  it('throw an error if new type does not pass validation', async () => {
    await expectError(422, 'Invalid request', controller.CreateNewType(PRODUCT_ID, invalidTypeCreateRequest))
  })

  it('re-throw an error if new type failed for an unknown reason', async () => {
    const error = new Error('error')
    typeDataAgent.create.mockRejectedValue(error)

    const result = controller.CreateNewType(PRODUCT_ID, bareTypeResponse)
    await expect(result).rejects.toBe(error)
  })

  it('update type', async () => {
    typeDataAgent.update.mockReturnValue(type())

    const result = await controller.Update(PRODUCT_ID, bareTypeResponse)
    expect(result).toEqual(bareTypeResponse)
    expect(typeDataAgent.update).toBeCalledWith(PRODUCT_ID, type())
  })

  it('throw an error updated type does not pass validation', async () => {
    await expectError(422, 'Invalid request', controller.Update(PRODUCT_ID, invalidTypeUpdateRequest))
  })

  it('throw an error updated type does not pass validation', async () => {
    typeDataAgent.update.mockRejectedValue(new ItemNotFound('Type not found'))

    await expectError(404, 'Type not found', controller.Update(PRODUCT_ID, bareTypeResponse))
  })

  it('rethrow an error if an update failed for unknown reason', async () => {
    const error = new Error('error')
    typeDataAgent.update.mockRejectedValue(error)

    const result = controller.Update(PRODUCT_ID, bareTypeResponse)
    await expect(result).rejects.toBe(error)
  })

  it('removes a type', async () => {
    await controller.Delete(PRODUCT_ID, TYPE_ID)
    expect(typeDataAgent.delete).toBeCalledWith(PRODUCT_ID, TYPE_ID)
  })

  it('return 404 if item to remove does not exist', async () => {
    typeDataAgent.delete.mockRejectedValue(new ItemNotFound('Type not found'))
    await expectError(404, 'Type not found', controller.Delete(PRODUCT_ID, 'non-existing'))
  })
})
