import { getLogger } from '@komgo/logging'
import { ITrade, ICargo } from '@komgo/types'
import { TYPES } from '../inversify/types'
import { IEventMessagePublisher } from '../service-layer/events/IEventMessagePublisher'
import { inject, injectable } from 'inversify'
import * as _ from 'lodash'

@injectable()
export class CargoUpdateMessageUseCase {
  private readonly logger = getLogger('CargoUpdateMessageUseCase')

  constructor(@inject(TYPES.EventMessagePublisher) private readonly eventMessagePublisher: IEventMessagePublisher) {}

  public async execute(oldCargo: ICargo, newCargo: ICargo) {
    if (!_.isEqual(this.clearCargo(oldCargo), this.clearCargo(newCargo))) {
      const messageId = await this.eventMessagePublisher.publishCargoUpdated(newCargo)
      this.logger.info('Cargo updated message published', {
        sourceId: newCargo.sourceId,
        messageId
      })
    }
  }

  private clearCargo(cargo: ICargo) {
    return { ...cargo, updatedAt: undefined, __v: undefined }
  }
}
