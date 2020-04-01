import IEventsProcessor from './IEventsProcessor'
import { multiInject, injectable } from 'inversify'
import { TYPES } from '../../../inversify/types'
import { getLogger } from '@komgo/logging'
import { IEventProcessorBase } from './IEventProcessor'
import CounterpartyRequestMessage from '../messages/CounterpartyRequestMessage'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorName } from '../../../utils/Constants'

@injectable()
export default class EventsProcessor implements IEventsProcessor {
  private readonly processors: Map<string, IEventProcessorBase> = new Map<string, IEventProcessorBase>()
  private readonly logger = getLogger('EventsProcessor')

  constructor(@multiInject(TYPES.EventProcessor) processors: IEventProcessorBase[]) {
    this.logger.info('Registering %d message processors', processors.length)
    processors.forEach(p => this.addProcessor(p))
  }

  async processEvent(eventName: string, eventData: object): Promise<boolean> {
    const message = eventData as CounterpartyRequestMessage
    const processor: IEventProcessorBase = this.processors[message.messageType]

    if (!processor) {
      this.logger.error(ErrorCode.ValidationInternalAMQP, ErrorName.EventProcessorNotFoundFailed, { eventName })
      return false
    }

    return processor.processEvent(eventData)
  }

  private addProcessor(processor: IEventProcessorBase): void {
    this.processors[processor.messageType] = processor
    this.logger.info('Registered events processor for message type', { messageType: processor.messageType })
  }
}
