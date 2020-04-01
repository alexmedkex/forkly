import { getEventsForContract, decodeReceivedEvent } from './eventUtils'
const Web3EthAbi = require('web3-eth-abi')
import * as _ from 'lodash'
const web3Utils = require('web3-utils')

describe('eventUtils', () => {
  const LCContractTopicName = web3Utils.soliditySha3('LCApplication')

  const contractV1: any = [
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: 'creatorRole',
          type: 'bytes32'
        },
        {
          indexed: false,
          name: 'creatorGuid',
          type: 'bytes32'
        },
        {
          indexed: false,
          name: 'data',
          type: 'string'
        },
        {
          indexed: false,
          name: 'draftLCDocumentHash',
          type: 'string'
        },
        {
          indexed: false,
          name: 'commercialContractDocumentHash',
          type: 'string'
        }
      ],
      name: 'LCCreated',
      type: 'event'
    },
    {
      anonymous: true,
      inputs: [
        {
          indexed: true,
          name: 'eventSource',
          type: 'string'
        },
        {
          indexed: false,
          name: 'eventType',
          type: 'string'
        },
        {
          indexed: false,
          name: 'stateId',
          type: 'bytes32'
        },
        {
          indexed: false,
          name: 'blockNumber',
          type: 'uint256'
        }
      ],
      name: 'Transition',
      type: 'event'
    },
    {
      anonymous: true,
      inputs: [
        {
          indexed: true,
          name: 'eventSource',
          type: 'string'
        },
        {
          indexed: false,
          name: 'eventType',
          type: 'string'
        },
        {
          indexed: false,
          name: 'fieldName',
          type: 'bytes32'
        },
        {
          indexed: false,
          name: 'updatedBy',
          type: 'bytes32'
        },
        {
          indexed: false,
          name: 'data',
          type: 'string'
        },
        {
          indexed: false,
          name: 'nonce',
          type: 'uint8'
        }
      ],
      name: 'DataUpdated',
      type: 'event'
    }
  ]

  const contractV0: any = [
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: 'creatorRole',
          type: 'bytes32'
        },
        {
          indexed: false,
          name: 'creatorGuid',
          type: 'bytes32'
        },
        {
          indexed: false,
          name: 'data',
          type: 'string'
        },
        {
          indexed: false,
          name: 'draftLCDocumentHash',
          type: 'string'
        },
        {
          indexed: false,
          name: 'commercialContractDocumentHash',
          type: 'string'
        }
      ],
      name: 'LCCreated',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: 'previousOwner',
          type: 'address'
        },
        {
          indexed: true,
          name: 'newOwner',
          type: 'address'
        }
      ],
      name: 'OwnershipTransferred',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: 'stateId',
          type: 'bytes32'
        },
        {
          indexed: false,
          name: 'blockNumber',
          type: 'uint256'
        }
      ],
      name: 'Transition',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: 'fieldName',
          type: 'bytes32'
        },
        {
          indexed: false,
          name: 'updatedBy',
          type: 'bytes32'
        },
        {
          indexed: false,
          name: 'data',
          type: 'string'
        }
      ],
      name: 'DataUpdated',
      type: 'event'
    }
  ]

  const mockContracts = [
    {
      version: 0,
      abi: contractV0
    },
    {
      version: 1,
      abi: contractV1
    }
  ]

  it('should prepare events mappings', () => {
    const mappings = getEventsForContract({ contracts: mockContracts }, LCContractTopicName)

    // all declared anonymous event will have common contract topic name
    expect(mappings[LCContractTopicName].events).toMatchObject([{ name: 'Transition' }, { name: 'DataUpdated' }])

    // non anonimous event has topic as event signature
    const LCCreatedTopic = Web3EthAbi.encodeEventSignature(contractV1[0])
    expect(mappings[LCCreatedTopic].events.length).toBe(1)
  })

  it('should parse anonymous event', () => {
    const mappings = getEventsForContract({ contracts: mockContracts }, LCContractTopicName)
    const transitionEvent = _.find(contractV1, ev => ev.name === 'Transition')

    const event = {
      topics: [LCContractTopicName],
      data: Web3EthAbi.encodeParameters(transitionEvent.inputs.filter(i => !i.indexed), [
        'Transition',
        web3Utils.asciiToHex('state'),
        123
      ])
    }

    const decodedEvent = decodeReceivedEvent(mappings, event, LCContractTopicName)
    expect(decodedEvent).toMatchObject({
      eventType: 'Transition',
      name: 'Transition'
    })

    expect(web3Utils.hexToString(decodedEvent.stateId)).toBe('state')
  })

  it('should parse LCCreated', () => {
    const mappings = getEventsForContract({ contracts: mockContracts }, LCContractTopicName)
    const lcCreatedEvent = _.find(contractV1, ev => ev.name === 'LCCreated')

    const event = {
      topics: [Web3EthAbi.encodeEventSignature(lcCreatedEvent)],
      data: Web3EthAbi.encodeParameters(lcCreatedEvent.inputs, [
        '0x6146ccf6a66d994f7c363db875e31ca35581450a4bf6d3be6cc9ac79233a69d0',
        '0x6146ccf6a66d994f7c363db875e31ca35581450a4bf6d3be6cc9ac79233a69d0',
        'sample data',
        'doc hash',
        'doc2 hash'
      ])
    }

    const decodedEvent = decodeReceivedEvent(mappings, event, LCContractTopicName)
    expect(decodedEvent).toMatchObject({ name: 'LCCreated' })
  })
})
