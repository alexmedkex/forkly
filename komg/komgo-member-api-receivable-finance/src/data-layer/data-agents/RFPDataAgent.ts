import { getLogger } from '@komgo/logging'
import { injectable } from 'inversify'
import 'reflect-metadata'

import { IRFPRequest } from '../models/rfp/IRFPRequestDocument'
import { RFPRequestModel } from '../models/rfp/RFPRequestModel'

import { toObject, logAndThrowMongoError } from './utils'

@injectable()
export class RFPDataAgent {
  private readonly logger = getLogger('RFPDataAgent')

  public async create(rfpRequest: IRFPRequest): Promise<void> {
    try {
      await RFPRequestModel.create({ ...rfpRequest })
    } catch (error) {
      logAndThrowMongoError(this.logger, error, 'Unable to perform Mongo action on RFPrequest model: create')
    }
  }

  public async updateCreate(rfpRequest: IRFPRequest): Promise<void> {
    try {
      await RFPRequestModel.updateOne(
        { rfpId: rfpRequest.rfpId },
        { ...rfpRequest },
        { upsert: true, timestamps: false, setDefaultsOnInsert: true }
      ).exec()
    } catch (error) {
      logAndThrowMongoError(this.logger, error, 'Unable to perform Mongo action on RFPRequestModel model: updateCreate')
    }
  }

  public async findByRdId(rdId: string): Promise<IRFPRequest> {
    try {
      const rfpDocument = await RFPRequestModel.findOne({ rdId }).exec()
      return toObject(rfpDocument)
    } catch (error) {
      logAndThrowMongoError(this.logger, error, 'Unable to perform Mongo action on RFPrequest model: findByRdId')
    }
  }

  public async findByRfpId(rfpId: string): Promise<IRFPRequest> {
    try {
      const rfpDocument = await RFPRequestModel.findOne({ rfpId }).exec()
      return toObject(rfpDocument)
    } catch (error) {
      logAndThrowMongoError(this.logger, error, 'Unable to perform Mongo action on RFPrequest model: findByRfpId')
    }
  }
}
