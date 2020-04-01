import 'reflect-metadata'

import InvalidMessage from '../../business-layer/messaging/event-processors/InvalidMessage'
import { EventsRouter } from '../../business-layer/messaging/EventsRouter'
import { RabbitMQConsumingClient } from '../../business-layer/messaging/RabbitMQConsumingClient'
import { COMPANY_ID } from '../../data-layer/models/test-entities'
import { mock } from '../../mock-utils'

import DocumentEventService from './DocumentEventService'

const consumingClient = mock(RabbitMQConsumingClient)

const routingKey = 'routing-key'

const messageContent = {
  value: 'message'
}

const rmqMessage = {
  ack: jest.fn(),
  reject: jest.fn(),
  requeue: jest.fn(),
  content: messageContent,
  routingKey,
  options: {
    messageId: 'message-id',
    senderStaticId: COMPANY_ID
  }
}

const eventsRouter = mock(EventsRouter)

describe('DocumentEventService test', () => {
  let documentEventService: DocumentEventService

  beforeEach(async () => {
    jest.resetAllMocks()

    documentEventService = new DocumentEventService([consumingClient], eventsRouter)
    await documentEventService.start()
  })

  it('starts messages consumer', async () => {
    await documentEventService.start()
    expect(consumingClient.consumeMessages).toBeCalledWith(expect.any(Function))
  })

  it('consumes messages', async () => {
    await sendMessage()

    expect(eventsRouter.processEvent).toBeCalledWith(COMPANY_ID, messageContent, routingKey)
  })

  it('acknowledges correctly processed messages', async () => {
    await sendMessage()

    expect(rmqMessage.ack).toBeCalledWith()
  })

  it('messages requeued if an unknown error is thrown', async () => {
    eventsRouter.processEvent.mockRejectedValue(new Error('Failed to process message'))

    await sendMessage()

    expect(rmqMessage.ack).not.toHaveBeenCalled()
    expect(rmqMessage.requeue).toHaveBeenCalled()
  })

  it('messages rejected if they permanently cannot be processed', async () => {
    eventsRouter.processEvent.mockRejectedValue(new InvalidMessage('Failed to process message'))

    await sendMessage()

    expect(rmqMessage.ack).not.toHaveBeenCalled()
    expect(rmqMessage.reject).toHaveBeenCalled()
  })

  it('stops messages consumer', async () => {
    await documentEventService.stop()

    expect(consumingClient.close).toBeCalledWith()
  })
})

async function sendMessage() {
  const messagesListener = getMessageListener()
  await messagesListener(rmqMessage)
}

function getMessageListener() {
  return consumingClient.consumeMessages.mock.calls[0][0]
}
