import { IEventProcessor } from './IEventProcessor'
import CounterpartyRequestMessage from '../messages/CounterpartyRequestMessage'
import { MESSAGE_TYPE } from '../MessageTypes'
import { injectable, inject } from 'inversify'
import { TYPES } from '../../../inversify/types'
import { ICounterpartyService } from '../../counterparty/ICounterpartyService'

@injectable()
export default class ApproveCounterPartyRequestProcessor implements IEventProcessor<CounterpartyRequestMessage> {
  public readonly messageType = MESSAGE_TYPE.ApproveConnectRequest

  constructor(@inject(TYPES.CounterpartyService) private readonly counterpartyService: ICounterpartyService) {}

  async processEvent(eventData: CounterpartyRequestMessage): Promise<boolean> {
    await this.counterpartyService.requestApproved(eventData.data.receiverCompanyId, eventData.data.requestId)

    return true
  }
}
