import { STATUS } from '../data-layer/models/ICommonBrokerMessage'

/**
 * This is uses to audit messages processed by the event manager microservice
 */
export interface IAuditingService {
  /**
   * Add a message inbound from the common broker to the audit record
   * @param routingKey the message routing key
   * @param messageProperties the message properties to audit
   * @param messagePayload the message payload
   * @param messageStatus the current status of the message being audited
   * @param error optional parameter used if the message failed processing
   */
  addCommontoInternalMessage(
    routingKey: string,
    messageProperties: any,
    messagePayload: any,
    messageStatus: STATUS,
    error?: Error
  )

  /**
   * Add a message outbound to the common broker to the audit record
   * @param routingKey the message routing key
   * @param messageProperties the message properties to audit
   * @param messagePayload the message payload
   * @param messageStatus the current status of the message being audited
   * @param error optional parameter used if the message failed processing
   */
  addInternalToCommonMessage(
    routingKeyValue: string,
    messagePropertiesValue: any,
    messagePayloadValue: any,
    messageStatus: STATUS,
    error?: Error
  )
}
