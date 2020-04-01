import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ITemplateBinding } from '@komgo/types'
import { injectable } from 'inversify'

import { DatabaseConnectionException, ErrorNames } from '../../../exceptions'
import { TemplateBindingRepo } from '../../mongodb/TemplateBindingRepo'

import { ITemplateBindingDataAgent } from './ITemplateBindingDataAgent'

@injectable()
export class TemplateBindingDataAgent implements ITemplateBindingDataAgent {
  private readonly logger = getLogger('TemplateBindingDataAgent')

  async create(template: ITemplateBinding): Promise<string> {
    try {
      const { staticId } = await TemplateBindingRepo.create(template)
      return staticId
    } catch (e) {
      const error = `Failed to save the template-binding ${e.message}`
      this.logger.error(ErrorCode.ConnectionDatabase, ErrorNames.SaveTemplateBindingFailed, {
        error,
        stackTrace: new Error().stack
      })
      throw new DatabaseConnectionException(error)
    }
  }

  async get(staticId: string): Promise<ITemplateBinding> {
    try {
      const templateBindingDocument = await TemplateBindingRepo.findOne({ staticId }).exec()
      return templateBindingDocument ? templateBindingDocument.toObject() : null
    } catch (e) {
      const error = `Failed to get the template-binding ${staticId} ${e.message}`
      this.logger.error(ErrorCode.ConnectionDatabase, ErrorNames.GetTemplateBindingFailed, e.message, {
        stackTrace: e.stack
      })
      throw new DatabaseConnectionException(error)
    }
  }

  async getAll(projection: object = {}, options = { skip: undefined, limit: undefined }): Promise<ITemplateBinding[]> {
    try {
      const { skip, limit } = options
      const templateBindings: ITemplateBinding[] = await TemplateBindingRepo.find({}, projection, options)
        .skip(skip)
        .limit(limit)
        .exec()
      return templateBindings
    } catch (e) {
      const error = `Failed to get template-bindings ${e.message}`
      this.logger.error(ErrorCode.ConnectionDatabase, ErrorNames.GetTemplateBindingFailed, e.message, {
        stackTrace: e.stack
      })
      throw new DatabaseConnectionException(error)
    }
  }

  async count(): Promise<number> {
    try {
      const bindingsCount: number = await TemplateBindingRepo.find({}).count()
      return bindingsCount
    } catch (e) {
      const error = `Failed to count template-bindings ${e.message}`
      this.logger.error(ErrorCode.ConnectionDatabase, ErrorNames.GetTemplateBindingFailed, e.message, {
        stackTrace: e.stack
      })
      throw new DatabaseConnectionException(error)
    }
  }
}
