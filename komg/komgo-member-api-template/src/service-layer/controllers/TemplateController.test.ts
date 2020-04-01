import { buildFakeTemplateBase, ITemplateBase, buildFakeTemplate, ITemplate, TemplateOrigin } from '@komgo/types'

import { TemplateController } from './TemplateController'

let service
let template: ITemplate
const MOCK_ENCODED_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
const decodedUser = { name: 'John Doe' }

describe('TemplateController', () => {
  let controller: TemplateController
  let sampleTemplateBase: ITemplateBase

  beforeEach(() => {
    service = {
      createTemplate: jest.fn(),
      getTemplate: jest.fn(),
      softDeleteTemplate: jest.fn(),
      updateTemplate: jest.fn(),
      getTemplates: jest.fn(),
      count: jest.fn()
    }
    template = buildFakeTemplate()
  })

  describe('create', () => {
    beforeEach(() => {
      sampleTemplateBase = buildFakeTemplateBase()
      controller = new TemplateController(service)
    })

    it('should create new template successfully', async () => {
      service.createTemplate = jest.fn().mockImplementation(() => Promise.resolve(template))
      const result = await controller.create(MOCK_ENCODED_JWT, sampleTemplateBase)
      expect(result.staticId).toBeDefined()
    })

    it('should failed on create a new template - database error', async () => {
      service.createTemplate = jest.fn().mockImplementation(() => {
        throw new Error('Invalid data')
      })

      await expect(controller.create(MOCK_ENCODED_JWT, sampleTemplateBase)).rejects.toBeDefined()
      expect(service.createTemplate).toHaveBeenCalledWith(sampleTemplateBase, decodedUser)
    })

    it('should fail due to invalid data', async () => {
      const badTemplate = {
        ...buildFakeTemplateBase(),
        productId: 'fake value'
      } as any

      try {
        await controller.create(MOCK_ENCODED_JWT, badTemplate)
      } catch (error) {
        expect(service.createTemplate).not.toHaveBeenCalled()
      }
    })
  })

  describe('get', () => {
    beforeEach(() => {
      controller = new TemplateController(service)
    })

    it('success', async () => {
      const staticId = '75d27f9a-10fd-4350-a7f6-9acccfa75ecb'

      service.getTemplate = jest.fn().mockImplementation(() => Promise.resolve(template))

      const templateResponse = await controller.get(staticId)

      expect(service.getTemplate).toHaveBeenCalledWith(staticId)
      expect(templateResponse).toEqual(template)
    })

    it('returns 404', async () => {
      const staticId = '75d27f9a-10fd-4350-a7f6-9acccfa75ecb'

      service.getTemplate = jest.fn().mockImplementation(() => Promise.resolve(null))

      await expect(controller.get(staticId)).rejects.toBeDefined()

      expect(service.getTemplate).toHaveBeenCalledWith(staticId)
    })

    it('returns 500', async () => {
      const staticId = '75d27f9a-10fd-4350-a7f6-9acccfa75ecb'

      service.getTemplate = jest.fn().mockImplementation(() => Promise.reject(new Error('Not found')))

      await expect(controller.get(staticId)).rejects.toBeDefined()

      expect(service.getTemplate).toHaveBeenCalledWith(staticId)
    })
  })

  describe('getAll', () => {
    beforeEach(() => {
      controller = new TemplateController(service)
    })

    it('success', async () => {
      service.getTemplates = jest.fn().mockImplementation(() => Promise.resolve([template]))
      service.count = jest.fn().mockImplementation(() => Promise.resolve(10))

      const templateResponse = await controller.getAll()

      expect(service.getTemplates).toHaveBeenCalledTimes(1)
      expect(templateResponse).toEqual({
        items: [template],
        total: 10,
        limit: 100,
        skip: 0
      })
    })

    it('returns 500', async () => {
      service.getTemplates = jest.fn().mockImplementation(() => Promise.reject(new Error('Not found')))

      await expect(controller.getAll()).rejects.toBeDefined()

      expect(service.getTemplates).toHaveBeenCalledTimes(1)
    })
  })

  describe('update', () => {
    beforeEach(() => {
      controller = new TemplateController(service)
    })

    it('success', async () => {
      const staticId = '75d27f9a-10fd-4350-a7f6-9acccfa75ecb'
      service.updateTemplate = jest.fn().mockImplementation(() => Promise.resolve(template))
      const templateResponse = await controller.update(MOCK_ENCODED_JWT, staticId, sampleTemplateBase)
      expect(templateResponse).toBeDefined()
    })

    it('404 if template does not exist', async () => {
      const staticId = '75d27f9a-10fd-4350-a7f6-9acccfa75ecb'
      service.updateTemplate = jest.fn().mockImplementation(() => Promise.resolve(undefined))
      await expect(controller.update(MOCK_ENCODED_JWT, staticId, sampleTemplateBase)).rejects.toBeDefined()
    })

    it('500 if error', async () => {
      const staticId = '75d27f9a-10fd-4350-a7f6-9acccfa75ecb'
      service.updateTemplate = jest.fn().mockImplementation(() => Promise.reject(new Error('error')))
      await expect(controller.update(MOCK_ENCODED_JWT, staticId, sampleTemplateBase)).rejects.toBeDefined()
      expect(service.updateTemplate).toHaveBeenCalledWith(staticId, sampleTemplateBase, decodedUser)
    })

    it('should fail if updating system template', async () => {
      const staticId = '75d27f9a-10fd-4350-a7f6-9acccfa75ecb'
      service.getTemplate = jest
        .fn()
        .mockImplementation(() => Promise.resolve({ ...template, origin: TemplateOrigin.System }))
      await expect(controller.update(MOCK_ENCODED_JWT, staticId, sampleTemplateBase)).rejects.toHaveProperty(
        'status',
        422
      )
      expect(service.updateTemplate).not.toHaveBeenCalled()
    })
  })

  describe('delete', () => {
    beforeEach(() => {
      controller = new TemplateController(service)
    })

    it('success', async () => {
      const staticId = '75d27f9a-10fd-4350-a7f6-9acccfa75ecb'
      service.softDeleteTemplate = jest.fn().mockImplementation(() => Promise.resolve(template))
      const templateResponse = await controller.delete(staticId)
      expect(templateResponse).toBeDefined()
    })

    it('404 if template does not exist', async () => {
      const staticId = '75d27f9a-10fd-4350-a7f6-9acccfa75ecb'
      service.softDeleteTemplate = jest.fn().mockImplementation(() => Promise.resolve(undefined))
      await expect(controller.delete(staticId)).rejects.toBeDefined()
    })

    it('500 if error', async () => {
      const staticId = '75d27f9a-10fd-4350-a7f6-9acccfa75ecb'
      service.softDeleteTemplate = jest.fn().mockImplementation(() => Promise.reject(new Error('error')))
      await expect(controller.delete(staticId)).rejects.toBeDefined()
      expect(service.softDeleteTemplate).toHaveBeenCalledWith(staticId)
    })

    it('should fail if deleting system template', async () => {
      const staticId = '75d27f9a-10fd-4350-a7f6-9acccfa75ecb'
      service.getTemplate = jest
        .fn()
        .mockImplementation(() => Promise.resolve({ ...template, origin: TemplateOrigin.System }))
      await expect(controller.delete(staticId)).rejects.toHaveProperty('status', 422)
      expect(service.softDeleteTemplate).not.toHaveBeenCalled()
    })
  })
})
