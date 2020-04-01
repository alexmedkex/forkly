import {
  buildFakeTemplateBase,
  buildFakeTemplate,
  ITemplate,
  ITemplateBindingBase,
  ITemplateBinding,
  buildFakeTemplateBinding,
  buildFakeTemplateBindingBase
} from '@komgo/types'
import { TemplateBindingController } from './TemplateBindingController'
import { TemplateBindingService } from '../services/TemplateBindingService'

let service
let templateBinding: ITemplateBinding

describe('TemplateBindingController', () => {
  let controller: TemplateBindingController
  let templateBindingBase: ITemplateBindingBase

  beforeEach(() => {
    service = {
      create: jest.fn(),
      count: jest.fn(),
      get: jest.fn(),
      getAll: jest.fn()
    }
    templateBinding = buildFakeTemplateBinding()
  })

  describe('create', () => {
    beforeEach(() => {
      templateBindingBase = buildFakeTemplateBindingBase()
      controller = new TemplateBindingController(service)
    })

    it('should create new template binding successfully', async () => {
      service.create = jest.fn().mockImplementation(() => Promise.resolve(templateBinding))
      const result = await controller.create(templateBindingBase)
      expect(result.staticId).toBeDefined()
    })

    it('should failed on create a new template binding- database error', async () => {
      service.create = jest.fn().mockImplementation(() => {
        throw new Error('Invalid data')
      })

      await expect(controller.create(templateBindingBase)).rejects.toBeDefined()
      expect(service.create).toHaveBeenCalledWith(templateBindingBase)
    })

    it('should fail due to invalid data', async () => {
      const badTemplate = {
        ...buildFakeTemplateBase(),
        productId: 'fake value'
      } as any

      try {
        await controller.create(badTemplate)
      } catch (error) {
        expect(service.createTemplate).not.toHaveBeenCalled()
      }
    })
  })

  describe('get', () => {
    beforeEach(() => {
      controller = new TemplateBindingController(service)
    })

    it('success', async () => {
      const staticId = '75d27f9a-10fd-4350-a7f6-9acccfa75ecb'

      service.get = jest.fn().mockImplementation(() => Promise.resolve(templateBinding))

      const bindingResponse = await controller.get(staticId)

      expect(service.get).toHaveBeenCalledWith(staticId)
      expect(bindingResponse).toEqual(templateBinding)
    })

    it('returns 404', async () => {
      const staticId = '75d27f9a-10fd-4350-a7f6-9acccfa75ecb'

      service.get = jest.fn().mockImplementation(() => Promise.resolve(null))

      await expect(controller.get(staticId)).rejects.toBeDefined()

      expect(service.get).toHaveBeenCalledWith(staticId)
    })

    it('returns 500', async () => {
      const staticId = '75d27f9a-10fd-4350-a7f6-9acccfa75ecb'

      service.get = jest.fn().mockImplementation(() => Promise.reject(new Error('Error')))

      await expect(controller.get(staticId)).rejects.toBeDefined()

      expect(service.get).toHaveBeenCalledWith(staticId)
    })
  })

  describe('getAll', () => {
    beforeEach(() => {
      controller = new TemplateBindingController(service)
    })

    it('success', async () => {
      service.getAll = jest.fn().mockImplementation(() => Promise.resolve([templateBinding]))
      service.count = jest.fn().mockImplementation(() => Promise.resolve(10))

      const templateBindingsResponse = await controller.getAll()

      expect(service.getAll).toHaveBeenCalledTimes(1)
      expect(templateBindingsResponse).toEqual({
        items: [templateBinding],
        total: 10,
        limit: 100,
        skip: 0
      })
    })

    it('returns 500', async () => {
      service.getAll = jest.fn().mockImplementation(() => Promise.reject(new Error('Not found')))

      await expect(controller.getAll()).rejects.toBeDefined()

      expect(service.getAll).toHaveBeenCalledTimes(1)
    })
  })
})
