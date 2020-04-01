import { TaskStatus } from '@komgo/notification-publisher/dist'
import { Web3Wrapper } from '@komgo/blockchain-access'
import { ILetterOfCreditDataAgent } from '../../src/data-layer/data-agents'
const Web3EthAbi = require('web3-eth-abi')
const fs = require('fs')
const AsyncPolling = require('async-polling')

export const ExampleData = {
  exampleHash: '0x6146ccf6a66d994f7c363db875e31ca35581450a4bf6d3be6cc9ac79233a69d0',
  exampleTxHash: '0x71a931f92508a8e2d32a350302230b25ac4a8e5c85bd6f4f1a4f5881482a0897',
  exampleAddress: '0x9396d8F9C0EFB2BbCfFEA5F2C568D72C9b1C4C60',
  ens_address: '0x4a6fa0250e074e3765e6a726f8ae11c3c00e42f4'
}

export const generateRandomString = (length: number, prefix: string = '') => {
  let text = ''
  const possible = 'abcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < length; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  return `${prefix}${text}`
}

export const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function getExpectedTask(lcId: string, taskType: string, status: TaskStatus, outcome: boolean) {
  return {
    status,
    taskType,
    context: { type: 'LC', lcid: lcId },
    outcome
  }
}

export function verifyTask(task, expectedTask) {
  expect(task.status).toEqual(expectedTask.status)
  expect(task.taskType).toEqual(expectedTask.taskType)
  expect(task.context).toEqual(expectedTask.context)
  expect(task.outcome).toEqual(expectedTask.outcome)
}

export function getFormData(companyId) {
  const extraData = {
    name: 'Doc',
    metadata: [{ name: '42r', value: `${Math.random()}` }],
    issuedLCReference: 'lcRef',
    owner: {
      firstName: 'Roger',
      lastName: 'Federe',
      companyId
    }
  }
  // uses the sample file as file data for the form
  const formData = {
    fileData: fs.createReadStream('./integration-tests/sampledata/SampleFile.txt'),
    extraData: JSON.stringify(extraData)
  }
  return formData
}

export function buildEventsMapping(deployedContracts): any {
  const eventsAbi = loadAllEventsAbis(deployedContracts)
  const mapping = {}
  for (const ev of eventsAbi) {
    const sig = Web3Wrapper.web3Instance.eth.abi.encodeEventSignature(ev)
    mapping[ev.name] = sig
  }
  return mapping
}

export function loadAllEventsAbis(deployedContracts: any[]) {
  let contractEvents = []
  // todo add all events we want to process
  for (const contract of deployedContracts) {
    const eventsAbi = contract.abi.filter(ev => ev.type === 'event')
    contractEvents = contractEvents.concat(eventsAbi)
  }
  return contractEvents
}

export function buildEventObject(
  paramNames: string[],
  params: any[],
  topic: string,
  transactionHash: string,
  contractAddress: string
) {
  const encodedEventParams = Web3EthAbi.encodeParameters(paramNames, params)
  return {
    data: encodedEventParams,
    topics: [topic],
    blockNumber: 941,
    transactionHash,
    contractAddress
  }
}

export function expectObjectInDatabase(dataAgent: ILetterOfCreditDataAgent, expected: object, done) {
  const polling = createMongoPolling(dataAgent, expected, done)
  polling.run()
}

function createMongoPolling(dataAgent: ILetterOfCreditDataAgent, expected: object, done: any) {
  const startTime = Date.now()

  const polling = new AsyncPolling(async end => {
    const lc = await dataAgent.find(expected)
    if (lc[0] || Date.now() > startTime + 20000) {
      expect(lc[0]).toMatchObject(expected)
      polling.stop()
      done()
    }
    end()
  }, 500)
  return polling
}
