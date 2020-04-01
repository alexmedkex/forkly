import { IClassType } from '../../../utils'

/**
 * Processing events from RabbitMQ of a single type. It provide
 * a name of the event type it can process and a type of an
 * event that is used for validation.
 */
export interface IEventProcessor<T> {
  /**
   * Process a single event of type T. An event is acknowledged
   * if the method completes successfully. If an event is
   * acknowledged it won't be delivered to the application again.
   *
   * If a message should be rejected due to a permanent problem, e.g.
   * if a message is invalid, this method should throw the InvalidMessage
   * exception. In this case the message will be removed from the queue
   * and won't be requeued.
   *
   * If any other error except from the InvalidMessage is thrown a message
   * will be requeued.
   *
   * @param senderStaticId id of a company that sent a message
   * @param event even to process
   */
  processEvent(senderStaticId: string, event: T): Promise<void>

  /**
   * Names of events this processor can process.
   *
   * @returns name of an event
   */
  eventNames(): string[]

  /**
   * Type of an event this processor can process. This type is used
   * to perform validation on incoming events.
   *
   * @returns type of an event
   */
  eventType(): IClassType<T>
}
