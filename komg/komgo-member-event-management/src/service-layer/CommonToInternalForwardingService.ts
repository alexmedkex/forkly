import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { IMessagePublisher, MessagingFactory } from '@komgo/messaging-library'
import { inject, injectable } from 'inversify'

import { ICompanyRegistryAgent } from '../data-layer/data-agent/ICompanyRegistryAgent'
import { STATUS } from '../data-layer/models/ICommonBrokerMessage'
import { TYPES } from '../inversify/types'
import CommonMessageReceived from '../messaging-layer/CommonMessageReceived'
import ICommonMessagingAgent from '../messaging-layer/ICommonMessagingAgent'
import IEnvelopeAgent from '../messaging-layer/IEnvelopeAgent'
import { Platform } from '../messaging-layer/Platform'
import { IDecryptedEnvelope, IEncryptedEnvelope, MessageProcessingError } from '../messaging-layer/types'
import { ErrorName } from '../util/ErrorName'
import IBackoffTimer from '../util/IBackoffTimer'
import { Metric, FlowDirection } from '../util/Metrics'
import requestIdHandlerInstance from '../util/RequestIdHandler'

import { IAuditingService } from './IAuditingService'
import IPollingServiceFactory from './IPollingServiceFactory'
import IService from './IService'

@injectable()
export default class CommonToInternalForwardingService implements IService {
  private publisher: IMessagePublisher
  private asyncPolling: IService
  private envelopeAgent: IEnvelopeAgent
  private commonMessagingAgent: ICommonMessagingAgent
  private companyRegistryAgent: ICompanyRegistryAgent
  private auditingService: IAuditingService
  private logger = getLogger('CommonToInternalForwardingService')

  constructor(
    @inject(TYPES.MessagingFactory) messagingFactory: MessagingFactory | any,
    @inject('from-publisher-id') private publisherId: string,
    @inject('common-broker-polling-interval-ms') pollingInterval: number,
    @inject('company-static-id') private companyStaticId: string,
    @inject(TYPES.PollingServiceFactory) pollingFactory: IPollingServiceFactory | any,
    @inject(TYPES.CommonMessagingAgent) commonAgent: ICommonMessagingAgent | any,
    @inject(TYPES.EnvelopeAgent) envelope: IEnvelopeAgent | any,
    @inject(TYPES.CompanyRegistryAgent) companyRegistry: ICompanyRegistryAgent | any,
    @inject(TYPES.BackoffTimer) private readonly backoffTimer: IBackoffTimer | any,
    @inject(TYPES.AuditingService) auditingService: IAuditingService | any
  ) {
    this.publisher = messagingFactory.createRetryPublisher(publisherId)
    this.envelopeAgent = envelope
    this.commonMessagingAgent = commonAgent
    this.companyRegistryAgent = companyRegistry
    this.auditingService = auditingService
    this.asyncPolling = pollingFactory.createPolling(async end => {
      await this.readMessages()
      end()
    }, pollingInterval)
  }

  public async start() {
    await this.asyncPolling.start()
    this.logger.info(`Service started listening to `, { publisherId: this.publisherId })
  }

  public async stop() {
    await this.publisher.close()
    await this.asyncPolling.stop()
  }

  /**
   * Reads messages sequentially from the Common Broker queue
   */
  private async readMessages() {
    while (true) {
      requestIdHandlerInstance.generate()
      let response: CommonMessageReceived
      try {
        response = await this.commonMessagingAgent.getMessage(this.companyStaticId)
      } catch (e) {
        this.logger.warn(ErrorCode.ConnectionCommonMQ, ErrorName.GetMessageFromCommonQueueFailed, {
          companyStaticId: this.companyStaticId
        })
        await this.backoffTimer.sleep()
        return
      }

      if (!response) {
        this.backoffTimer.reset()
        return
      }

      let internalRoutingKey = ''
      try {
        this.logger.metric({
          [Metric.FlowMessageReceived]: FlowDirection.Inbound
        })
        const decryptedMessage = await this.getDecryptedMessage(response)
        internalRoutingKey = decryptedMessage.message.messageType

        await this.processResponse(response, decryptedMessage, internalRoutingKey)
        this.logger.metric({
          [Metric.FlowMessageProcessed]: FlowDirection.Inbound
        })
      } catch (error) {
        if (error instanceof MessageProcessingError) {
          await this.processMessageProcessingError(response, error, internalRoutingKey)
          this.logger.metric({
            [Metric.FlowMessageProcessError]: FlowDirection.Inbound
          })
        } else {
          await this.processTechnicalError(response, error, internalRoutingKey)
          return
        }
      }
    }
  }

