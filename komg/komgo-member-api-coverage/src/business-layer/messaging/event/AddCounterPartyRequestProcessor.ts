import { IEventProcessor } from './IEventProcessor'
import CounterpartyRequestMessage from '../messages/CounterpartyRequestMessage'
import { injectable, inject } from 'inversify'
import { TYPES } from '../../../inversify/types'
import { ICounterpartyService } from '../../counterparty/ICounterpartyService'
import { MESSAGE_TYPE } from '../MessageTypes'

@injectable()
export default class AddCounterPartyRequestProcessor implements IEventProcessor<CounterpartyRequestMessage> {
  public readonly messageType = MESSAGE_TYPE.ConnectRequest

  constructor(@inject(TYPES.CounterpartyService) private readonly counterpartyService: ICounterpartyService) {}

  async processEvent(eventData: CounterpartyRequestMessage): Promise<boolean> {
    await this.counterpartyService.addRequest(eventData.data.requesterCompanyId, eventData.data.requestId)

    return true
  }
}
