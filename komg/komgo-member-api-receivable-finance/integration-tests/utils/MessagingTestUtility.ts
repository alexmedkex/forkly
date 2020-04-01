import { AMQPUtility } from '@komgo/integration-test-utilities'

import { VALUES } from '../../src/inversify/values'

import { GlobalActions } from './GlobalActions'
import IntegrationEnvironment from './IntegrationEnvironment'

export default class MessagingTestUtility {
  public readonly amqpUtility: AMQPUtility

  private readonly fromRFPDeadQueueName: string
  private readonly fromEventManagementDeadQueueName: string
  private readonly fromDocumentsDeadQueueName: string
  private readonly tradeCargosDeadQueueName: string

  constructor(iEnv: IntegrationEnvironment) {
    this.amqpUtility = new AMQPUtility(GlobalActions.amqpConfig)
    this.fromRFPDeadQueueName = `${iEnv.iocContainer.get<string>(VALUES.RFPPublisherId)}.dead`
    this.fromEventManagementDeadQueueName = `${iEnv.iocContainer.get<string>(VALUES.InboundPublisherId)}.dead`
    this.tradeCargosDeadQueueName = `${iEnv.iocContainer.get<string>(VALUES.TradeCargoPublisherId)}.dead`
    this.fromDocumentsDeadQueueName = `${iEnv.iocContainer.get<string>(VALUES.DocumentsPublisherId)}.dead`
  }

  public async afterEach() {
    await this.amqpUtility.purgeQueue(this.fromRFPDeadQueueName)
    await this.amqpUtility.purgeQueue(this.fromEventManagementDeadQueueName)
    await this.amqpUtility.purgeQueue(this.tradeCargosDeadQueueName)
    await this.amqpUtility.purgeQueue(this.fromDocumentsDeadQueueName)
  }

  public async assertRejectedMessageFromRFP(messageId: string) {
    await this.amqpUtility.assertRejectedMessage(this.fromRFPDeadQueueName, messageId)
  }

  public async assertNoRejectedMessageFromRFP() {
    return this.amqpUtility.assertNoRejectedMessage(this.fromRFPDeadQueueName)
  }

  public async assertRejectedMessageFromEventManagement(messageId: string) {
    await this.amqpUtility.assertRejectedMessage(this.fromEventManagementDeadQueueName, messageId)
  }

  public async assertRejectedMessageFromDocuments(messageId: string) {
    await this.amqpUtility.assertRejectedMessage(this.fromDocumentsDeadQueueName, messageId)
  }

  public async assertNoRejectedMessageFromEventManagement() {
    await this.amqpUtility.assertNoRejectedMessage(this.fromEventManagementDeadQueueName)
  }

  public async assertRejectedMessageFromTradeCargos(messageId: string) {
    await this.amqpUtility.assertRejectedMessage(this.tradeCargosDeadQueueName, messageId)
  }

  public async assertNoRejectedMessageFromTradeCargos() {
    await this.amqpUtility.assertNoRejectedMessage(this.tradeCargosDeadQueueName)
  }
}
