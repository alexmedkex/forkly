import { AMQPConfig, AMQPUtility } from '@komgo/integration-test-utilities'
import { IMessageConsumer, IMessageReceived, MessagingFactory, ConsumerWatchdog } from '@komgo/messaging-library'
import 'reflect-metadata'

import { generateRandomString } from './environment'

const waitForExpect = require('wait-for-expect')

export default class MessageConsumerService {
  messagingConsumer?: IMessageConsumer
  private amqpUtility: AMQPUtility
  private messages: Map<string, IMessageReceived[]> = new Map<string, IMessageReceived[]>()

  constructor(
    private readonly publisherId: string,
    private readonly amqpConfig: AMQPConfig = new AMQPConfig(),
    private readonly consumerName: string = generateRandomString(7, 'consumerMicroservice-'),
    private readonly messagingFactory = new MessagingFactory(amqpConfig.host, amqpConfig.username, amqpConfig.password)
  ) {
    this.amqpUtility = new AMQPUtility(this.amqpConfig)
  }

  public async beforeEach() {
    this.messagingConsumer = this.messagingFactory.createConsumer(this.consumerName)
    this.messages = new Map<string, IMessageReceived[]>()
    // await sleep(500)
  }

  public async startListen(key: string) {
    this.messages.set(key, [])
    await this.messagingConsumer.listen(this.publisherId, key, (msg: IMessageReceived) => {
      let receivedMessages = this.messages.get(msg.routingKey)
      if (!receivedMessages) {
        receivedMessages = []
      }
      receivedMessages.push(msg)
      this.messages.set(msg.routingKey, receivedMessages)
      msg.ack()
    })
  }

  public async expectMessage(routingKey: string, expectedMessage: any) {
    return waitForExpect(async () => {
      const msg = await this.getMessages(routingKey, expectedMessage)
      if (msg.success.length) {
        return msg.success.pop()
      }
      if (msg.failed.length) {
        throw msg.failed.pop()
      }
      throw new Error('message not received')
    })
  }

  public async getReceivedMessages(routingKey: string, expectedMessage?: any) {
    const msg = await this.getMessages(routingKey, expectedMessage)
    return msg.success
  }

  public async afterEach() {
    if (this.messagingConsumer) {
      await this.messagingConsumer.ackAll()
      await this.messagingConsumer.close()
    }
    this.messages = new Map<string, IMessageReceived[]>()
  }

  private async validateMessage(message: IMessageReceived, expectedMessage) {
    return expect(message.content).toMatchObject(expectedMessage)
  }

  private async getMessages(routingKey: string, expectedMessage?: any): Promise<{ success: any[]; failed: any[] }> {
    const receivedMessages = this.messages.get(routingKey)
    if (!receivedMessages || receivedMessages.length === 0) {
      return { success: [], failed: [] }
    }

    if (!expectedMessage) {
      return { success: receivedMessages, failed: [] }
    }
    const failed = []
    const success = []
    await Promise.all(
      receivedMessages.map(msg =>
        this.validateMessage(msg, expectedMessage)
          .then(x => success.push(x))
          .catch(err => failed.push(err))
      )
    )
    return { success, failed }
  }
}
