import { injectable } from 'inversify'
import { ILCPresentationDataAgent } from './ILCPresentationDataAgent'
import { ILCPresentation } from '../../models/ILCPresentation'
import { LCPresentationRepo } from '../../mongodb/LCPresentationRepo'
import { getLogger } from '@komgo/logging'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../../exceptions/utils'
import { DatabaseConnectionException, ContentNotFoundException } from '../../../exceptions'
@injectable()
export class LCPresentationDataAgent implements ILCPresentationDataAgent {
  private readonly logger = getLogger('LCPresentationDataAgent')

  async savePresentation(presentation: ILCPresentation): Promise<ILCPresentation> {
    let entity: ILCPresentation

    try {
      entity = await LCPresentationRepo.findOneAndUpdate({ staticId: presentation.staticId }, presentation, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      })
    } catch (error) {
      this.logger.error(
        ErrorCode.ConnectionDatabase,
        ErrorNames.LCPresentationSaveFailed,
        error.message,
        {
          presentationId: presentation.staticId
        },
        new Error().stack
      )
      throw new DatabaseConnectionException('Failed to save LC presentation.')
    }

    return entity
  }

  public async updateField(id: string, field: keyof ILCPresentation, value: any) {
    let result
    try {
      result = await LCPresentationRepo.findOneAndUpdate({ staticId: id }, { $set: { [field]: value } })

      return result
    } catch (error) {
      this.logger.error(ErrorCode.ConnectionDatabase, ErrorNames.LCPresentationUpdateFailed, error.message, {
        id,
        field,
        value
      })
      throw new DatabaseConnectionException(`Failed to update LCPresentation with id ${id}`)
    }
  }

  async getById(id: string): Promise<ILCPresentation> {
    try {
      return LCPresentationRepo.findOne({ staticId: id, deletedAt: null })
    } catch (error) {
      this.logger.error(
        ErrorCode.ConnectionDatabase,
        ErrorNames.LCPresentationGetByIdFailed,
        error.message,
        {
          presentationId: id
        },
        new Error().stack
      )
      throw new DatabaseConnectionException('Failed to get LC presentation.')
    }
  }

  async getByReference(reference: string): Promise<ILCPresentation> {
    return LCPresentationRepo.findOne({ reference, deletedAt: null })
  }

  async getByAttributes(attibutes): Promise<ILCPresentation> {
    return LCPresentationRepo.findOne({ ...attibutes, deletedAt: null })
  }

  async getByLcReference(reference: string): Promise<ILCPresentation[]> {
    return LCPresentationRepo.find({ LCReference: reference, deletedAt: null })
  }

  async deleteLCPresentation(id: string): Promise<void> {
    const query = {
      staticId: id,
      deletedAt: null
    }
    const result = await LCPresentationRepo.updateOne(query, { deletedAt: Date.now() })
    if (!result.n) {
      this.logger.error(
        ErrorCode.DatabaseMissingData,
        ErrorNames.LCPresentationDeleteFailed,
        `LC presentation not found`,
        {
          action: 'delete',
          entityType: 'presentation',
          id
        },
        new Error().stack
      )
      throw new ContentNotFoundException(`LC presentation not found`)
    }

    return undefined
  }
}
