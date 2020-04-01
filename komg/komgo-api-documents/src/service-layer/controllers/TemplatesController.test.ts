import 'reflect-metadata'

import InvalidItem from '../../data-layer/data-agents/exceptions/InvalidItem'
import ItemNotFound from '../../data-layer/data-agents/exceptions/ItemNotFound'
import TemplateDataAgent from '../../data-layer/data-agents/TemplateDataAgent'
import TypeDataAgent from '../../data-layer/data-agents/TypeDataAgent'
import {
  fullTemplate,
  fullType,
  PRODUCT_ID,
  template,
  TEMPLATE_ID,
  TYPE_ID,
  product
} from '../../data-layer/models/test-entities'
import { mock } from '../../mock-utils'
import { ITemplateResponse } from '../responses/template'

import { TemplatesController } from './TemplatesController'
import { expectError } from './test-utils'
import ControllerUtils from './utils'
import ProductDataAgent from '../../data-layer/data-agents/ProductDataAgent'

const bareTemplateReply: ITemplateResponse = {
  id: TEMPLATE_ID,
  name: 'template-name',
  productId: 'product-id',
  types: ['type-id'],
  metadata: [
    {
      name: 'key',
      value: 'value'
    }
  ]
}

const templateDataAgent = mock(TemplateDataAgent)
const productDataAgent = mock(ProductDataAgent)
const typeDataAgent = mock(TypeDataAgent)

describe('TemplateController', () => {
  let controller

  beforeEach(() => {
    const controllerUtils = new ControllerUtils(productDataAgent, typeDataAgent, null, null)
    controller = new TemplatesController(templateDataAgent, controllerUtils)

    jest.resetAllMocks()
    typeDataAgent.getById.mockReturnValue(fullType())
    productDataAgent.getAll.mockReturnValue([product()])
  })

  it('get template by id', async () => {
    templateDataAgent.getById.mockReturnValue(fullTemplate())

    const result = await controller.GetTemplateById(PRODUCT_ID, TEMPLATE_ID)
    expect(result).toEqual(fullTemplate())
    expect(templateDataAgent.getById).toBeCalledWith(PRODUCT_ID, TEMPLATE_ID)
  })

  it('throws an exception if the template id is not found', async () => {
    templateDataAgent.getById.mockReturnValue(null)

    await expectError(404, 'Template not found', controller.GetTemplateById(PRODUCT_ID, TEMPLATE_ID))
    expect(templateDataAgent.getById).toBeCalledWith(PRODUCT_ID, TEMPLATE_ID)
  })

  it('get templates by product id', async () => {
    templateDataAgent.getAllByProduct.mockReturnValue([fullTemplate()])

    const result = await controller.GetTemplatesByProduct(PRODUCT_ID)
    expect(result).toEqual([fullTemplate()])
    expect(templateDataAgent.getAllByProduct).toBeCalledWith(PRODUCT_ID)
  })

  it('throws an exception if the product id is null', async () => {
    templateDataAgent.getAllByProduct.mockReturnValue(null)

    await expectError(422, 'Invalid product id', controller.GetTemplatesByProduct(null))
  })

  it('it creates a template', async () => {
    templateDataAgent.create.mockReturnValue(template())

    const result: ITemplateResponse = await controller.CreateTemplate(PRODUCT_ID, template())
    expect(result).toEqual(bareTemplateReply)
    expect(templateDataAgent.create).toBeCalledWith(PRODUCT_ID, template())
  })

  it('throws an exception if type with the specified id does not exist', async () => {
    typeDataAgent.getById.mockReturnValue(null)

    const result: Promise<ITemplateResponse> = controller.CreateTemplate(PRODUCT_ID, template())
    await expectError(422, `Type with id '${TYPE_ID}' does not exist`, result)
  })

  it('it deletes a template', async () => {
    templateDataAgent.delete.mockReturnValue(template())

    await controller.DeleteTemplate(PRODUCT_ID, TEMPLATE_ID)
    expect(templateDataAgent.delete).toBeCalledWith(PRODUCT_ID, TEMPLATE_ID)
  })

  it('returns null if the template id to delete is not found', async () => {
    templateDataAgent.delete.mockRejectedValue(new ItemNotFound('Template not found'))
    await expectError(404, 'Template not found', controller.DeleteTemplate(PRODUCT_ID, 'non-existing'))
  })

  it('it updates a template', async () => {
    templateDataAgent.update.mockReturnValue(template())

    const result: ITemplateResponse = await controller.UpdateTemplate(PRODUCT_ID, template())
    // console.log(`Result: ${JSON.stringify(result)}`)
    expect(result).toEqual(bareTemplateReply)
    expect(templateDataAgent.update).toBeCalledWith(PRODUCT_ID, template())
  })

  it('throws an exception if a template id to update is not found', async () => {
    templateDataAgent.update.mockRejectedValue(new InvalidItem('Template not found'))

    await expectError(
      422,
      'Template not found',
      controller.UpdateTemplate(PRODUCT_ID, { ...template(), _id: 'non-existing' })
    )
  })

  it('throws an exception if a type with the specified id in a template does not exist', async () => {
    typeDataAgent.getById.mockReturnValue(null)

    const result: Promise<ITemplateResponse> = controller.UpdateTemplate(PRODUCT_ID, template())
    await expectError(422, `Type with id '${TYPE_ID}' does not exist`, result)
  })
})
