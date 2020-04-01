import { getLogger } from '@komgo/logging'
import { IReceivablesDiscounting, IReceivablesDiscountingBase } from '@komgo/types'
import { injectable } from 'inversify'

import { IReceivablesDiscountingDocument } from '../models/receivables-discounting/IReceivablesDiscountingDocument'
import { ReceivablesDiscountingModel } from '../models/receivables-discounting/ReceivablesDiscountingModel'

import { toObject, logAndThrowMongoError, toExtended } from './utils'

@injectable()
export class ReceivablesDiscountingDataAgent {
  private readonly logger = getLogger('ReceivablesDiscountingDataAgent')

  public async create(receivablesDiscounting: IReceivablesDiscountingBase): Promise<IReceivablesDiscounting> {
    try {
      const rdWithStatidId = toExtended(receivablesDiscounting)
      const rdDocument = await ReceivablesDiscountingModel.create(rdWithStatidId)

      return toObject(rdDocument)
    } catch (error) {
      logAndThrowMongoError(this.logger, error, 'Unable to perform Mongo action on RD model: create')
    }
  }

  /**
   * Creates or updates a Receivables Discounting
   */
  public async updateCreate(receivablesDiscounting: IReceivablesDiscounting): Promise<void> {
    try {
      await ReceivablesDiscountingModel.updateOne(
        { staticId: receivablesDiscounting.staticId, createdAt: receivablesDiscounting.createdAt },
        { ...receivablesDiscounting },
        { upsert: true, timestamps: false }
      ).exec()
    } catch (error) {
      logAndThrowMongoError(
        this.logger,
        error,
        'Unable to perform Mongo action on ReceivablesDiscountingModel model: updateOne'
      )
    }
  }

  /**
   * Stores an updated Receivables Discounting object by appending to the collection
   */
  public async update(
    id: string,
    receivablesDiscounting: IReceivablesDiscountingBase
  ): Promise<IReceivablesDiscounting> {
    try {
      const rdDocument = await ReceivablesDiscountingModel.create({
        ...receivablesDiscounting,
        staticId: id
      })
      return toObject(rdDocument)
    } catch (error) {
      logAndThrowMongoError(
        this.logger,
        error,
        'Unable to perform RD update - Mongo action on ReceivablesDiscountingModel model: create'
      )
    }
  }

  /**
   * Replaces a Receivables Discounting object
   */
  public async replace(staticId: string, replacement: IReceivablesDiscountingBase): Promise<IReceivablesDiscounting> {
    try {
      const rdDocument = await ReceivablesDiscountingModel.findOneAndUpdate(
        { staticId },
        { $set: replacement },
        {
          new: true,
          upsert: false
        }
      ).exec()
      return toObject(rdDocument)
    } catch (error) {
      logAndThrowMongoError(
        this.logger,
        error,
        'Unable to perform RD replace - Mongo action on ReceivablesDiscountingModel model: replace'
      )
    }
  }

  async findByStaticId(staticId: string): Promise<IReceivablesDiscounting> {
    try {
      const rdDocument = await ReceivablesDiscountingModel.find({ staticId })
        .limit(1)
        .sort({ createdAt: -1 })
        .exec()
      return rdDocument.length > 0 ? toObject(rdDocument[0]) : null
    } catch (error) {
      logAndThrowMongoError(this.logger, error, 'Unable to perform Mongo action on RD model: findLatestByStaticI')
    }
  }

  /**
   * Returns all the RD's with the given staticId.  You will have multiple entries with the same
   * staticId if the RD has been updated
   *
   * @param staticId
   */
  async findAllByStaticId(staticId: string): Promise<IReceivablesDiscounting[]> {
    try {
      const rdDocuments = await ReceivablesDiscountingModel.find({ staticId })
        .sort({ createdAt: 1 })
        .exec()

      return rdDocuments.map(rdDocument => {
        return toObject(rdDocument)
      })
    } catch (error) {
      logAndThrowMongoError(this.logger, error, 'Unable to perform Mongo action on RD model: findAllByStaticId')
    }
  }

  async findByTradeSourceId(sourceId: string): Promise<IReceivablesDiscounting> {
    try {
      const rdDocument = await ReceivablesDiscountingModel.find({
        'tradeReference.sourceId': sourceId
      })
        .limit(1)
        .sort({ createdAt: -1 })
        .exec()

      return rdDocument.length > 0 ? toObject(rdDocument[0]) : null
    } catch (error) {
      logAndThrowMongoError(this.logger, error, 'Unable to perform Mongo action on RD model: findByTrade')
    }
  }
  async findByTrade(sourceId: string, sellerEtrmId: string): Promise<IReceivablesDiscounting> {
    try {
      const rdDocument = await ReceivablesDiscountingModel.find({
        $or: [{ 'tradeReference.sourceId': sourceId }, { 'tradeReference.sellerEtrmId': sellerEtrmId }]
      })
        .limit(1)
        .sort({ createdAt: -1 })
        .exec()

      return rdDocument.length > 0 ? toObject(rdDocument[0]) : null
    } catch (error) {
      logAndThrowMongoError(this.logger, error, 'Unable to perform Mongo action on RD model: findByTrade')
    }
  }

  /**
   * Find all RDs that match the giving tradeIds ordered by decending created date
   * @param sourceIds the trade source IDs
   */
  async findByTradeSourceIds(sourceIds: string[]): Promise<IReceivablesDiscounting[]> {
    try {
      const rdDocumentsOutput: IRDDocOutput[] = await ReceivablesDiscountingModel.aggregate([
        { $match: { 'tradeReference.sourceId': { $in: sourceIds } } },
        { $sort: { staticId: 1, createdAt: 1 } },
        {
          $group: {
            _id: '$staticId',
            lastRDCreated: { $last: '$$ROOT' }
          }
        },
        { $sort: { 'lastRDCreated.createdAt': -1 } }
      ]).exec()
      return this.rdQueryOutputToRDs(rdDocumentsOutput)
    } catch (error) {
      logAndThrowMongoError(this.logger, error, 'Unable to perform Mongo action on RD model: findByTradeSourceIds')
    }
  }

  /**
   * Find all RDs ordered by decending created date
   */
  async findAll(): Promise<IReceivablesDiscounting[]> {
    try {
      // We now add a new RD object to the collection when we update an RD. This can lead to many RDs with the same staticId.
      // The active one is always the last RD to be created. The following query will return all the RDs with the latest createdAt date.
      const rdDocumentsOutput: IRDDocOutput[] = await ReceivablesDiscountingModel.aggregate([
        { $sort: { staticId: 1, createdAt: 1 } },
        {
          $group: {
            _id: '$staticId',
            lastRDCreated: { $last: '$$ROOT' }
          }
        },
        { $sort: { 'lastRDCreated.createdAt': -1 } }
      ]).exec()
      return this.rdQueryOutputToRDs(rdDocumentsOutput)
    } catch (error) {
      logAndThrowMongoError(this.logger, error, 'Error finding all RDs')
    }
  }

  private rdQueryOutputToRDs(rdDocumentsOutput: IRDDocOutput[]) {
    return rdDocumentsOutput.map(output => {
      delete output.lastRDCreated._id
      return output.lastRDCreated
    })
  }
}

interface IRDDocOutput {
  _id: string
  lastRDCreated: IReceivablesDiscountingDocument
}
