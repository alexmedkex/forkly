import { getLogger } from '@komgo/logging'
import { IRequestForProposalBase, IRequestForProposal } from '@komgo/types'
import { injectable } from 'inversify'

import { RequestForProposal } from '../models/mongo/RequestForProposal'

import { logAndThrowMongoError, appendStaticId, toObject } from './utils'

@injectable()
export class RequestForProposalDataAgent {
  private readonly logger = getLogger('RequestForProposalDataAgent')

  async create(rfpBase: IRequestForProposalBase): Promise<IRequestForProposal> {
    try {
      const rfpExtended = appendStaticId<IRequestForProposalBase>(rfpBase) as IRequestForProposal
      const rfp = await RequestForProposal.create(rfpExtended)
      return toObject(rfp)
    } catch (error) {
      logAndThrowMongoError(this.logger, error)
    }
  }

  async updateCreate(rfpExtended: IRequestForProposal): Promise<IRequestForProposal> {
    try {
      const rfp = await RequestForProposal.findOneAndUpdate({ staticId: rfpExtended.staticId }, rfpExtended, {
        upsert: true,
        new: true
      }).exec()
      return toObject(rfp)
    } catch (error) {
      logAndThrowMongoError(this.logger, error)
    }
  }

  async findOneByStaticId(staticId: string) {
    try {
      const rfp = await RequestForProposal.findOne({ staticId }).exec()
      return toObject(rfp)
    } catch (error) {
      logAndThrowMongoError(this.logger, error)
    }
  }
}
