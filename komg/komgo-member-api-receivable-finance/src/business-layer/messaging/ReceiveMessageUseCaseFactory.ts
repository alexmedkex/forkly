import { RFPMessageType } from '@komgo/messaging-types'
import { injectable, inject } from 'inversify'

import { TYPES } from '../../inversify/types'
import {
  ReceiveAcceptMessageUseCase,
  ReceiveDeclineMessageUseCase,
  ReceiveRequestMessageUseCase,
  ReceiveResponseMessageUseCase,
  IReceiveMessageUseCase
} from '../rfp/use-cases'

@injectable()
export class ReceiveMessageUseCaseFactory {
  constructor(
    @inject(TYPES.ReceiveRequestMessageUseCase)
    private readonly receiveRequestMessageUseCase: ReceiveRequestMessageUseCase,
    @inject(TYPES.ReceiveResponseMessageUseCase)
    private readonly receiveResponseMessageUseCase: ReceiveResponseMessageUseCase,
    @inject(TYPES.ReceiveAcceptMessageUseCase)
    private readonly receiveAcceptMessageUseCase: ReceiveAcceptMessageUseCase,
    @inject(TYPES.ReceiveDeclineMessageUseCase)
    private readonly receiveDeclineMessageUseCase: ReceiveDeclineMessageUseCase
  ) {}

  public getUseCase(rfpMessageType: RFPMessageType): IReceiveMessageUseCase {
    if (rfpMessageType === RFPMessageType.Request) {
      return this.receiveRequestMessageUseCase
    } else if (rfpMessageType === RFPMessageType.Response || rfpMessageType === RFPMessageType.Reject) {
      return this.receiveResponseMessageUseCase
    } else if (rfpMessageType === RFPMessageType.Accept) {
      return this.receiveAcceptMessageUseCase
    } else if (rfpMessageType === RFPMessageType.Decline) {
      return this.receiveDeclineMessageUseCase
    }
    return undefined
  }
}
