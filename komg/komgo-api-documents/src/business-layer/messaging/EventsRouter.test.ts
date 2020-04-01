import 'jest'
import 'reflect-metadata'

import { IsDefined } from 'class-validator'

import { COMPANY_ID } from '../../data-layer/models/test-entities'

import { IEventProcessor } from './event-processors/IEventProcessor'
import InvalidMessage from './event-processors/InvalidMessage'
import { EventsRouter } from './EventsRouter'

class TestEvent {
  @IsDefined()
  value: string
}

const event: TestEvent = {
  value: 'value'
}

const eventName = 'event-name'

const eventProcessor: IEventProcessor<any> = {
  processEvent: jest.fn(),
  eventNames: jest.fn(),
  eventType: jest.fn()
}

describe('EventsRouter', () => {
  let eventsProcessor: EventsRouter

  beforeEach(async () => {
    jest.resetAllMocks()

    eventProcessor.eventNames.mockReturnValue([eventName])
    eventProcessor.eventType.mockReturnValue(TestEvent)

    eventsProcessor = new EventsRouter([eventProcessor])
  })

  it('sends event to a processor', async () => {
    await eventsProcessor.processEvent(COMPANY_ID, event, eventName)
    expect(eventProcessor.processEvent).toBeCalledWith(COMPANY_ID, event)
  })

  it('returns a list of routing keys all processors are subscribed to', async () => {
    const routingKeys = eventsProcessor.getRoutingKeys()
    expect(routingKeys).toEqual([eventName])
  })

  it('if error does not pass validation - ignores and acknowledges the message', async () => {
    const invalidEvent = {}
    const call = eventsProcessor.processEvent(COMPANY_ID, invalidEvent, eventName)

    await expect(call).rejects.toThrow(new InvalidMessage('Invalid event message of type: event-name'))
    expect(eventProcessor.processEvent).not.toHaveBeenCalled()
  })

  it('if unknown message type - ignores and acknowledges the message', async () => {
    const call = eventsProcessor.processEvent(COMPANY_ID, event, 'invalid-event-name')

    await expect(call).rejects.toThrow(new InvalidMessage('No processor for message of type: invalid-event-name'))
    expect(eventProcessor.processEvent).not.toHaveBeenCalled()
  })

  it('throw an error if two processors are registered for the same event', async () => {
    expect(() => {
      // tslint:disable-next-line:no-unused-expression
      new EventsRouter([eventProcessor, eventProcessor])
    }).toThrow(Error)
  })
})
