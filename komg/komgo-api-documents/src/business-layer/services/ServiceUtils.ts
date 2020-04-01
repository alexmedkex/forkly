import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ErrorUtils } from '@komgo/microservice-config'
import { injectable } from 'inversify'
import { Readable } from 'stream'

import DocumentDataAgent from '../../data-layer/data-agents/DocumentDataAgent'
import { IDocument, IOwner } from '../../data-layer/models/document'
import { MetricNames } from '../../infrastructure/metrics/consts'
import { metric } from '../../infrastructure/metrics/metrics'
import { CONFIG_KEYS } from '../../inversify/config_keys'
import { inject } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { streamToBuffer } from '../../utils'
import { DocumentMessageData } from '../messaging/messages/DocumentMessageData'
import { OwnerMessageData } from '../messaging/messages/OwnerMessageData'

const documentsSize = metric(MetricNames.DocumentsSharedSize)
@injectable()
export default class ServiceUtils {
  private readonly logger = getLogger('ServiceUtils')

  constructor(
    @inject(TYPES.DocumentDataAgent) private readonly documentDataAgent: DocumentDataAgent,
    @inject(CONFIG_KEYS.ShareDocumentsSizeLimit) private readonly shareDocumentsSizeLimit: number
  ) {}

  public async convertDocumentToMessages(documents: IDocument[]): Promise<DocumentMessageData[]> {
    return Promise.all(
      documents.map(async document => {
        this.logger.info('Fetching content for document %s', document.id)
        const stream: Readable = await this.documentDataAgent.getFileStream(document.content.fileId)
        const fileBuffer: Buffer = await streamToBuffer(stream)
        this.logger.info('Content for document %s id %d bytes', document.id, fileBuffer.byteLength)
        const contentType = await this.documentDataAgent.getFileContentType(document.content.fileId)

        const base64Content = fileBuffer.toString('base64')

        return {
          id: document.id,
          context: document.context,
          productId: document.productId,
          categoryId: document.categoryId,
          typeId: document.typeId,
          name: document.name,
          owner: this.convertOwner(document.owner),
          metadata: document.metadata,
          hash: document.hash,
          contentHash: document.contentHash,
          komgoStamp: document.komgoStamp,
          registrationDate: new Date(0), // Using epoch in order to not share the real date
          content: {
            id: document.content.fileId,
            data: base64Content,
            contentType,
            signature: document.content.signature
          },
          notes: ''
        }
      })
    )
  }

  public async checkDocumentsSize(documents: IDocument[]) {
    // verify total size and ensure it doesn't pass the limits by using map/reduce
    // 1) map: for each document, retrieve it's length - document size
    // 2) reduce: given a list of document sizes, sum all of them
    const totalDocumentsSize: number = await Promise.all(
      documents.map(async document => {
        const length: number = await this.documentDataAgent.getFileLength(document.content.fileId)
        this.logger.debug('Document %s size: %d', document.id, length, {
          documentId: document.id,
          size: length
        })
        return length
      })
    ).then(documentsLength => {
      const total = documentsLength.reduce((acc, val) => acc + val, 0)
      this.logger.debug('Aggregated document size: %d bytes', total, {
        size: total
      })
      return total
    })

    documentsSize.record(totalDocumentsSize)

    // ensure totalDocumentSize is lower than established limit
    if (totalDocumentsSize > this.shareDocumentsSizeLimit) {
      throw ErrorUtils.requestEntityTooLargeException(
        ErrorCode.ValidationHttpContent,
        `Total files size ${totalDocumentsSize} exceeded limit ${this.shareDocumentsSizeLimit}`
      )
    }
  }

  private convertOwner(owner: IOwner): OwnerMessageData {
    const wildcardName = 'Hidden'
    return {
      firstName: wildcardName,
      lastName: wildcardName,
      companyId: owner.companyId
    }
  }
}
