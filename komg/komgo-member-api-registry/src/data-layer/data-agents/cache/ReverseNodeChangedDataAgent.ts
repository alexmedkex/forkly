import { AbstractEventDataAgent } from './AbstractEventDataAgent'
import { IEventDataAgent } from './IEventDataAgent'

export class ReverseNodeChangedDataAgent extends AbstractEventDataAgent implements IEventDataAgent {
  async saveEvent(event: any) {
    await this.memberDao.updateReverseNode(event._node, event._reversedNode)
  }
}