  /**
   * Processes a decrypted message by publishing, logging and acknowledging it
   * @param response Received raw message from the Common Broker
   * @param decryptedMessage Decrypted message
   * @param routingKey Message type
   */
  private async processResponse(
    response: CommonMessageReceived,
    decryptedMessage: IDecryptedEnvelope,
    internalRoutingKey: string
  ) {
    await this.auditingService.addCommontoInternalMessage(
      internalRoutingKey,
      response.properties,
      {}, // TODO: https://consensys-komgo.atlassian.net/browse/KOMGO-2509
      STATUS.Decrypted
    )

    await this.publishMessage(response, internalRoutingKey, decryptedMessage)

    // Add the message as processed before the ACK in case something fails immediately after
    // the Ack and we lose the message.  This way we may get duplicates if the ACK fails but nothing
    // is lost
    await this.auditingService.addCommontoInternalMessage(
      internalRoutingKey,
      response.properties,
      {}, // TODO: https://consensys-komgo.atlassian.net/browse/KOMGO-2509
      STATUS.Processed
    )

    await this.commonMessagingAgent.ackMessage(this.companyStaticId)
    this.logger.info('Message processed', { messageId: response.properties.messageId })

    this.backoffTimer.reset()
  }

  /**
   * Processes a message in the case of a processing error
   * @param response Received raw message from the Common Broker
   * @param error Message processing error
   * @param routingKey Message type
   */
  private async processMessageProcessingError(
    response: CommonMessageReceived,
    error: MessageProcessingError,
    internalRoutingKey: string
  ) {
    const commonRoutingKey = response.routingKey
    try {
      this.logger.error(
        this.getValidationErrorCodeFromPlatform(response.getSenderPlatform()),
        ErrorName.CommonToInternalProcessingError,
        error.message,
        {
          messageId: response.properties.messageId
        }
      )
      await this.auditingService.addCommontoInternalMessage(
        internalRoutingKey ? internalRoutingKey : commonRoutingKey,
        response.properties,
        response.message.payload,
        STATUS.FailedProcessing
      )
      await this.commonMessagingAgent.ackMessage(this.companyStaticId)
      this.backoffTimer.reset()
    } catch (e) {
      this.logger.warn(ErrorCode.ConnectionCommonMQ, ErrorName.CommonToInternalFailed, e.message, {
        messageId: response.properties.messageId
      })
    }
  }

  /**
   * Processes a message in the case of a connection error
   * @param response Received raw message from the Common Broker
   * @param error Message processing error
   * @param routingKey Message type
   */
  private async processTechnicalError(response: CommonMessageReceived, error: any, internalRoutingKey: string) {
    const commonRoutingKey = response.routingKey
    try {
      await this.auditingService.addCommontoInternalMessage(
        internalRoutingKey ? internalRoutingKey : commonRoutingKey,
        response.properties,
        {}, // TODO: https://consensys-komgo.atlassian.net/browse/KOMGO-2509
        STATUS.FailedServerError
      )
    } catch (e) {
      this.logger.error(ErrorCode.Connection, ErrorName.CommonToInternalAuditingError, e.message, {
        messageId: response.properties.messageId
      })
    }

    this.logger.error(ErrorCode.ConnectionCommonMQ, ErrorName.CommonToInternalTechnicalError, error.message, {
      messageId: response.properties.messageId
    })
    await this.backoffTimer.sleep()
  }

