import Message from './Message'
import ICounterpartyRequestMessageData from './ICounterpartyRequestMessageData'

export default class CounterpartyRequestMessage extends Message {
  context: {
    requestId: string
  }
  data: ICounterpartyRequestMessageData
}
