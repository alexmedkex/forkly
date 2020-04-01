import { AbstractEventDataAgent } from './AbstractEventDataAgent'
import { IEventDataAgent } from './IEventDataAgent'

export class VaktMessagingPubKeyAddedDataAgent extends AbstractEventDataAgent implements IEventDataAgent {
  async saveEvent(event: any) {
    await this.memberDao.addVaktMessagingPubKey(event._node, event._pubKey, event._effDate, event._termDate)
  }
}
