import { AMQPConfig, RabbitMQContainer, MongoContainer } from '@komgo/integration-test-utilities'
import logger from '@komgo/logging'
import { Collection } from 'mongoose'

import { QuoteModel } from '../../src/data-layer/models/quote/QuoteModel'
import { ReceivablesDiscountingModel } from '../../src/data-layer/models/receivables-discounting/ReceivablesDiscountingModel'
import { ReplyModel } from '../../src/data-layer/models/replies/ReplyModel'
import { RFPRequestModel } from '../../src/data-layer/models/rfp/RFPRequestModel'
import { TradeSnapshotModel } from '../../src/data-layer/models/trade-snapshot/TradeSnapshotModel'

export class GlobalActions {
  public static readonly amqpConfig = new AMQPConfig()
  public static readonly rabbitMQContainer = new RabbitMQContainer()
  public static readonly mongoContainer = new MongoContainer()

  public static async startMongoDB() {
    await GlobalActions.mongoContainer.start()
    await GlobalActions.mongoContainer.waitFor()
  }

  public static async startRabbitMQ() {
    await GlobalActions.rabbitMQContainer.start()
    await GlobalActions.rabbitMQContainer.waitFor()
  }

  public static async deleteMongoDB() {
    await GlobalActions.mongoContainer.delete()
  }

  public static async deleteRabbitMQ() {
    await GlobalActions.rabbitMQContainer.delete()
  }

  public static async cleanReceivablesDiscounting() {
    await GlobalActions.cleanCollection(ReceivablesDiscountingModel.collection)
  }

  public static async cleanRFPRequest() {
    await GlobalActions.cleanCollection(RFPRequestModel.collection)
  }

  public static async cleanRDQuotes() {
    await GlobalActions.cleanCollection(QuoteModel.collection)
  }

  public static async cleanRFPReplies() {
    await GlobalActions.cleanCollection(ReplyModel.collection)
  }

  public static async cleanTradeSnapshots() {
    await GlobalActions.cleanCollection(TradeSnapshotModel.collection)
  }

  public static async cleanAllCollections() {
    logger.info('Cleaning databases...')
    await GlobalActions.cleanReceivablesDiscounting()
    await GlobalActions.cleanRFPRequest()
    await GlobalActions.cleanRDQuotes()
    await GlobalActions.cleanRFPReplies()
    await GlobalActions.cleanTradeSnapshots()
  }

  public static setupEnvs() {
    // RabbitMQ config
    process.env.INTERNAL_MQ_HOST = GlobalActions.amqpConfig.host
    process.env.INTERNAL_MQ_USERNAME = GlobalActions.amqpConfig.username
    process.env.INTERNAL_MQ_PASSWORD = GlobalActions.amqpConfig.password
  }

  private static async cleanCollection(collection: Collection) {
    try {
      await collection.deleteMany({})
    } catch (error) {
      // Do nothing
    }
  }
}
