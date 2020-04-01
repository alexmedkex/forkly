import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { MessagingFactory, IMessageReceived, IConsumerWatchdog } from '@komgo/messaging-library'
import { injectable, inject } from 'inversify'

import { ICompanyRegistryAgent } from '../data-layer/data-agent/ICompanyRegistryAgent'
import { STATUS } from '../data-layer/models/ICommonBrokerMessage'
import { TYPES } from '../inversify/types'
import ICommonMessagingAgent from '../messaging-layer/ICommonMessagingAgent'
import IEnvelopeAgent from '../messaging-layer/IEnvelopeAgent'
import { MessageTooLargeError } from '../messaging-layer/MessageTooLargeError'
import { Platform } from '../messaging-layer/Platform'
import { ICommonMessageProperties, IPlatformSpecificMessageProperties } from '../messaging-layer/types'
import { ErrorName } from '../util/ErrorName'
import { FlowDirection, Metric } from '../util/Metrics'

import { IAuditingService } from './IAuditingService'
import { InvalidCompanyConfigurationError } from './InvalidCompanyConfigurationError'
import IService from './IService'
import { ServerError } from './ServerError'

@injectable()
export default class InternalToCommonForwardingService implements IService {
  private logger = getLogger('InternalToCommonForwardingService')
  private readonly consumerWatchdog: IConsumerWatchdog
  private companyRegistryAgent: ICompanyRegistryAgent
  private envelopeAgent: IEnvelopeAgent
  private commonMessagingAgent: ICommonMessagingAgent
  private readonly auditingService: IAuditingService

  constructor(
    @inject(TYPES.MessagingFactory) messagingFactory: MessagingFactory | any,
    @inject('to-publisher-id') private outgoingPublisherId: string,
    @inject('outbound-routing-key') private outboundRoutingKey: string,
    @inject('outbound-vakt-exchange') private outboundVaktExchange: string,
    @inject('outbound-monitoring-exchange') private readonly outboundMonitoringExchange: string,
    @inject('consumer-id') consumerId: string,
    @inject(TYPES.CommonMessagingAgent)
    commonMessaging: ICommonMessagingAgent | any,
    @inject(TYPES.EnvelopeAgent) envelope: IEnvelopeAgent | any,
    @inject(TYPES.CompanyRegistryAgent) companyRegistry: ICompanyRegistryAgent | any,
    @inject('internal-broker-consumer-watchdog-interval-ms') consumerWatchdogInterval: number,
    @inject(TYPES.AuditingService) auditingService: IAuditingService,
    @inject('company-static-id') private companyStaticId: string
  ) {
    this.consumerWatchdog = messagingFactory.createConsumerWatchdog(consumerId, consumerWatchdogInterval)
    this.envelopeAgent = envelope
    this.companyRegistryAgent = companyRegistry
    this.commonMessagingAgent = commonMessaging
    this.auditingService = auditingService
  }

  async start() {
    this.logger.info('Starting service')
    await this.consumeMessages()
  }

  async stop() {
    this.logger.info('Stopping service')
    await this.consumerWatchdog.close()
  }

