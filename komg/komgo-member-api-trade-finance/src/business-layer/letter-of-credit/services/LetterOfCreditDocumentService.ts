import { inject, injectable } from 'inversify'

import { IStandbyLetterOfCredit, ILetterOfCredit, IDataLetterOfCredit } from '@komgo/types'
import { getLogger } from '@komgo/logging'
import { ErrorCode } from '@komgo/error-utilities'

import { TYPES } from '../../../inversify/types'

import { DOCUMENT_PRODUCT } from '../../documents/documentTypes'
import { IDocumentServiceClient } from '../../documents/DocumentServiceClient'
import { IDocumentRequestBuilder } from '../../documents/DocumentRequestBuilder'

import { ContentNotFoundException } from '../../../exceptions'
import { ErrorNames } from '../../../exceptions/utils'

import { ILetterOfCreditDocumentService } from './ILetterOfCreditDocumentService'

@injectable()
export class LetterOfCreditDocumentService implements ILetterOfCreditDocumentService {
  private logger = getLogger('LetterOfCreditDocumentService')
  constructor(
    @inject(TYPES.DocumentServiceClient) private readonly docServiceClient: IDocumentServiceClient,
    @inject(TYPES.DocumentRequestBuilder) private readonly docRequestBuilder: IDocumentRequestBuilder
  ) {}

  async shareDocument(
    letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>,
    documentType: string,
    recipients: string[]
  ) {
    let doc
    try {
      this.logger.info(`Sharing [${documentType}] document`, {
        ...this.getLetterOfCreditMetaData(letterOfCredit)
      })

      doc = await this.getDocument(letterOfCredit, documentType)

      if (!doc) {
        this.logger.error(
          ErrorCode.DatabaseMissingData,
          ErrorNames.LetterOfCreditDocumentToShareNotFound,
          'Could not find document type',
          {
            ...this.getLetterOfCreditMetaData(letterOfCredit),
            documentType
          },
          new Error().stack
        )
        throw new ContentNotFoundException(
          `Can't find document type: [${documentType}] for letterOfCredit: [${letterOfCredit.staticId}]`
        )
      }

      this.logger.info(`Sharing [${documentType}] document`, { documentId: doc.id })

      const documentRequest = this.docRequestBuilder.buildShareableDocumentRequest(letterOfCredit, doc.id, recipients)
      await this.docServiceClient.shareDocument(documentRequest)
    } catch (err) {
      this.logger.info(`Error sharing document`, {
        ...this.getLetterOfCreditMetaData(letterOfCredit),
        documentId: doc ? doc.id : '-',
        documentType,
        error: 'DocumentLetterOfCreditShareFailed',
        errorObject: err
      })

      throw err
    }
  }

  async deleteDocument(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>, documentType: string) {
    const doc = await this.getDocument(letterOfCredit, documentType)

    if (!doc) {
      this.logger.info(`deleteDocument: document not found `, {
        ...this.getLetterOfCreditMetaData(letterOfCredit),
        documentType
      })
      return false
    }

    try {
      await this.docServiceClient.deleteDocument(DOCUMENT_PRODUCT.TradeFinance, doc.id)
      this.logger.info(`deleteDocument: document deleted `, {
        ...this.getLetterOfCreditMetaData(letterOfCredit),
        documentType,
        docId: doc.id
      })
    } catch (err) {
      this.logger.warn(
        ErrorCode.ConnectionMicroservice,
        ErrorNames.LetterOfCreditDeleteDocumentFailed,
        `deleteDocument: failed`,
        { ...this.getLetterOfCreditMetaData(letterOfCredit), documentType },
        new Error().stack
      )
      return false
    }

    return true
  }

  private async getDocument(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>, documentType: string) {
    const context = this.docRequestBuilder.getLetterOfCreditDocumentContext(letterOfCredit)
    const document = await this.docServiceClient.getDocument(context.productId, documentType, context)

    if (!document) {
      this.logger.warn(
        ErrorCode.DatabaseMissingData,
        ErrorNames.SBLCGetDocumentDocumentNotFound,
        `Can't find document`,
        {
          ...this.getLetterOfCreditMetaData(letterOfCredit),
          documentType,
          context
        },
        new Error().stack
      )

      return null
    }

    return document
  }

  private getLetterOfCreditMetaData(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>) {
    return {
      LetterOfCredit: letterOfCredit && letterOfCredit.staticId ? letterOfCredit.staticId : null,
      LetterOfCreditddress: letterOfCredit ? letterOfCredit.contractAddress : null
    }
  }
}
