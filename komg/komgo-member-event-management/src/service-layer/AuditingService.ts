import { getLogger } from '@komgo/logging'
import { inject, injectable } from 'inversify'

import { CommonBrokerMessageDataAgent } from '../data-layer/data-agent/CommonBrokerMessageDataAgent'
import { ICommonBrokerMessage, STATUS } from '../data-layer/models/ICommonBrokerMessage'
import { TYPES } from '../inversify/types'

import { IAuditingService } from './IAuditingService'

/**
 * This is responsible for writing messages inbound from, and outbound to the Common Broker.
 * This uses mongodb to store the common broker messages due to it offering write gurantees via the writeConcern configuration used
 * in the CommobBrokerAuditSchema
 */
@injectable()
export default class AuditingService implements IAuditingService {
  private logger = getLogger('AuditingService')
  constructor(@inject(TYPES.CommonBrokerMessageDataAgent) private messageDataAgent: CommonBrokerMessageDataAgent) {}

  /**
   * @inheritdoc
   * @returns Promise<any> that will resolve once the message has been written to the audit record or reject if it fails
   */
  async addCommontoInternalMessage(
    routingKeyValue: string,
    messageProperties: any,
    messagePayload: any,
    messageStatus: STATUS,
    error: Error = null
  ): Promise<any> {
    const existingMesage = await this.messageDataAgent.findCommontoInternalMessage({
      'messageProperties.messageId': messageProperties.messageId,
      status: messageStatus
    })
    if (existingMesage) {
      this.logger.info(
        'Not auditing Common To Internal Message - message with id [%s] and status [%s] already saved',
        messageProperties.messageId,
        messageStatus
      )
      return
    }
    const errorString = error ? error.message : null
    const commonBrokerMessage: ICommonBrokerMessage = {
      status: messageStatus,
      routingKey: routingKeyValue,
      messageProperties,
      messagePayload,
      error: errorString
    }
    return this.messageDataAgent.createCommonToInternalMessage(commonBrokerMessage)
  }

  /**
   * @inheritdoc
   * @returns Promise<any> that will resolve once the message has been written to the audit record or reject if it fails
   */
  async addInternalToCommonMessage(
    routingKeyValue: string,
    messageProperties: any,
    messagePayload: any,
    messageStatus: STATUS,
    error: Error = null
  ): Promise<any> {
    const existingMesage = await this.messageDataAgent.findInternalToCommonlMessage({
      'messageProperties.messageId': messageProperties.messageId,
      status: messageStatus
    })
    if (existingMesage) {
      this.logger.info(
        'Not auditing Internal To Common Message - message with id [%s] and statis [%s] already saved',
        messageProperties.messageId,
        messageStatus
      )
      return
    }
    const errorString = error ? error.message : null
    const commonBrokerMessage: ICommonBrokerMessage = {
      status: messageStatus,
      routingKey: routingKeyValue,
      messageProperties,
      messagePayload,
      error: errorString
    }
    return this.messageDataAgent.createInternalToCommonMessage(commonBrokerMessage)
  }
}