  /**
   * Obtains the current public key of the sender based in the information available on API Registry
   * @param response Received raw message from the Common Broker
   */
  private async getCurrentPublicKey(response: CommonMessageReceived) {
    const { platform, mnidType, keyType, senderMnid } = this.getProperties(response)
    this.logger.info('Getting messaging public keys for', { platform, mnidType, keyType })
    const pks = await this.companyRegistryAgent.getPropertyFromMnid(mnidType, senderMnid, keyType)
    this.logger.info(`Got messaging public keys: ${JSON.stringify(pks)}`)

    if (!pks || !pks.length || pks.length === 0) {
      throw new MessageProcessingError(`Couldn't get RSA public keys for ${senderMnid}`)
    }
    this.logger.info(`Getting last PK`)
    const currentPubKey = pks[pks.length - 1] as any
    this.logger.info(`Got last PK=${currentPubKey}`)
    if (!currentPubKey || !currentPubKey.current) {
      throw new MessageProcessingError(`Bad current public key: ${currentPubKey}`)
    }
    return currentPubKey
  }

  private getProperties(response: CommonMessageReceived) {
    const senderMnid = response.properties.senderMnid
    const platform = response.properties.senderPlatform
    const mnidType = platform === 'vakt' ? 'vaktMnid' : 'komgoMnid'
    const keyType = platform === 'vakt' ? 'vaktMessagingPubKeys' : 'komgoMessagingPubKeys'
    return { platform, mnidType, keyType, senderMnid }
  }

  /**
   * Gets the current public key and decrypts the message
   * @param response Received raw message from the Common Broker
   */
  private async getDecryptedMessage(response: CommonMessageReceived) {
    const messageId = response.properties.messageId
    this.logger.info('Decrypting message', { messageId })
    const currentPubKey = await this.getCurrentPublicKey(response)
    const payload = JSON.parse(response.message.payload) as IEncryptedEnvelope

    const decryptedMessage: IDecryptedEnvelope = await this.decryptMessage(
      payload,
      currentPubKey,
      messageId,
      response.getSenderPlatform()
    )
    if (!decryptedMessage) {
      throw new MessageProcessingError(`Error decrypting message`)
    }
    this.logger.info('Message decrypted', { messageId })

    return decryptedMessage
  }

  /**
   * Publishes a message
   * @param response Received raw message from the Common Broker
   * @param internalRoutingKey Message type
   * @param decryptedMessage Decrypted message to publish
   */
  private async publishMessage(
    response: CommonMessageReceived,
    internalRoutingKey: string,
    decryptedMessage: IDecryptedEnvelope
  ) {
    this.logger.info(`Sending message to Internal Broker`, {
      messageId: response.properties.messageId,
      publisherId: this.publisherId,
      routingKey: internalRoutingKey
    })

    await this.publisher.publishCritical(internalRoutingKey, decryptedMessage.message, {
      messageId: response.properties.messageId,
      correlationId: response.properties.correlationId,

      recipientStaticId: response.properties.recipientStaticId,

      senderStaticId: response.properties.senderStaticId,
      senderPlatform: response.properties.senderPlatform
    })
  }

  /**
   * Decrypts the message received from the Common Broker, including unsealing the message
   * @param payload encrypted envelope inside the raw message from Common Broker
   * @param currentPubKey current Public Key of the sender
   */
  private async decryptMessage(payload: IEncryptedEnvelope, currentPubKey: any, messageId: string, platform: Platform) {
    const decryptedMessage: IDecryptedEnvelope = await this.envelopeAgent.desencapsulate(payload, currentPubKey)
    this.logger.info(`Message desencapsulated`, { messageId })
    if (!decryptedMessage || decryptedMessage.error) {
      this.logger.crit(
        this.getValidationErrorCodeFromPlatform(platform),
        ErrorName.InternalToCommonSignatureValidationDecryptFailed,
        { messageId }
      )
      return null
    }
    if (!decryptedMessage.message) {
      this.logger.crit(
        this.getValidationErrorCodeFromPlatform(platform),
        ErrorName.InternalToCommonEmptyMessagePayload,
        { messageId }
      )
      return null
    }
    if (!decryptedMessage.message.messageType) {
      this.logger.crit(
        this.getValidationErrorCodeFromPlatform(platform),
        ErrorName.InternalToCommonMalformedMessagePayload,
        { messageId }
      )
      return null
    }
    return decryptedMessage
  }

  private getValidationErrorCodeFromPlatform(platform: Platform): ErrorCode {
    return platform === Platform.KOMGO ? ErrorCode.ValidationKomgoInboundAMQP : ErrorCode.ValidationExternalInboundAMQP
  }
}
