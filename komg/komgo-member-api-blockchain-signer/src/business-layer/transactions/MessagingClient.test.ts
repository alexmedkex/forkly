import 'jest'
import 'reflect-metadata'

import { MessagingFactory } from '@komgo/messaging-library'
import createMockInstance from 'jest-create-mock-instance'

import { ITransaction } from '../../data-layer/models/transaction'
import { TransactionStatus } from '../../data-layer/models/transaction/TransactionStatus'
import { TX_ID } from '../../utils/test-data'

import MessagingClient from './MessagingClient'

const PUBLISHER_ID = 'publisher-id'

const mockMessagePublisher = {
  publish: jest.fn(),
  publishCritical: jest.fn(),
  close: jest.fn()
}

const TX_HASH = 'txHash'
const ERROR_MSG = 'Error'
const REQUEST_ORIGIN = 'RequestOrigin'

const RECEIVER_ACCOUNT = '0xC7ed7D093a81f7Fd2860f9e36A4bB88Efca94A47'

const txContext = {
  key: 'value'
}

const companyEthData = {
  address: '0xf8Ce58a70CDC6e59AE4A395aCD21F70489Cac71e',
  privateKey: '0x319f0c0aa7d12b074b67a63580518611374735e902113ae36f7a805085d4b93c'
}

const publicTxBody = {
  from: companyEthData.address,
  to: RECEIVER_ACCOUNT,
  value: '0x0',
  gas: 314159,
  gasLimit: 314159,
  gasPrice: '0x0',
  data: 'txData'
}

const sampleTx: ITransaction = {
  id: TX_ID,
  nonce: 0,
  from: companyEthData.address,
  body: publicTxBody,
  hash: TX_HASH,
  status: 'pending',
  mined: false,
  receipt: undefined,
  requestOrigin: REQUEST_ORIGIN,
  attempts: 0,
  context: txContext
}

const sampleTxNoOrigin = {
  ...sampleTx,
  requestOrigin: undefined
}

describe('MessagingClient', () => {
  let messagingClient: MessagingClient
  let mockMessagingFactory: jest.Mocked<MessagingFactory>

  beforeEach(() => {
    mockMessagingFactory = createMockInstance(MessagingFactory)

    mockMessagingFactory.createRetryPublisher.mockReturnValue(mockMessagePublisher)

    messagingClient = new MessagingClient(mockMessagingFactory, PUBLISHER_ID)
  })

  it('publishes a message for a successful transaction', async () => {
    await messagingClient.publishSuccessMessage(sampleTxNoOrigin)

    expect(mockMessagePublisher.publishCritical).toHaveBeenCalledWith(`KOMGO.SIGNER.SendTx.Success`, {
      txHash: TX_HASH,
      txId: TX_ID,
      status: TransactionStatus.Confirmed,
      context: txContext
    })
  })

  it('publishes a message for a successful transaction to a request origin if provided', async () => {
    await messagingClient.publishSuccessMessage(sampleTx)

    expect(mockMessagePublisher.publishCritical).toHaveBeenCalledWith(`KOMGO.SIGNER.SendTx.Success.${REQUEST_ORIGIN}`, {
      txHash: TX_HASH,
      txId: TX_ID,
      status: TransactionStatus.Confirmed,
      context: txContext
    })
  })

  it('publishes a message for an unsuccessful transaction', async () => {
    await messagingClient.publishErrorMessage(sampleTxNoOrigin, ERROR_MSG, TransactionStatus.Reverted)

    expect(mockMessagePublisher.publishCritical).toHaveBeenCalledWith(`KOMGO.SIGNER.SendTx.Error`, {
      txId: TX_ID,
      status: TransactionStatus.Reverted,
      txHash: TX_HASH,
      errorType: 'SendTransactionError',
      message: ERROR_MSG,
      context: txContext
    })
  })

  it('publishes a message for an unsuccessful transaction to a request origin if provided', async () => {
    await messagingClient.publishErrorMessage(sampleTx, ERROR_MSG, TransactionStatus.Reverted)

    expect(mockMessagePublisher.publishCritical).toHaveBeenCalledWith(`KOMGO.SIGNER.SendTx.Error.${REQUEST_ORIGIN}`, {
      txId: TX_ID,
      status: TransactionStatus.Reverted,
      txHash: TX_HASH,
      errorType: 'SendTransactionError',
      message: ERROR_MSG,
      context: txContext
    })
  })

  it('do nothing on start', async () => {
    await messagingClient.start()
  })

  it('stop message publisher on stop', async () => {
    await messagingClient.stop()

    expect(mockMessagePublisher.close).toHaveBeenCalledTimes(1)
    expect(mockMessagePublisher.close).toBeCalledWith()
  })
})
