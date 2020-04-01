import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { validateObject, ValidationResult } from '@komgo/microservice-config'
import { injectable, multiInject } from 'inversify'

import { TYPES } from '../../inversify/types'
import { IClassType } from '../../utils'
import { ErrorName } from '../../utils/ErrorName'

import { IEventProcessor } from './event-processors/IEventProcessor'
import InvalidMessage from './event-processors/InvalidMessage'

/**
 * Routes events to events processors and validates them.
 * If an incoming does not have a processor or does not pass validation
 * it is acknowledged and won't be processed by the service again.
 */
@injectable()
export class EventsRouter {
  private readonly logger = getLogger('EventsRouter')

  private readonly processorForEvent: Map<string, IEventProcessor<any>> = new Map()

  constructor(@multiInject(TYPES.EventProcessor) processors: Array<IEventProcessor<any>>) {
    this.logger.info('Registering %d message processors', processors.length)
    processors.forEach(p => this.addProcessor(p))
  }

  async processEvent(senderStaticId: string, eventData: object, eventName: string): Promise<void> {
    const processor = this.processorForEvent[eventName]
    if (!processor) {
      throw new InvalidMessage(`No processor for message of type: ${eventName}`)
    }

    const isValid = await this.isValidEvent(processor.eventType(), eventData)
    if (!isValid) {
      throw new InvalidMessage(`Invalid event message of type: ${eventName}`)
    }

    this.logger.info('Invoking processor %s to process event of type %s', processor.constructor.name, eventName)

    await processor.processEvent(senderStaticId, eventData)
  }

  getRoutingKeys(): string[] {
    return Object.keys(this.processorForEvent)
  }

  private async isValidEvent(type: IClassType<any>, obj: any): Promise<boolean> {
    const validationResult: ValidationResult = await validateObject(type, obj)
    if (validationResult.hasErrors()) {
      this.logger.error(
        ErrorCode.ValidationInternalAMQP,
        ErrorName.InvalidDocumentFieldsMessage,
        'RabbitMQ message failed validation',
        {
          errors: validationResult.getValidationErrors()
        }
      )
      return false
    }
    return true
  }

  private addProcessor(processor: IEventProcessor<any>): void {
    const eventNames = processor.eventNames()
    eventNames.forEach(eventName => {
      if (this.processorForEvent[eventName]) {
        throw new Error(`A processor for ${eventName} is already registered`)
      }

      this.processorForEvent[eventName] = processor
      this.logger.info('Registered events processor for event: %s', eventName)
    })
  }
}
