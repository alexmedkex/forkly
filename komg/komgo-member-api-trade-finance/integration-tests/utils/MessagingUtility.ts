import { PublisherMicroservice, ConsumerMicroservice, AMQPConfig } from '@komgo/integration-test-utilities'
import AMQP = require('amqplib')
import { generateRandomString } from '@komgo/integration-test-utilities/dist/utils'
const AsyncPolling = require('async-polling')

export default class MessagingUtility {
  private publisherMicroservice: PublisherMicroservice
  private consumerMicroservice: ConsumerMicroservice
  private publisherId: string
  private consumerPublisherId: string
  private readonly amqpUrl: string
  public consumerName: string

  constructor() {
    const amqpConfig = new AMQPConfig()
    this.amqpUrl = `amqp://${amqpConfig.username}:${amqpConfig.password}@${amqpConfig.host}`
  }

  public async createPublisher(publisherId: string) {
    this.publisherId = publisherId
    this.publisherMicroservice = new PublisherMicroservice(publisherId)
    await this.publisherMicroservice.beforeEach()
  }

  public async createConsumer(publisherId: string) {
    this.consumerPublisherId = publisherId
    this.consumerName = generateRandomString(7, 'consumerMicroservice-')
    this.consumerMicroservice = new ConsumerMicroservice(publisherId, new AMQPConfig(), this.consumerName)
    await this.consumerMicroservice.beforeEach()
  }

  public async setup() {
    await this.publisherMicroservice.beforeEach()
    if (this.consumerMicroservice) {
      await this.consumerMicroservice.beforeEach()
    }
  }

  public async tearDown() {
    await this.publisherMicroservice.afterEach()
    if (this.consumerMicroservice) {
      await this.consumerMicroservice.afterEach()
    }
  }

  public async purgeQueue() {
    await this.consumerMicroservice.purgeQueue()
  }

  public async publish(routingKey: string, eventObject: object, additionalQueue?: string) {
    await this.waitForQueue(`api-trade-finance-consumer.${this.publisherId}.queue`)
    if (additionalQueue) {
      await this.waitForQueue(additionalQueue)
    }
    await this.publisherMicroservice.publish(routingKey, eventObject)
  }

  public waitForAndExpectMessage(routingKey: string, expectedObject: any, done) {
    const startTime = Date.now()

    const polling = new AsyncPolling(async end => {
      if (Date.now() > startTime + 20000) {
        throw new Error('Timeout while waiting for message.')
      } else {
        let message
        try {
          message = await this.consumerMicroservice.messagingConsumer.get(this.consumerPublisherId, [routingKey])
        } catch {}
        if (message) {
          expect(message.content).toEqual(expectedObject.content)
          message.ack()
          polling.stop()
          done()
        }
        end()
      }
    }, 500)
    polling.run()
  }

  public async expectMessage(routingKey: string, expectedObject: object, done) {
    await this.consumerMicroservice.expectMessage(routingKey, expectedObject, done)
  }

  public async waitForQueue(queue: string) {
    const startTime = Date.now()

    return new Promise(async (resolve, reject) => {
      const connection = await AMQP.connect(this.amqpUrl)

      const polling = new AsyncPolling(async end => {
        if (Date.now() > startTime + 20000) {
          reject('Timeout while waiting for queue to be created.')
        } else {
          let channel
          try {
            channel = await connection.createChannel()
            channel.on('error', err => {})
            await channel.checkQueue(queue)
            console.log('queue found!')
            resolve()
          } catch (e) {
            console.log('queue not found, retrying...')
            try {
              await channel.close()
            } catch (e) {}
            end()
          }
        }
      }, 500)
      polling.run()
    })
  }
}
