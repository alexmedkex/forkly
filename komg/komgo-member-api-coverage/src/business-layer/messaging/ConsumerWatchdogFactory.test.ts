import 'reflect-metadata'

import { MessagingFactory, IConsumerWatchdog } from '@komgo/messaging-library'

import { mock } from '../../mock-utils'
import { ConsumerWatchdogFactory, RETRY_DELAY } from './ConsumerWatchdogFactory'

const CONSUMER_ID = 'consumer-id'
const messagingFactory = mock(MessagingFactory)
const consumer = {}

describe('ConsumerWatchdogFactory', () => {
  let watchdogFactory

  beforeEach(() => {
    jest.resetAllMocks()

    messagingFactory.createConsumerWatchdog.mockReturnValue(consumer as IConsumerWatchdog)
    watchdogFactory = new ConsumerWatchdogFactory(CONSUMER_ID, messagingFactory)
  })

  it('creates a consumer watchdog', async () => {
    watchdogFactory.create()

    expect(messagingFactory.createConsumerWatchdog).toHaveBeenCalledWith(CONSUMER_ID, RETRY_DELAY)
  })
})
