import { AbstractEventDataAgent } from './AbstractEventDataAgent'
import { IEventDataAgent } from './IEventDataAgent'

export class ABIChangedDataAgent extends AbstractEventDataAgent implements IEventDataAgent {
  async saveEvent(event: any) {
    await this.memberDao.updateAbi(event.node, this.web3Instance.utils.toAscii(event.data))
  }
}
