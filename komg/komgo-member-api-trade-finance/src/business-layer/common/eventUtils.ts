import * as _ from 'lodash'
import { Web3Wrapper } from '@komgo/blockchain-access'

const baseParams = [
  {
    indexed: true,
    name: 'eventSource',
    type: 'string'
  },
  {
    indexed: false,
    name: 'eventType',
    type: 'string'
  }
]

export const getEventsForContract = (contractList, contractTopicName) => {
  const allEvents = {}

  contractList.contracts.forEach(contract => {
    const events = contract.abi.filter((ev: any) => ev.type === 'event')

    if (contract.version === 0) {
      _.map(events, ev => {
        const topic = Web3Wrapper.web3Instance.eth.abi.encodeEventSignature(ev)

        allEvents[topic] = {
          events: [ev],
          contract
        }
      })
    } else {
      _.map(events, (ev: any) => {
        if (ev.anonymous) {
          // by convention, all anonymous events will be indexed with contract name
          if (allEvents[contractTopicName]) {
            allEvents[contractTopicName].events.push(ev)
          } else {
            allEvents[contractTopicName] = {
              events: [ev],
              contract
            }
          }
        } else {
          const topic = Web3Wrapper.web3Instance.eth.abi.encodeEventSignature(ev)

          allEvents[topic] = {
            events: [ev],
            contract
          }
        }
      })
    }
  })

  return allEvents
}

export const decodeReceivedEvent = (mappings, event, contractTopicName) => {
  const topic = event.topics[0]
  const eventDefinitions = mappings[event.topics[0]].events

  // common event
  if (topic !== contractTopicName) {
    return decodeEvent(eventDefinitions[0], event.data, event.topics)
  }

  const realEvent = decodeContactCommonEvent(event.data, contractTopicName, eventDefinitions)

  return realEvent
}

export const decodeContactCommonEvent = (data: string, contractTopic: string, contactEvents) => {
  const sourceEventData = decodeEvent({ inputs: baseParams }, data, [contractTopic])

  const eventName = sourceEventData.eventType // real event name is in this field by convention
  const eventDefinition = _.find(contactEvents, ev => ev.name === eventName) // find real eventAbi

  const eventData = decodeEvent(eventDefinition, data, [contractTopic])

  return mergeAbiWithValues(eventDefinition, eventData)
}

export const decodeEvent = (eventAbi, data, topics) => {
  if (!eventAbi) {
    return {}
  }
  const event = Web3Wrapper.web3Instance.eth.abi.decodeLog(eventAbi.inputs, data, topics)
  return mergeAbiWithValues(eventAbi, event)
}

const mergeAbiWithValues = (eventAbi, eventValues): any => {
  const merged = { name: eventAbi.name }
  for (const input of eventAbi.inputs) {
    merged[input.name] = eventValues[input.name]
  }
  return merged
}
