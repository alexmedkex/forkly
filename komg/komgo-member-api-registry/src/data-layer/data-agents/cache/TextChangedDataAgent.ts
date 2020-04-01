import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'

import { EventValidationException } from '../../../exceptions'
import { ErrorNames } from '../../../exceptions/utils'

import { AbstractEventDataAgent } from './AbstractEventDataAgent'
import { IEventDataAgent } from './IEventDataAgent'

export class TextChangedDataAgent extends AbstractEventDataAgent implements IEventDataAgent {
  private readonly logger = getLogger('TextChangedDataAgent')

  async saveEvent(event: any) {
    this.logger.info(event)
    let value
    if (event._key === 'nodeKeys') {
      value = event._value
    } else {
      try {
        value = JSON.parse(event._value)
      } catch {
        value = event._value
      }
    }

    try {
      await this.memberDao.updateField(event._node, event._key, value)
    } catch (error) {
      this.logger.error(
        ErrorCode.ConnectionDatabase,
        ErrorNames.TextChangedDataAgentFailedToSaveEvent,
        error.message,
        {
          key: event.key,
          value: event.value,
          node: event.node
        },
        new Error().stack
      )
      throw new EventValidationException(error.message)
    }
  }
}
