import { AbstractEventDataAgent } from './AbstractEventDataAgent'
import { IEventDataAgent } from './IEventDataAgent'

export class NewOwnerDataAgent extends AbstractEventDataAgent implements IEventDataAgent {
  async saveEvent(event: any) {
    const existingCompany = await this.memberDao.findByParentAndLabel(event.node, event.label)
    if (!existingCompany) {
      await this.memberDao.createNewMemberCompany(event.node, event.label, event.owner)
    } else {
      const node = existingCompany.node
      await this.memberDao.updateOwner(node, event.owner)
    }
  }
}
