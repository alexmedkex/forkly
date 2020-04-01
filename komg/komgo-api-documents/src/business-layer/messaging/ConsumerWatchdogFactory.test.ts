import 'reflect-metadata'

import { MessagingFactory } from '@komgo/messaging-library'

import { mock } from '../../mock-utils'

import { ConsumerWatchdogFactory } from './ConsumerWatchdogFactory'

const CONSUMER_ID = 'consumer-id'
const messagingFactory = mock(MessagingFactory)
const consumer = {}

describe('ConsumerWatchdogFactory', () => {
  let watchdogFactory

  beforeEach(() => {
    jest.resetAllMocks()

    watchdogFactory = new ConsumerWatchdogFactory(CONSUMER_ID, messagingFactory)
    messagingFactory.createConsumer.mockReturnValue(consumer)
  })

  it('creates a consumer watchdog', async () => {
    const watchdog = watchdogFactory.create()

    expect(watchdog.messageConsumer).toBeDefined()
  })
})
