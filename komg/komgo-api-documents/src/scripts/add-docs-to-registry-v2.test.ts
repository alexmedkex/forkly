import { AddDocsToRegistryV2Command } from './add-docs-to-registry-v2'

jest.mock('../service-layer/utils/stream-reader', () => ({
  readableToBuffer: () => new Buffer('buffer')
}))
jest.mock('../utils/connectToDb', () => ({
  connectToDb: jest.fn()
}))
jest.mock('../utils/setupLogging', () => ({
  setUpLogging: jest.fn()
}))
jest.mock('./utils/waitUntilReady', () => ({
  waitUntilReady: jest.fn()
}))

describe('AddDocsToRegistryV2Command', () => {
  let command
  const document = {
    id: 'docId',
    metadata: 'metadata',
    content: 'content',
    createdAt: new Date('2019-01-01'),
    name: 'document name'
  }
  const documentDataAgent: any = {
    getDocuments: jest.fn(() => [document]),
    getFileStream: jest.fn(),
    resetTransactionId: jest.fn()
  }
  const docTxManager: any = {
    findDocument: jest.fn(),
    hash: jest.fn(() => new Buffer('hash')),
    merkle: jest.fn(() => 'merkleHash'),
    submitDocHashes: jest.fn()
  }

  beforeEach(() => {
    command = new AddDocsToRegistryV2Command(documentDataAgent, () => docTxManager)
  })

  it('should call docTxManager.submitDocHashes with correct args', async () => {
    await command.run()

    expect(docTxManager.submitDocHashes).toHaveBeenCalledWith(['merkleHash'])
  })

  it('should not call docTxManager.submitDocHashes if a document is already registered', async () => {
    docTxManager.findDocument.mockResolvedValueOnce({
      timestamp: Date.now(),
      merkle: 'merkle'
    })

    await command.run()

    expect(docTxManager.submitDocHashes).not.toHaveBeenCalled()
  })

  it('should throw error if submitDocHashes throws()', async () => {
    docTxManager.submitDocHashes.mockRejectedValueOnce(new Error('oops'))

    await expect(command.run()).rejects.toEqual(new Error('oops'))
  })
})
