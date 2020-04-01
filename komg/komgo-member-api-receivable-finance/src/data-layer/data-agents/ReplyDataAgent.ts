import { getLogger } from '@komgo/logging'
import { ReplyType } from '@komgo/types'
import { injectable } from 'inversify'
import 'reflect-metadata'

import { IReply } from '../models/replies/IReply'
import { ReplyModel } from '../models/replies/ReplyModel'

import { toObject, logAndThrowMongoError } from './utils'

@injectable()
export class ReplyDataAgent {
  private readonly logger = getLogger('ReplyDataAgent')

  public async create(reply: IReply): Promise<IReply> {
    try {
      const replyDocument = await ReplyModel.create(reply)

      return toObject(replyDocument)
    } catch (error) {
      logAndThrowMongoError(this.logger, error, 'Unable to perform Mongo action on ReplyModel model: create')
    }
  }

  public async updateCreate(reply: IReply): Promise<void> {
    try {
      await ReplyModel.updateOne({ staticId: reply.staticId, createdAt: reply.createdAt }, reply, {
        upsert: true,
        timestamps: false,
        setDefaultsOnInsert: true
      }).exec()
    } catch (error) {
      logAndThrowMongoError(this.logger, error, 'Unable to perform Mongo action on ReplyModel: updateCreate')
    }
  }

  public async findByStaticId(staticId: string): Promise<IReply> {
    try {
      const replyDocument = await ReplyModel.findOne({ staticId }).exec()
      return toObject(replyDocument)
    } catch (error) {
      logAndThrowMongoError(this.logger, error, 'Unable to perform Mongo action on IReply model: findByStaticId')
    }
  }

  public async findByRdId(rdId: string): Promise<IReply> {
    try {
      const replyDocument = await ReplyModel.findOne({ rdId }).exec()
      return toObject(replyDocument)
    } catch (error) {
      logAndThrowMongoError(this.logger, error, 'Unable to perform Mongo action on IReply model: findByRdId')
    }
  }

  public async findByRdIdAndType(rdId: string, replyType: ReplyType): Promise<IReply> {
    try {
      const replyDocument = await ReplyModel.findOne({ rdId, type: replyType }).exec()
      return toObject(replyDocument)
    } catch (error) {
      logAndThrowMongoError(this.logger, error, 'Unable to perform Mongo action on IReply model: findByRdIdAndType')
    }
  }

  public async findByQuoteIdAndType(quoteId: string, replyType: ReplyType): Promise<IReply> {
    try {
      const replyDocument = await ReplyModel.findOne({ quoteId, type: replyType }).exec()
      return toObject(replyDocument)
    } catch (error) {
      logAndThrowMongoError(this.logger, error, 'Unable to perform Mongo action on IReply model: findByQuoteIdAndType')
    }
  }

  public async findAllByRdId(rdId: string, participantId?: string): Promise<IReply[]> {
    try {
      const filter: any = { rdId }
      if (participantId) {
        filter.participantId = participantId
      }
      const replyDocuments = await ReplyModel.find(filter)
        .sort({ createdAt: 'ascending' })
        .exec()
      return replyDocuments.map(toObject)
    } catch (error) {
      logAndThrowMongoError(
        this.logger,
        error,
        'Unable to perform Mongo action on IReply model: findAllByRdIdAndParticipantId'
      )
    }
  }
}
