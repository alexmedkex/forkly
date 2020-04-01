import { AbstractEventDataAgent } from './AbstractEventDataAgent'
import { IEventDataAgent } from './IEventDataAgent'

export class VaktMessagingPubKeyRevokedDataAgent extends AbstractEventDataAgent implements IEventDataAgent {
  async saveEvent(event: any) {
    await this.memberDao.revokeVaktMessagingPubKey(event._node, event._index)
  }
}
