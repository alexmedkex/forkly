import { AMQPConfig } from '@komgo/integration-test-utilities' // tslint:disable-line
import { MessagingFactory, IMessagePublisher, IMessageConsumer } from '@komgo/messaging-library'

import { sleep, generateRandomString } from './utils'

export default class MQMessageClient {
  amqpConfig = new AMQPConfig()
  private messagingPublisher: IMessagePublisher
  private messagingConsumer: IMessageConsumer

  constructor(private readonly consumerName: string = generateRandomString(7, 'vakt-consumer-')) {}

  public async beforeEach() {
    const factory = new MessagingFactory(this.amqpConfig.host, this.amqpConfig.username, this.amqpConfig.password)
    this.messagingConsumer = factory.createConsumer(this.consumerName)
    this.messagingPublisher = factory.createPublisher('from-event-mgnt')
    await this.messagingConsumer.ackAll()
  }

  public async afterEach() {
    await sleep(300) // wait for acks()

    await this.messagingConsumer.close()
    await this.messagingPublisher.close()
  }

  public async publish(message: string, eventObject: object) {
    this.messagingPublisher.publish(message, eventObject)
  }

  public async listen(publisherId: string, routingKey: string, callback) {
    this.messagingConsumer.listen(publisherId, routingKey, callback)
  }
}
