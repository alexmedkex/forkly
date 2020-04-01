import 'reflect-metadata'
import {
  ITemplateBindingBase,
  buildFakeTemplateBindingBase,
  ITemplateBinding,
  buildFakeTemplateBinding
} from '@komgo/types'
import { ITemplateBindingDataAgent } from '../../data-layer/data-agents'
import { TemplateBindingService } from './TemplateBindingService'

const dataAgent: ITemplateBindingDataAgent = {
  create: jest.fn(),
  get: jest.fn(),
  getAll: jest.fn(),
  count: jest.fn()
}

const staticId = '75d27f9a-10fd-4350-a7f6-9acccfa75ecb'

describe('TemplateBindingService', () => {
  let service: TemplateBindingService
  let templateBindingBase: ITemplateBindingBase
  let templateBinding: ITemplateBinding

  beforeEach(() => {
    service = new TemplateBindingService(dataAgent)
    templateBindingBase = buildFakeTemplateBindingBase()
    templateBinding = buildFakeTemplateBinding()
  })

  it('createTemplateBinding', async () => {
    const createdTemplateBinding = await service.create(templateBindingBase)
    expect(dataAgent.create).toHaveBeenCalledTimes(1)
    expect(createdTemplateBinding.staticId).toBeDefined()
  })

  it('getTemplateBinding', async () => {
    dataAgent.get = jest.fn().mockImplementation(() => templateBinding)
    const getTemplateBinding = await service.get(staticId)
    expect(dataAgent.get).toHaveBeenCalledTimes(1)
    expect(getTemplateBinding.staticId).toBeDefined()
  })

  it('getTemplateBindings', async () => {
    dataAgent.getAll = jest.fn().mockImplementation(() => [templateBinding])
    const getTemplateBindings = await service.getAll()
    expect(dataAgent.getAll).toHaveBeenCalledTimes(1)
    expect(getTemplateBindings[0].staticId).toBeDefined()
  })

  it('countTemplateBindings', async () => {
    dataAgent.count = jest.fn().mockImplementation(() => 1)
    const bindingsCount = await service.count()
    expect(dataAgent.count).toHaveBeenCalledTimes(1)
    expect(bindingsCount).toEqual(1)
  })
})