  private async consumeMessages() {
    this.logger.info('Starting to consume messages')

    await this.consumerWatchdog.listen(this.outgoingPublisherId, '#', async message => {
      try {
        this.logger.info('Message received')

        // If message.error has value set, process the error message and return.
        if (message.error) {
          return this.processMessageError(message)
        }

        // Forward monitoring/email-notification messages without additional processing
        if (
          message.options.recipientPlatform === Platform.MONITORING ||
          message.options.recipientPlatform === Platform.EMAIL_NOTIFICATION
        ) {
          await this.processMonitoringAndEmailMessage(message)
          return
        }

        // Generate all the message properties per platform
        const platformSpecificMessageProperties: IPlatformSpecificMessageProperties = await this.setupProcessMessagePropertiesByPlatform(
          message
        )

        const pubKeys = platformSpecificMessageProperties.pubKeys
        const commonMessageProperties = platformSpecificMessageProperties.commonMessageProperties
        const lastPubKey = pubKeys[pubKeys.length - 1]
        const recipientExchange = platformSpecificMessageProperties.recipientExchange

        // Generate platform specific logging info based on platformSpecificMessageProperties
        const messageLoggingInfo = this.getMessageLoggingInfo(
          message,
          platformSpecificMessageProperties.pubKeyProperty,
          platformSpecificMessageProperties.mnidProperty
        )

        this.logger.info('Outbound message received', {
          ...messageLoggingInfo,
          [Metric.FlowMessageReceived]: FlowDirection.Outbound
        })

        if (platformSpecificMessageProperties.recipientPlatform === Platform.VAKT) {
          // If company not configured properly in Company Registry, throw ServerError
          if (
            this.isCompanyConfigurationIncorrect(
              platformSpecificMessageProperties.recipientEntry,
              platformSpecificMessageProperties.pubKeyProperty,
              platformSpecificMessageProperties.mnidProperty
            )
          ) {
            const errorMsg = `Company ${
              commonMessageProperties.recipientStaticId
            } does not have correct configuration in Company Registry`
            this.logger.error(ErrorCode.Configuration, ErrorName.CompanyRegistryInvalid, errorMsg, messageLoggingInfo)
            throw new ServerError(errorMsg)
          }
        } else if (!platformSpecificMessageProperties.isRecipientMember) {
          throw new InvalidCompanyConfigurationError(
            `Company ${commonMessageProperties.recipientStaticId} is not a member of Komgo`
          )
        }

        await this.auditingService.addInternalToCommonMessage(
          message.routingKey,
          message.options,
          {},
          STATUS.Processing
        )
        const encryptedMessage = await this.envelopeAgent.encapsulate(message.content, lastPubKey)

        this.logger.info('Redirecting encrypted message to exchange', {
          messageId: message.options.messageId,
          requestId: message.options.requestId,
          recipientExchange,
          routingKey: this.outboundRoutingKey,
          commonMessageProperties
        })

        await this.commonMessagingAgent.sendMessage(
          this.outboundRoutingKey,
          recipientExchange,
          encryptedMessage,
          commonMessageProperties
        )

        await this.auditingService.addInternalToCommonMessage(message.routingKey, message.options, {}, STATUS.Processed)
        this.logger.info('Message sent to Common-MQ. Acking message in Internal-MQ', {
          messageId: message.options.messageId,
          requestId: message.options.requestId,
          recipientExchange,
          routingKey: this.outboundRoutingKey,
          commonMessageProperties
        })

        message.ack()
        this.logger.info(`Message was processed successfully`, {
          messageId: message.options.messageId,
          requestId: message.options.requestId
        })
        this.logger.metric({
          [Metric.FlowMessageProcessed]: FlowDirection.Outbound
        })
      } catch (error) {
        await this.handleError(message, error)
      }
    })
  }

  private async processMonitoringAndEmailMessage(message: IMessageReceived) {
    const senderMnid = 'MONITORING'
    await this.commonMessagingAgent.sendMessage(
      message.routingKey,
      this.buildExchange(Platform.MONITORING, senderMnid),
      message.content,
      {
        messageId: message.options.messageId,
        correlationId: message.options.correlationId,
        senderStaticId: this.companyStaticId
      }
    )

    message.ack()
    this.logger.info(`Monitoring/EmailNotification message was processed successfully`, {
      messageId: message.options.messageId,
      requestId: message.options.requestId
    })
    this.logger.metric({
      [Metric.FlowMessageProcessed]: FlowDirection.Outbound
    })
  }

  private isCompanyConfigurationIncorrect(recipientEntry: any, pubKeyProperty: string, mnidProperty: string) {
    return (
      !recipientEntry ||
      !recipientEntry[pubKeyProperty] ||
      recipientEntry[pubKeyProperty].length < 1 ||
      !recipientEntry[mnidProperty]
    )
  }

