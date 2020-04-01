import { AbstractEventDataAgent } from './AbstractEventDataAgent'
import { IEventDataAgent } from './IEventDataAgent'

export class TransferDataAgent extends AbstractEventDataAgent implements IEventDataAgent {
  saveEvent(event: any) {
    this.memberDao.updateOwner(event.node, event.owner)
  }
}
