import 'reflect-metadata'

const templateRepo = {
  create: jest.fn(),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  find: jest.fn(),
  skip: jest.fn(),
  limit: jest.fn(),
  exec: jest.fn()
}

jest.mock('../../mongodb/TemplateRepo', () => ({
  TemplateRepo: templateRepo
}))

import { buildFakeTemplate, ITemplate } from '@komgo/types'

import { DatabaseConnectionException } from '../../../exceptions'

import { TemplateDataAgent } from './TemplateDataAgent'
import { TokenUser } from '../../../service-layer/utils/TokenUser'

const staticId = '75d27f9a-10fd-4350-a7f6-9acccfa75ecb'
const tokenUser: TokenUser = { name: 'name' }

describe('TemplateDataAgent', () => {
  const dataAgent = new TemplateDataAgent()
  let mockTemplate: ITemplate

  beforeEach(() => {
    mockTemplate = buildFakeTemplate()
    templateRepo.create.mockReset()
  })

  it('is defined', () => {
    expect(new TemplateDataAgent()).toBeDefined()
  })

  describe('create', () => {
    it('Should create a new template', async () => {
      templateRepo.create.mockImplementation(() => {
        return {
          staticId: '123'
        }
      })

      await dataAgent.create(mockTemplate)

      expect(templateRepo.create).toHaveBeenCalled()
      expect(templateRepo.create).toHaveBeenCalledWith(mockTemplate)
      expect(templateRepo.create).toHaveBeenCalledTimes(1)
    })

    it('Should throw a error if the new data is invalid', async () => {
      templateRepo.create.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      const result = dataAgent.create(mockTemplate)
      await expect(result).rejects.toEqual(new DatabaseConnectionException('Failed to save the template Invalid data'))
    })
  })

  describe('update', () => {
    it('Should update a template', async () => {
      templateRepo.findOneAndUpdate.mockImplementation(() => {
        return mockTemplate
      })

      await dataAgent.update(staticId, mockTemplate, tokenUser)

      expect(templateRepo.findOneAndUpdate).toHaveBeenCalledTimes(1)
    })

    it('Should throw a error if the new data is invalid', async () => {
      templateRepo.findOneAndUpdate.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      const result = dataAgent.update(staticId, mockTemplate, tokenUser)
      await expect(result).rejects.toEqual(
        new DatabaseConnectionException('Failed to update the template Invalid data')
      )
    })
  })

  describe('delete', () => {
    it('Should delete a template', async () => {
      templateRepo.findOneAndUpdate.mockImplementation(() => {
        return mockTemplate
      })
      await dataAgent.softDelete(staticId)
      expect(templateRepo.findOneAndUpdate).toHaveBeenCalledTimes(1)
    })

    it('Should throw a error if the new data is invalid', async () => {
      templateRepo.findOneAndUpdate.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      const result = dataAgent.softDelete(staticId)
      await expect(result).rejects.toEqual(
        new DatabaseConnectionException('Failed to update the template for soft delete Invalid data')
      )
    })
  })

  describe('get', () => {
    let mockTemplateDocument

    beforeEach(() => {
      mockTemplateDocument = {
        toObject: () => mockTemplate
      }
    })

    it('Should get a template', async () => {
      const staticId = {
        staticId: '123'
      }

      templateRepo.findOne.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(mockTemplateDocument) })

      await dataAgent.get('123')

      expect(templateRepo.findOne).toHaveBeenCalled()
      expect(templateRepo.findOne).toHaveBeenCalledWith(staticId)
      expect(templateRepo.findOne).toHaveBeenCalledTimes(1)
    })

    it('should handle gracefully if an error happens when calling the TemplateRepo', async () => {
      const errorMessage = 'Invalid data'
      const staticId = '123'

      templateRepo.findOne.mockReturnValueOnce({ exec: jest.fn().mockRejectedValueOnce(new Error(`${errorMessage}`)) })

      const result = dataAgent.get(`${staticId}`)

      await expect(result).rejects.toEqual(
        new DatabaseConnectionException(`Failed to get the template ${staticId} ${errorMessage}`)
      )
    })
  })

  describe('getAll', () => {
    it('Should get templates', async () => {
      templateRepo.find.mockReturnValueOnce({
        skip: jest.fn().mockReturnValueOnce({
          limit: jest.fn().mockReturnValueOnce({
            exec: jest.fn().mockResolvedValueOnce([mockTemplate])
          })
        })
      })
      await dataAgent.getAll()

      expect(templateRepo.find).toHaveBeenCalled()
      expect(templateRepo.find).toHaveBeenCalledTimes(1)
    })

    it('should handle gracefully if an error happens when calling the TemplateRepo', async () => {
      const errorMessage = 'Invalid data'
      templateRepo.find.mockReturnValueOnce({
        skip: jest.fn().mockReturnValueOnce({
          limit: jest.fn().mockReturnValueOnce({
            exec: jest.fn().mockRejectedValueOnce(new Error(`${errorMessage}`))
          })
        })
      })

      const result = dataAgent.getAll()

      await expect(result).rejects.toEqual(
        new DatabaseConnectionException(`Failed to get all templates ${errorMessage}`)
      )
    })
  })
})
