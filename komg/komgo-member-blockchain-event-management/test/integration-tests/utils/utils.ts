import { AMQPUtility, AMQPConfig, IExpectedMessage, ConsumerMicroservice } from '@komgo/integration-test-utilities'

import { IMockedIds } from './types'

export const generateRandomString = (length: number, prefix: string = '') => {
  let text = ''
  const possible = 'abcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < length; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  return `${prefix}${text}`
}

export const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const deleteInternalMQs = async (mockedIds: IMockedIds, amqpConfig = new AMQPConfig()) => {
  const amqpUtility = new AMQPUtility(amqpConfig)
  const connection = await amqpUtility.getConnection()
  const channel = await connection.createChannel()

  await channel.deleteQueue(mockedIds.publisherId)
  await channel.deleteQueue(mockedIds.publisherDeadQueue, { ifEmpty: true })
  await channel.deleteExchange(mockedIds.publisherId)
  await channel.deleteExchange(mockedIds.publisherDeadExchange)

  await connection.close()
}

export const createMockedIds: () => IMockedIds = () => {
  const publisherId = generateRandomString(7, 'blockchain-event-mgnt-')
  return {
    publisherId,
    publisherDeadExchange: `${publisherId}.dead`,
    publisherDeadQueue: `${publisherId}.dead`
  }
}

export async function verifyReceivedMessageInDummyMicroservice(
  done: any,
  expectedContent: any,
  consumerMicroservice: ConsumerMicroservice
) {
  const expectedMessage: IExpectedMessage = {
    hasMessageId: true,
    content: expectedContent,
    options: { requestId: expect.any(String) },
    hasError: false
  }

  await consumerMicroservice.expectMessage('BLK.#', expectedMessage, done)
}
