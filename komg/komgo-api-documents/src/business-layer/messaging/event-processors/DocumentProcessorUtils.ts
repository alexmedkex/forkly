import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { inject, injectable } from 'inversify'

import DocumentDataAgent from '../../../data-layer/data-agents/DocumentDataAgent'
import { DocumentState } from '../../../data-layer/models/ActionStates'
import { IDocument, IContent } from '../../../data-layer/models/document'
import { DocumentsTransactionManager } from '../../../infrastructure/blockchain/DocumentsTransactionManager'
import { TYPES } from '../../../inversify/types'
import { forEachAsync } from '../../../utils'
import { ErrorName } from '../../../utils/ErrorName'
import { DocumentMessageData } from '../messages'

import { ignoreDuplicatedError } from './utils'

/**
 * Processes document requests events.
 */
@injectable()
export class DocumentProcessorUtils {
  private readonly logger = getLogger('DocumentProcessorUtils')
  private transactionManagerInstance: DocumentsTransactionManager

  constructor(
    @inject(TYPES.DocumentDataAgent) private readonly documentDataAgent: DocumentDataAgent,
    @inject(TYPES.DocumentsTransactionManagerProvider)
    private readonly docTxManagerProvider: () => Promise<DocumentsTransactionManager>
  ) {}

  async storeNewDocuments(senderStaticId: string, productId: string, documents: DocumentMessageData[]): Promise<void> {
    this.logger.info('Storing documents from a documents message', { senderStaticId })

    if (!documents) {
      this.logger.info('There are no attachments, it should be a document request message', { senderStaticId })
      return
    }

    this.transactionManagerInstance = await this.transactionManager()

    await forEachAsync(documents, async document => {
      // if we have previously stored this document, skip it
      const documentExists = await this.documentDataAgent.existsWithId(document.productId, document.id)
      if (documentExists) {
        this.logger.warn(
          ErrorCode.DatabaseInvalidData,
          ErrorName.DocumentExistsError,
          'Skipping an existing document',
          { documentId: document.id }
        )
        return
      }

      this.logger.info('Storing a document with id %s', document.id)
      const fileContent: IContent = await this.processDocumentSaveFileBuffer(document)
      const newDocument = this.createNewDocument(document, fileContent)

      await ignoreDuplicatedError(senderStaticId, async () => {
        this.logger.info('Storing received document', { senderStaticId, documentId: document.id })
        await this.documentDataAgent.create(productId, newDocument)
        this.logger.info('Successfully stored received document', { senderStaticId, documentId: document.id })
      })
    })
  }

  private async processDocumentSaveFileBuffer(document: DocumentMessageData): Promise<IContent> {
    this.logger.info('Storing file buffer for file %s', document.content.id)

    const fileBuffer = Buffer.from(document.content.data, 'base64')

    // upsert doesn't work on gridfs so we specify 'id: undefined' in order
    // to save a new file, even if it had the same id
    // TODO: this could potentially leave dangling files, we should verify in the
    //       future if this is an actual concern
    const fileId = await this.documentDataAgent.saveFileBuffer({
      id: undefined,
      fileName: document.name,
      file: fileBuffer,
      contentType: document.content.contentType
    })

    return {
      fileId,
      signature: document.content.signature,
      size: fileBuffer.byteLength
    }
  }

  private createNewDocument(document: DocumentMessageData, fileContent: IContent): IDocument {
    return {
      id: document.id,
      context: document.context,
      productId: document.productId,
      categoryId: document.categoryId,
      typeId: document.typeId,
      name: document.name,
      owner: document.owner,
      metadata: document.metadata,
      hash: document.hash,
      contentHash: document.contentHash,
      komgoStamp: document.komgoStamp,
      registrationDate: document.registrationDate,
      content: fileContent,
      sharedBy: document.owner.companyId,
      sharedWith: [],
      state: DocumentState.Registered
    }
  }

  private async transactionManager(): Promise<DocumentsTransactionManager> {
    if (this.transactionManagerInstance) return this.transactionManagerInstance

    this.logger.info('Transaction manager not created. Using async transaction provider')
    this.transactionManagerInstance = await this.docTxManagerProvider()
    return this.transactionManagerInstance
  }
}
