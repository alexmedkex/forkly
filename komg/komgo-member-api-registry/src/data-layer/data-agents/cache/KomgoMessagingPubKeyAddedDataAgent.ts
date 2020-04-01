import { AbstractEventDataAgent } from './AbstractEventDataAgent'
import { IEventDataAgent } from './IEventDataAgent'

export class KomgoMessagingPubKeyAddedDataAgent extends AbstractEventDataAgent implements IEventDataAgent {
  async saveEvent(event: any) {
    await this.memberDao.addKomgoMessagingPubKey(event._node, event._pubKey, event._effDate, event._termDate)
  }
}
