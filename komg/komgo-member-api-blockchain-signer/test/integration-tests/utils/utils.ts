import { AMQPConfig, AMQPUtility, ConsumerMicroservice } from '@komgo/integration-test-utilities'
import logger from '@komgo/logging'
import { SendTxResultMessage } from '@komgo/messaging-types/api-blockchain-signer'
import Axios from 'axios'
import waitForExpect from 'wait-for-expect'

import TransactionDataAgent from '../../../src/data-layer/data-agents/TransactionDataAgent'
import { ITransaction } from '../../../src/data-layer/models/transaction'
import { TransactionStatus } from '../../../src/data-layer/models/transaction/TransactionStatus'
import { IMockedIds } from './types'

const MAX_WAIT_FOR_MINING = 50000
const WAIT_FOR_EXPECT_INTERVAL = 2000
const REQUEST_ORIGIN = 'dummyMicroservice'

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

export const deleteInternalMQs = async (mockedIds: IMockedIds, amqConfig: AMQPConfig) => {
  const amqUtility = new AMQPUtility(amqConfig)

  await amqUtility.deleteQueue(mockedIds.publisherId)
  await amqUtility.deleteQueue(mockedIds.publisherIdDeadQueue)

  await amqUtility.deleteExchange(mockedIds.publisherId)
  await amqUtility.deleteExchange(mockedIds.publisherIdDeadExchange)
}

export const createMockedIds: () => IMockedIds = () => {
  const publisherId = generateRandomString(7, 'api-blockchain-signer-')
  return {
    publisherId,
    publisherIdDeadExchange: `${publisherId}.dead`,
    publisherIdDeadQueue: `${publisherId}.dead`
  }
}

export async function waitUntilServerIsUp(baseURL: string): Promise<void> {
  for (let i = 0; i < 30; i++) {
    try {
      const { data } = await Axios.get(`${baseURL}/ready`)
      if (data.mongo === 'OK' && data.blockchain === 'OK') {
        return
      }
    } catch (error) {
      await sleep(2000)
    }
  }
}

export async function waitForTransactionCompletion(txId: string): Promise<ITransaction> {
  const txDataAgent = new TransactionDataAgent()

  try {
    let tx
    await waitForExpect(
      async () => {
        logger.info('Waiting for transaction %s', txId)
        tx = await txDataAgent.getTransaction(txId)

        expect(tx).toBeDefined()
        expect(tx.status).not.toEqual(TransactionStatus.Pending)
      },
      MAX_WAIT_FOR_MINING,
      WAIT_FOR_EXPECT_INTERVAL
    )

    return tx
  } catch (e) {
    throw new Error(`Failed to get a transaction with id ${txId}: ${e.message}`)
  }
}

export async function verifyReceivedMessageInDummyMicroservice(
  consumerMicroservice: ConsumerMicroservice,
  publisherId: string,
  doneCallback: (errorObject: SendTxResultMessage) => Promise<void>
) {
  await consumerMicroservice.messagingConsumer.listen(
    publisherId,
    `KOMGO.SIGNER.SendTx.Error.${REQUEST_ORIGIN}`,
    async received => {
      expect(received.options.messageId).toBeDefined()
      received.ack()

      // finish test if this is the last check of the test
      await doneCallback(received.content as SendTxResultMessage)
    }
  )
}
