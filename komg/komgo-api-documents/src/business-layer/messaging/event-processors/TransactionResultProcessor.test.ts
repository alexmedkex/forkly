import { MessagingFactory } from '@komgo/messaging-library'
import { TransactionStatus } from '@komgo/messaging-types'
import 'jest'
import 'reflect-metadata'

import DocumentDataAgent from '../../../data-layer/data-agents/DocumentDataAgent'
import InvalidOperation from '../../../data-layer/data-agents/exceptions/InvalidOperation'
import { DocumentState } from '../../../data-layer/models/ActionStates'
import { IDocument } from '../../../data-layer/models/document'
import { document, TX_ID, PRODUCT_ID, DOCUMENT_ID } from '../../../data-layer/models/test-entities'
import { mock } from '../../../mock-utils'
import { EVENT_NAME } from '../enums'

import InvalidMessage from './InvalidMessage'
import { TransactionResultProcessor } from './TransactionResultProcessor'

describe('testName', () => {
  let transactionResultProcessor
  let documentDataAgent
  let messagingFactory
  let magicLinkService
  let docTxManagerProvider

  beforeEach(() => {
    jest.resetAllMocks()
    documentDataAgent = mock(DocumentDataAgent)
    messagingFactory = mock(MessagingFactory)

    documentDataAgent.getBareByTransactionId.mockResolvedValue(document())

    const updatedDoc: IDocument = document()
    updatedDoc.state = DocumentState.Registered
    documentDataAgent.updateDocumentState.mockResolvedValue(updatedDoc)

    transactionResultProcessor = new TransactionResultProcessor(
      documentDataAgent,
      messagingFactory,
      'testWebSocketPublisherId'
    )
  })

  it('subscribes to correct events', () => {
    expect(transactionResultProcessor.eventNames()).toEqual([
      EVENT_NAME.BlockchainTransactionError,
      EVENT_NAME.BlockchainTransactionSuccess
    ])
  })

  it('updates document status is a transaction was successfully processed', async () => {
    await transactionResultProcessor.processEvent('', {
      txId: TX_ID,
      status: TransactionStatus.Confirmed
    })

    expect(documentDataAgent.updateDocumentState).toBeCalledWith(PRODUCT_ID, DOCUMENT_ID, DocumentState.Registered)
  })

  it('updates document status is a transaction was reverted', async () => {
    await transactionResultProcessor.processEvent('', {
      txId: TX_ID,
      status: TransactionStatus.Reverted
    })

    expect(documentDataAgent.updateDocumentState).toBeCalledWith(PRODUCT_ID, DOCUMENT_ID, DocumentState.Failed)
  })

  it('updates document status is a transaction execution failed', async () => {
    await transactionResultProcessor.processEvent('', {
      txId: TX_ID,
      status: TransactionStatus.Failed
    })

    expect(documentDataAgent.updateDocumentState).toBeCalledWith(PRODUCT_ID, DOCUMENT_ID, DocumentState.Failed)
  })

  it('do not update status of a document if a document for a transaction was not found', async () => {
    documentDataAgent.getBareByTransactionId.mockResolvedValue(null)
    await transactionResultProcessor.processEvent('', {
      txId: TX_ID,
      status: TransactionStatus.Failed
    })

    expect(documentDataAgent.updateDocumentState).not.toHaveBeenCalled()
  })

  it('do not update status of a document if a document for a transaction was not found', async () => {
    documentDataAgent.getBareByTransactionId.mockResolvedValue(null)
    await transactionResultProcessor.processEvent('', {
      txId: TX_ID,
      status: TransactionStatus.Failed
    })

    expect(documentDataAgent.updateDocumentState).not.toHaveBeenCalled()
  })

  it('reject a message if attempted invalid document status change', async () => {
    documentDataAgent.updateDocumentState.mockRejectedValue(new InvalidOperation('Invalid state change'))
    const call = transactionResultProcessor.processEvent('', {
      txId: TX_ID,
      status: TransactionStatus.Failed
    })

    await expect(call).rejects.toThrowError(
      new InvalidMessage('Failed to update document status - Invalid state change')
    )
  })

  it('re-throw an error if data agent fails for an unknown reason', async () => {
    const unknownError = new Error('Unknown error')
    documentDataAgent.updateDocumentState.mockRejectedValue(unknownError)

    const call = transactionResultProcessor.processEvent('', {
      txId: TX_ID,
      status: TransactionStatus.Failed
    })

    await expect(call).rejects.toThrowError(unknownError)
  })
})
