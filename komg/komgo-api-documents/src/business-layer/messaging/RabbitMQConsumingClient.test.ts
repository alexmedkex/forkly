import 'reflect-metadata'

import { ConsumerWatchdog } from '@komgo/messaging-library'

import { mock } from '../../mock-utils'

import { ConsumerWatchdogFactory } from './ConsumerWatchdogFactory'
import { RabbitMQConsumingClient } from './RabbitMQConsumingClient'

const PUBLISHER_ID = 'publisher-id'
const ROUTING_KEY = 'routing-key'

const watchdogFactory = mock(ConsumerWatchdogFactory)
const consumerWatchdog = mock(ConsumerWatchdog)

describe('RabbitMQConsumingClient', () => {
  const onMessageReceived = jest.fn()

  let consumingClient

  beforeEach(() => {
    jest.resetAllMocks()

    watchdogFactory.create.mockReturnValue(consumerWatchdog)

    consumingClient = new RabbitMQConsumingClient(PUBLISHER_ID, [ROUTING_KEY], watchdogFactory)
  })

  it('starts watchdog to consume messages', async () => {
    await consumingClient.consumeMessages(onMessageReceived)

    expect(consumerWatchdog.listenMultiple).toBeCalledWith(PUBLISHER_ID, [ROUTING_KEY], onMessageReceived)
  })

  it('closes consumer watchdog', async () => {
    await consumingClient.close()

    expect(consumerWatchdog.close).toBeCalledWith()
  })

  it('does not propagates an exception if consumer watchdog failed to close', async () => {
    consumerWatchdog.close.mockRejectedValue(new Error('Failed to close consumer'))
    await consumingClient.close()

    expect(consumerWatchdog.close).toBeCalledWith()
  })
})
