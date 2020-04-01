import { AbstractEventDataAgent } from './AbstractEventDataAgent'
import { IEventDataAgent } from './IEventDataAgent'

export class EthPubKeyAddedDataAgent extends AbstractEventDataAgent implements IEventDataAgent {
  async saveEvent(event: any) {
    await this.memberDao.addEthPubKey(
      event._node,
      event._xPublicKey,
      event._yPublicKey,
      event._address,
      event._effDate,
      event._termDate
    )
  }
}
