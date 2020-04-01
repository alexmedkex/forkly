import { inject, injectable } from 'inversify'
import { IStandbyLetterOfCredit } from '@komgo/types'
import { getLogger } from '@komgo/logging'
import { TYPES } from '../../../inversify/types'
import { IDocumentServiceClient } from '../../documents/DocumentServiceClient'
import { IDocumentRequestBuilder } from '../../documents/DocumentRequestBuilder'
import { DOCUMENT_PRODUCT } from '../../documents/documentTypes'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../../exceptions/utils'
import { ContentNotFoundException } from '../../../exceptions'

export interface ISBLCDocumentManager {
  shareDocument(sblc: IStandbyLetterOfCredit, documentType: string, recipients: string[])
  deleteDocument(sblc: IStandbyLetterOfCredit, documentType: string)
}

@injectable()
export class SBLCDocumentManager implements ISBLCDocumentManager {
  private logger = getLogger('SBLCDocumentManager')
  constructor(
    @inject(TYPES.DocumentServiceClient) private readonly docServiceClient: IDocumentServiceClient,
    @inject(TYPES.DocumentRequestBuilder) private readonly docRequestBuilder: IDocumentRequestBuilder
  ) {}

  async shareDocument(sblc: IStandbyLetterOfCredit, documentType: string, recipients: string[]) {
    let doc
    try {
      this.logger.info(`Sharing [${documentType}] document`, {
        ...this.getSBLCMetaData(sblc)
      })

      doc = await this.getDocument(sblc, documentType)

      if (!doc) {
        this.logger.error(
          ErrorCode.DatabaseMissingData,
          ErrorNames.SBLCShareDocumentDocumentNotFound,
          'Could not find document type',
          {
            ...this.getSBLCMetaData(sblc),
            documentType
          },
          new Error().stack
        )
        throw new ContentNotFoundException(`Can't find document type: [${documentType}] for sblc: [${sblc.staticId}]`)
      }

      this.logger.info(`Sharing [${documentType}] document`, { documentId: doc.id })

      const documentRequest = this.docRequestBuilder.getSBLCDocumentToShareRequest(sblc, doc.id, recipients)
      await this.docServiceClient.shareDocument(documentRequest)
    } catch (err) {
      this.logger.info(`Error sharing document`, {
        ...this.getSBLCMetaData(sblc),
        documentId: doc ? doc.id : '-',
        documentType,
        error: 'DocumentShareFailed',
        errorObject: err
      })

      throw err
    }
  }

  async deleteDocument(sblc: IStandbyLetterOfCredit, documentType: string) {
    const doc = await this.getDocument(sblc, documentType)

    if (!doc) {
      this.logger.info(`deleteDocument: document not found `, { ...this.getSBLCMetaData(sblc), documentType })
      return false
    }

    try {
      await this.docServiceClient.deleteDocument(DOCUMENT_PRODUCT.TradeFinance, doc.id)
      this.logger.info(`deleteDocument: document deleted `, {
        ...this.getSBLCMetaData(sblc),
        documentType,
        docId: doc.id
      })
    } catch (err) {
      this.logger.warn(
        ErrorCode.ConnectionMicroservice,
        ErrorNames.SBLCDeleteDocumentFailed,
        `deleteDocument: failed`,
        { ...this.getSBLCMetaData(sblc), documentType },
        new Error().stack
      )
      return false
    }

    return true
  }

  private async getDocument(sblc: IStandbyLetterOfCredit, documentType: string) {
    const context = this.docRequestBuilder.getSBLCDocumentContext(sblc)
    const document = await this.docServiceClient.getDocument(context.productId, documentType, context)

    if (!document) {
      this.logger.warn(
        ErrorCode.DatabaseMissingData,
        ErrorNames.SBLCGetDocumentDocumentNotFound,
        `Can't find document`,
        {
          ...this.getSBLCMetaData(sblc),
          documentType,
          context
        },
        new Error().stack
      )

      return null
    }

    return document
  }

  private getSBLCMetaData(sblc: IStandbyLetterOfCredit) {
    return { SBLC: sblc && sblc.staticId ? sblc.staticId : null, SBLCAddress: sblc ? sblc.contractAddress : null }
  }
}
