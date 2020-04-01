import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { inject, injectable } from 'inversify'
import 'reflect-metadata'
import { Readable } from 'stream'

import DocumentDataAgent from '../data-layer/data-agents/DocumentDataAgent'
import { IFullDocument } from '../data-layer/models/document'
import { DocumentsTransactionManager } from '../infrastructure/blockchain/DocumentsTransactionManager'
import { iocContainer } from '../inversify/ioc'
import { TYPES } from '../inversify/types'
import { readableToBuffer } from '../service-layer/utils/stream-reader'
import { connectToDb } from '../utils/connectToDb'
import { ErrorName } from '../utils/ErrorName'
import { runAsyncAndExit } from '../utils/runAsync'
import { setUpLogging } from '../utils/setupLogging'

import { waitUntilReady } from './utils/waitUntilReady'

@injectable()
export class AddDocsToRegistryV2Command {
  private readonly logger = getLogger('AddDocsToRegistryV2Command')
  private docTxManager: DocumentsTransactionManager

  constructor(
    @inject(TYPES.DocumentDataAgent) private readonly documentDataAgent: DocumentDataAgent,
    @inject(TYPES.DocumentsTransactionManagerProvider)
    private readonly docTxManagerProvider: () => Promise<DocumentsTransactionManager>
  ) {}

  async getDocTxManager(): Promise<DocumentsTransactionManager> {
    if (!this.docTxManager) {
      this.docTxManager = await this.docTxManagerProvider()
    }
    return this.docTxManager
  }

  async run() {
    setUpLogging()
    connectToDb()
    await waitUntilReady()

    this.logger.info('Starting document registration')
    await this.addDocsToRegistryV2()
    this.logger.info('Done')
  }

  /**
   * Finds all documents in the DB and registers them in Document Registry v2
   */
  async addDocsToRegistryV2() {
    const docTxManager = await this.getDocTxManager()
    const documents = await this.documentDataAgent.getDocuments({
      sharedBy: 'none'
    })
    this.logger.info(`Found ${documents.length} documents uploaded by the current company`)
    const total = documents.length
    let i = 0
    for (const doc of documents) {
      i++
      const txInfo = await docTxManager.findDocument(doc.hash)
      if (txInfo) {
        this.logger.info(`[${i} of ${total}] Document ${doc.id} is already registered`, {
          name: doc.name,
          createdAt: doc.createdAt,
          registeredAt: new Date(txInfo.timestamp).toISOString(),
          comapnyStaticId: txInfo.companyStaticId
        })
      } else {
        this.logger.info(`[${i} of ${total}] Registering document ${doc.id}...`, {
          name: doc.name,
          createdAt: doc.createdAt
        })
        await this.registerHash(doc)
      }
    }
  }

  private async registerHash(doc: IFullDocument) {
    const docTxManager = await this.getDocTxManager()
    const stream: Readable = await this.documentDataAgent.getFileStream(doc.content.fileId)
    const originalDocumentFile = await readableToBuffer(stream)
    const content: string = originalDocumentFile.toString('base64')
    const hashDoc: Buffer = docTxManager.hash(content)
    const hashMetadata: Buffer = docTxManager.hash(JSON.stringify(doc.metadata))
    const hashMerkle: string = docTxManager.merkle([hashDoc, hashMetadata])

    let transactionId: string
    try {
      this.logger.info('Sending a blockchain transaction to send a document', {
        documentId: doc.id
      })
      transactionId = await docTxManager.submitDocHashes([hashMerkle])
    } catch (txError) {
      this.logger.error(
        ErrorCode.Connection,
        ErrorName.SubmitDocumentHashError,
        'Failed to submit hash to blockchain signer!',
        {
          errorMessage: txError.message
        }
      )
      throw txError
    }

    this.logger.info('Reseting transaction id and state', { transactionId, documentId: doc.id })
    await this.documentDataAgent.resetTransactionId(doc.id, transactionId)
  }
}

if (require.main === module) {
  iocContainer.bind<AddDocsToRegistryV2Command>(AddDocsToRegistryV2Command).to(AddDocsToRegistryV2Command)
  const addDocsToRegistryV2Command = iocContainer.get<AddDocsToRegistryV2Command>(AddDocsToRegistryV2Command)
  runAsyncAndExit(addDocsToRegistryV2Command.run.bind(addDocsToRegistryV2Command))
}
