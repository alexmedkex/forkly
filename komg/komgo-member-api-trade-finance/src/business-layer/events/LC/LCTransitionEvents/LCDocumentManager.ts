import { IDocumentServiceClient } from '../../../documents/DocumentServiceClient'
import { IDocumentRequestBuilder } from '../../../documents/DocumentRequestBuilder'
import { inject, injectable } from 'inversify'
import { TYPES } from '../../../../inversify/types'
import { ILC } from '../../../../data-layer/models/ILC'
import { getLogger } from '@komgo/logging'
import { DOCUMENT_PRODUCT } from '../../../documents/documentTypes'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../../../exceptions/utils'
import { ContentNotFoundException } from '../../../../exceptions'
import { ICompanyRegistryService } from '../../../../service-layer/ICompanyRegistryService'
import * as _ from 'lodash'

export interface ILCDocumentManager {
  shareDocument(lc: ILC, documentType: string, recipients: string[])
  deleteDocument(lc: ILC, documentType: string)
}

@injectable()
export class LCDocumentManager implements ILCDocumentManager {
  private logger = getLogger('LCDocumentManager')
  constructor(
    @inject(TYPES.DocumentServiceClient) private readonly docServiceClient: IDocumentServiceClient,
    @inject(TYPES.DocumentRequestBuilder) private readonly docRequestBuilder: IDocumentRequestBuilder,
    @inject(TYPES.CompanyRegistryService) private readonly companyRegistryService: ICompanyRegistryService
  ) {}

  async shareDocument(lc: ILC, documentType: string, recipients: string[]) {
    this.logger.info(`Sharing [${documentType}] document`, {
      ...this.getLCMetaData(lc)
    })

    const doc = await this.getDocument(lc, documentType)

    if (!doc) {
      this.logger.error(
        ErrorCode.DatabaseMissingData,
        ErrorNames.LCDocumentManagerDocumentNotFound,
        'Document not found'
      )
      throw new ContentNotFoundException('Document not found')
    }
    try {
      this.logger.info(`Sharing [${documentType}] document`, { documentId: doc.id })
      const toShareWith = await this.filterRecepients(recipients)
      const documentRequest = this.docRequestBuilder.getLCDocumentToShareRequest(lc, doc.id, toShareWith)
      await this.docServiceClient.shareDocument(documentRequest)
    } catch (err) {
      this.logger.error(
        ErrorCode.UnexpectedError,
        ErrorNames.LCDocumentManagerDocumentShareFailed,
        'Error sharing document',
        {
          ...this.getLCMetaData(lc),
          documentId: doc ? doc.id : '-',
          documentType
        }
      )
      throw err
    }
  }

  async deleteDocument(lc: ILC, documentType: string) {
    const doc = await this.getDocument(lc, documentType)

    if (!doc) {
      this.logger.info(`deleteDocument: document not found `, { ...this.getLCMetaData(lc), documentType })
      return false
    }

    await this.docServiceClient.deleteDocument(DOCUMENT_PRODUCT.TradeFinance, doc.id)
    this.logger.info(`deleteDocument: document deleted `, {
      ...this.getLCMetaData(lc),
      documentType,
      docId: doc.id
    })

    return true
  }

  private async getDocument(lc: ILC, documentType: string) {
    const context = this.docRequestBuilder.getLCDocumentContext(lc)
    const document = await this.docServiceClient.getDocument(context.productId, documentType, context)

    if (!document) {
      this.logger.error(
        ErrorCode.DatabaseMissingData,
        ErrorNames.DocumentNotFound,
        `Can't find document`,
        {
          ...this.getLCMetaData(lc),
          documentType,
          context
        },
        new Error().stack
      )

      return null
    }

    return document
  }

  private async filterRecepients(recipients) {
    // have only komgo members as valid recepients
    const companies = await this.companyRegistryService.getMembers(recipients)

    const membersStaticIds = companies.filter(company => company.isMember).map(company => company.staticId)

    const nonMemberStaticIds = _.difference(recipients, membersStaticIds)

    this.logger.info(`Not sharing documents with non members`, {
      nonMemberStaticIds
    })

    return membersStaticIds
  }

  private getLCMetaData(lc: ILC) {
    return { LC: lc && lc._id ? lc._id.toString() : null, LCAddress: lc ? lc.contractAddress : null }
  }
}
