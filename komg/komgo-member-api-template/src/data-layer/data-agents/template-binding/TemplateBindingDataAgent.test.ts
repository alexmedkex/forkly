import 'reflect-metadata'

const templateBindingRepo = {
  create: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  count: jest.fn()
}

jest.mock('../../mongodb/TemplateBindingRepo', () => ({
  TemplateBindingRepo: templateBindingRepo
}))

import { ITemplateBinding, buildFakeTemplateBinding } from '@komgo/types'

import { DatabaseConnectionException } from '../../../exceptions'

import { TemplateBindingDataAgent } from './TemplateBindingDataAgent'

describe('TemplateBindingDataAgent', () => {
  const dataAgent = new TemplateBindingDataAgent()
  let mockTemplateBinding: ITemplateBinding

  beforeEach(() => {
    templateBindingRepo.create.mockReset()
    mockTemplateBinding = buildFakeTemplateBinding()
  })

  it('is defined', () => {
    expect(new TemplateBindingDataAgent()).toBeDefined()
  })

  describe('create', () => {
    it('Should create a new template binding', async () => {
      const staticId = {
        staticId: '123'
      }

      templateBindingRepo.create.mockImplementation(() => {
        return staticId
      })

      await dataAgent.create(mockTemplateBinding)

      expect(templateBindingRepo.create).toHaveBeenCalled()
      expect(templateBindingRepo.create).toHaveBeenCalledWith(mockTemplateBinding)
      expect(templateBindingRepo.create).toHaveBeenCalledTimes(1)
    })

    it('Should throw a error if the new data is invalid', async () => {
      templateBindingRepo.create.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      const result = dataAgent.create(mockTemplateBinding)
      await expect(result).rejects.toEqual(
        new DatabaseConnectionException('Failed to save the template-binding Invalid data')
      )
    })
  })

  describe('get', () => {
    let mockTemplateBindingDocument

    beforeEach(() => {
      mockTemplateBindingDocument = {
        toObject: () => mockTemplateBinding
      }
    })

    it('Should get a template binding', async () => {
      const staticId = {
        staticId: '123'
      }

      templateBindingRepo.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(mockTemplateBindingDocument)
      })

      await dataAgent.get('123')

      expect(templateBindingRepo.findOne).toHaveBeenCalled()
      expect(templateBindingRepo.findOne).toHaveBeenCalledWith(staticId)
      expect(templateBindingRepo.findOne).toHaveBeenCalledTimes(1)
    })

    it('Should handle gracefully is an error happens happens when calling the templateBindingRepo', async () => {
      const errorMessage = 'Invalid data'
      const staticId = '123'

      templateBindingRepo.findOne.mockReturnValueOnce({
        exec: jest.fn().mockRejectedValueOnce(new Error(`${errorMessage}`))
      })

      const result = dataAgent.get(`${staticId}`)

      await expect(result).rejects.toEqual(
        new DatabaseConnectionException(`Failed to get the template-binding ${staticId} ${errorMessage}`)
      )
    })
  })

  describe('getAll', () => {
    let mockTemplateBindingDocument

    beforeEach(() => {
      mockTemplateBindingDocument = {
        toObject: () => mockTemplateBinding
      }
    })

    it('Should get all template bindings', async () => {
      templateBindingRepo.find.mockReturnValueOnce({
        skip: jest.fn().mockReturnValueOnce({
          limit: jest.fn().mockReturnValueOnce({
            exec: jest.fn().mockResolvedValueOnce([mockTemplateBindingDocument])
          })
        })
      })

      await dataAgent.getAll()

      expect(templateBindingRepo.find).toHaveBeenCalled()
      expect(templateBindingRepo.find).toHaveBeenCalledTimes(1)
    })

    it('Should handle gracefully is an error happens when calling the templateBindingRepo', async () => {
      const errorMessage = 'Invalid data'
      templateBindingRepo.find.mockReturnValueOnce({
        skip: jest.fn().mockReturnValueOnce({
          limit: jest.fn().mockReturnValueOnce({
            exec: jest.fn().mockRejectedValueOnce(new Error(`${errorMessage}`))
          })
        })
      })
      templateBindingRepo.find.mockReturnValueOnce({
        exec: jest.fn().mockRejectedValueOnce(new Error(`${errorMessage}`))
      })

      const result = dataAgent.getAll()

      await expect(result).rejects.toEqual(
        new DatabaseConnectionException(`Failed to get template-bindings ${errorMessage}`)
      )
    })
  })
})
