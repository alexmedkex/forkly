import 'reflect-metadata'
import { ITemplateDataAgent } from '../../data-layer/data-agents/template/ITemplateDataAgent'
import { TemplateService } from './TemplateService'
import { ITemplateBase, buildFakeTemplateBase, ITemplate, buildFakeTemplate } from '@komgo/types'
import { TokenUser } from '../utils/TokenUser'

const dataAgent: ITemplateDataAgent = {
  create: jest.fn(),
  get: jest.fn(),
  softDelete: jest.fn(),
  update: jest.fn(),
  getAll: jest.fn(),
  count: jest.fn()
}

const staticId = '75d27f9a-10fd-4350-a7f6-9acccfa75ecb'
const tokenUser: TokenUser = { name: 'name' }

describe('TemplateService', () => {
  let service: TemplateService
  let templateBase: ITemplateBase
  let template: ITemplate

  beforeEach(() => {
    service = new TemplateService(dataAgent)
    templateBase = buildFakeTemplateBase()
    template = buildFakeTemplate()
  })

  it('createTemplate', async () => {
    dataAgent.create = jest.fn().mockImplementation(() => template)
    const createdTemplate = await service.createTemplate(templateBase, tokenUser)
    expect(dataAgent.create).toHaveBeenCalledTimes(1)
    expect(createdTemplate.staticId).toBeDefined()
  })

  it('updateTemplate', async () => {
    dataAgent.update = jest.fn().mockImplementation(() => template)
    const updatedTemplate = await service.updateTemplate(staticId, templateBase, tokenUser)
    expect(dataAgent.update).toHaveBeenCalledTimes(1)
    expect(updatedTemplate.staticId).toBeDefined()
  })

  it('deleteTemplate', async () => {
    dataAgent.softDelete = jest.fn().mockImplementation(() => template)
    const deletedTemplate = await service.softDeleteTemplate(staticId)
    expect(dataAgent.softDelete).toHaveBeenCalledTimes(1)
    expect(deletedTemplate.staticId).toBeDefined()
  })

  it('getTemplate', async () => {
    dataAgent.get = jest.fn().mockImplementation(() => template)
    const getTemplate = await service.getTemplate(staticId)
    expect(dataAgent.get).toHaveBeenCalledTimes(1)
    expect(getTemplate.staticId).toBeDefined()
  })

  it('getTemplates', async () => {
    dataAgent.getAll = jest.fn().mockImplementation(() => [template])
    const getTemplates = await service.getTemplates()
    expect(dataAgent.getAll).toHaveBeenCalledTimes(1)
    expect(getTemplates[0].staticId).toBeDefined()
  })
})
