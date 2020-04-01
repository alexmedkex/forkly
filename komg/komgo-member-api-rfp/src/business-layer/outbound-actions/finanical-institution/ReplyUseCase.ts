import { ActionType, IRFPReplyResponse } from '@komgo/types'
import { injectable } from 'inversify'

import { inject } from '../../../inversify/ioc'
import { TYPES } from '../../../inversify/types'
import SendOutboundReplyUseCase from '../SendOutboundReplyUseCase'

import { CreateFinancialInstitutionReplyUseCase } from './CreateFinancialInstitutionReplyUseCase'

@injectable()
export class ReplyUseCase {
  constructor(
    @inject(TYPES.CreateFinancialInstitutionReplyUseCase)
    private readonly createFinancialInstitutionReplyUseCase: CreateFinancialInstitutionReplyUseCase,
    @inject(TYPES.SendOutboundReplyUseCase) private readonly sendOutboundReplyUseCase: SendOutboundReplyUseCase
  ) {}

  public async execute(rfpId: string, actionType: ActionType, responseData: any): Promise<IRFPReplyResponse> {
    await this.createFinancialInstitutionReplyUseCase.execute(rfpId, actionType, responseData)
    const outboundActionResult = await this.sendOutboundReplyUseCase.execute(rfpId, actionType)
    return { rfpId, actionStatus: outboundActionResult }
  }
}