  private async setupProcessMessagePropertiesByPlatform(
    message: IMessageReceived
  ): Promise<IPlatformSpecificMessageProperties> {
    this.logger.info('Request messages properties to api-registry', {
      messageId: message.options.messageId
    })
    const recipientStaticId: string = message.options.recipientStaticId
    const recipientPlatform: string = message.options.recipientPlatform
    const recipientEntry = await this.companyRegistryAgent.getEntryFromStaticId(recipientStaticId)
    const senderMnid = await this.companyRegistryAgent.getMnidFromStaticId(this.companyStaticId)

    const commonMessageProperties: ICommonMessageProperties = {
      messageId: message.options.messageId,
      correlationId: message.options.correlationId,
      senderStaticId: this.companyStaticId,
      senderMnid
    }

    const platformSpecificMessageProperties: IPlatformSpecificMessageProperties = {
      pubKeyProperty: 'komgoMessagingPubKeys',
      mnidProperty: 'komgoMnid',
      recipientEntry,
      recipientPlatform,
      commonMessageProperties,
      isRecipientMember: recipientEntry.isMember
    }

    switch (recipientPlatform) {
      case Platform.VAKT:
        platformSpecificMessageProperties.pubKeyProperty = 'vaktMessagingPubKeys'
        platformSpecificMessageProperties.mnidProperty = 'vaktMnid'
        break
      default:
        commonMessageProperties.senderPlatform = Platform.KOMGO
        break
    }

    // Set the recipientMnid based on the platform specific value
    commonMessageProperties.recipientMnid = recipientEntry[platformSpecificMessageProperties.mnidProperty]
    // Set the publicKeys based on the platform specific value
    platformSpecificMessageProperties.pubKeys = recipientEntry[platformSpecificMessageProperties.pubKeyProperty]
    // Set the recipientExchange based on the platform specific value
    platformSpecificMessageProperties.recipientExchange = this.buildExchange(
      platformSpecificMessageProperties.recipientPlatform,
      commonMessageProperties.recipientMnid
    )

    return platformSpecificMessageProperties
  }

  private processMessageError(message: IMessageReceived) {
    this.logger.error(
      ErrorCode.ValidationInternalAMQP,
      ErrorName.InternalToCommonInvalidMessage,
      message.error.message,
      {
        messageId: message.options.messageId,
        routingKey: message.routingKey
      }
    )
    message.reject()
    return
  }

  private async handleError(message: IMessageReceived, error: any) {
    try {
      if (error instanceof MessageTooLargeError || error instanceof InvalidCompanyConfigurationError) {
        await this.auditingService.addInternalToCommonMessage(
          message.routingKey,
          message.options,
          {},
          STATUS.FailedProcessing
        )
      } else {
        await this.auditingService.addInternalToCommonMessage(
          message.routingKey,
          message.options,
          {},
          STATUS.FailedServerError
        )
      }
    } catch (e) {
      message.requeue()
      this.logger.error(ErrorCode.Connection, ErrorName.InternalToCommonAuditingError, e.message, {
        messageId: message.options.messageId
      })
      return
    }

    try {
      if (error instanceof MessageTooLargeError) {
        message.reject()
        this.logger.error(
          ErrorCode.ValidationInternalAMQP,
          ErrorName.InternalToCommonPayloadTooLargeError,
          error.message,
          {
            messageId: message.options.messageId
          }
        )
        this.logger.metric({
          [Metric.FlowMessageProcessError]: FlowDirection.Outbound
        })
      } else if (error instanceof InvalidCompanyConfigurationError) {
        message.reject()
        this.logger.error(
          ErrorCode.ValidationInternalAMQP,
          ErrorName.InternalToCommonRecipientIsNotAMember,
          error.message,
          {
            messageId: message.options.messageId
          }
        )
        this.logger.metric({
          [Metric.FlowMessageProcessError]: FlowDirection.Outbound
        })
      } else {
        message.requeue()
        this.logger.error(ErrorCode.ValidationInternalAMQP, ErrorName.InternalToCommonTechnicalError, error.message, {
          messageId: message.options.messageId
        })
      }
    } catch (e) {
      this.logger.warn(ErrorCode.ConnectionInternalMQ, ErrorName.InternalToCommonFailed, error.message, {
        messageId: message.options.messageId
      })
    }
  }

  private buildExchange(recipientPlatform: string, mnid: string): string {
    if (recipientPlatform === Platform.VAKT) {
      return this.outboundVaktExchange
    } else if (recipientPlatform === Platform.MONITORING) {
      return this.outboundMonitoringExchange
    } else {
      return `${mnid}-EXCHANGE`
    }
  }

  private getMessageLoggingInfo(message, pubKeyProperty, mnidProperty) {
    const recipientStaticId: string = message.options.recipientStaticId
    const recipientPlatform: string = message.options.recipientPlatform
    return {
      messageId: message.options.messageId,
      requestId: message.options.requestId,
      recipientStaticId,
      recipientPlatform,
      pubKeyProperty,
      mnidProperty,
      routingKey: this.outboundRoutingKey
    }
  }
}
