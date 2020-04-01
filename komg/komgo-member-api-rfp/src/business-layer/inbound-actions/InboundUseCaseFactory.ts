import { ActionType } from '@komgo/types'
import { inject, injectable } from 'inversify'

import { TYPES } from '../../inversify/types'
import InvalidActionTypeError from '../messaging/InvalidActionTypeError'

import AbstractReceiveInboundUseCase from './AbstractReceiveInboundUseCase'
import ReceiveInboundCorporateReplyUseCase from './corporate/ReceiveInboundCorporateReplyUseCase'
import { ReceiveInboundAcceptUseCase } from './financial-institution/ReceiveInboundAcceptUseCase'
import { ReceiveInboundDeclineUseCase } from './financial-institution/ReceiveInboundDeclineUseCase'
import ReceiveInboundRequestUseCase from './financial-institution/ReceiveInboundRequestUseCase'

@injectable()
export default class InboundUseCaseFactory {
  constructor(
    @inject(TYPES.ReceiveInboundRequestUseCase)
    private readonly receiveInboundRequestUseCase: ReceiveInboundRequestUseCase,
    @inject(TYPES.ReceiveInboundCorporateReplyUseCase)
    private readonly receiveInboundCorporateReplyUseCase: ReceiveInboundCorporateReplyUseCase,
    @inject(TYPES.ReceiveInboundAcceptUseCase)
    private readonly receiveInboundAcceptUseCase: ReceiveInboundAcceptUseCase,
    @inject(TYPES.ReceiveInboundDeclineUseCase)
    private readonly receiveInboundDeclineUseCase: ReceiveInboundDeclineUseCase
  ) {}

  public getUseCase(actionType: ActionType): AbstractReceiveInboundUseCase {
    if (actionType === ActionType.Request) {
      return this.receiveInboundRequestUseCase
    } else if (actionType === ActionType.Response || actionType === ActionType.Reject) {
      return this.receiveInboundCorporateReplyUseCase
    } else if (actionType === ActionType.Accept) {
      return this.receiveInboundAcceptUseCase
    } else if (actionType === ActionType.Decline) {
      return this.receiveInboundDeclineUseCase
    }

    throw new InvalidActionTypeError(`No UseCase class matching actionType: ${actionType}`)
  }
}
