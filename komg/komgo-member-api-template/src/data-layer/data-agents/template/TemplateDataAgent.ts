import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ITemplate, ITemplateBase } from '@komgo/types'
import { injectable } from 'inversify'

import { DatabaseConnectionException, ErrorNames } from '../../../exceptions'
import { ITokenUser } from '../../../service-layer/utils/ITokenUser'
import { TemplateRepo } from '../../mongodb/TemplateRepo'

import { ITemplateDataAgent } from './ITemplateDataAgent'

@injectable()
export class TemplateDataAgent implements ITemplateDataAgent {
  private readonly logger = getLogger('TemplateDataAgent')

  async create(template: ITemplate) {
    try {
      return await TemplateRepo.create(template)
    } catch (e) {
      const error = `Failed to save the template ${e.message}`
      this.logger.error(ErrorCode.ConnectionDatabase, ErrorNames.SaveTemplateFailed, {
        error,
        stackTrace: new Error().stack
      })
      throw new DatabaseConnectionException(error)
    }
  }

  async update(staticId: string, template: ITemplateBase, user: ITokenUser) {
    try {
      delete (template as ITemplate).origin // do not update
      return TemplateRepo.findOneAndUpdate(
        { staticId, deletedAt: undefined },
        { ...template, updatedBy: user.name, updatedAt: new Date().toISOString() },
        { new: true }
      )
    } catch (e) {
      const error = `Failed to update the template ${e.message}`
      this.logger.error(ErrorCode.ConnectionDatabase, ErrorNames.UpdateTemplateFailed, {
        error,
        stackTrace: new Error().stack
      })
      throw new DatabaseConnectionException(error)
    }
  }

  async softDelete(staticId: string) {
    try {
      return TemplateRepo.findOneAndUpdate(
        { staticId, deletedAt: undefined },
        { deletedAt: new Date().toISOString() },
        { new: true }
      )
    } catch (e) {
      const error = `Failed to update the template for soft delete ${e.message}`
      this.logger.error(ErrorCode.ConnectionDatabase, ErrorNames.DeleteTemplateFailed, {
        error,
        stackTrace: new Error().stack
      })
      throw new DatabaseConnectionException(error)
    }
  }

  async get(staticId: string): Promise<ITemplate> {
    try {
      const templateDocument = await TemplateRepo.findOne({ staticId, deletedAt: undefined }).exec()
      return templateDocument ? templateDocument.toObject() : null
    } catch (e) {
      const error = `Failed to get the template ${staticId} ${e.message}`
      this.logger.error(
        ErrorCode.ConnectionDatabase,
        ErrorNames.GetTemplateFailed,
        error,
        {
          staticId
        },
        new Error().stack
      )
      throw new DatabaseConnectionException(error)
    }
  }

  async getAll(projection: object = {}, options = { skip: undefined, limit: undefined }): Promise<ITemplate[]> {
    try {
      const { skip, limit } = options
      const templates = await TemplateRepo.find({ deletedAt: undefined }, projection, options)
        .skip(skip)
        .limit(limit)
        .exec()
      return templates
    } catch (e) {
      const error = `Failed to get all templates ${e.message}`
      this.logger.error(ErrorCode.ConnectionDatabase, ErrorNames.GetTemplateFailed, error, new Error().stack)
      throw new DatabaseConnectionException(error)
    }
  }

  async count(): Promise<number> {
    const itemsCount = await TemplateRepo.find({ deletedAt: undefined }).count()
    return itemsCount
  }
}
