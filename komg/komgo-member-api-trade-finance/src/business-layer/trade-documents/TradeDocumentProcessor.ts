import { injectable, inject } from 'inversify'
import { getLogger } from '@komgo/logging'

import { TYPES } from '../../inversify/types'
import { IFile } from '../types/IFile'

import { IDocumentProcessor } from '../documents/IDocumentProcessor'
import { IDocumentEventData } from '../documents/IDocumentEventData'
import { IDocumentServiceClient } from '../documents/DocumentServiceClient'

import { IDocumentRequestBuilder } from '../documents/DocumentRequestBuilder'
import { ITradeCargoClient } from '../trade-cargo/ITradeCargoClient'

import { ILCCacheDataAgent } from '../../data-layer/data-agents'
import { getReceivedTradeDocumentNotification } from '../messaging/notifications/notificationBuilder'
import { NotificationManager } from '@komgo/notification-publisher'

import * as path from 'path'
import * as mime from 'mime-types'
import { DOCUMENT_PRODUCT } from '../documents/documentTypes'
import { IDocumentType } from '../documents/IDocumentType'
import { IRegisterDocument } from '../documents/IRegisterDocument'
import ILCDocument from '../types/ILCDocument'
import InvalidMessageException from '../../exceptions/InvalidMessageException'
import { CONFIG } from '../../inversify/config'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../exceptions/utils'
import { ITrade } from '@komgo/types'

@injectable()
export class TradeDocumentProcessor implements IDocumentProcessor {
  protected logger = getLogger('TradeDocumentProcessor')
  constructor(
    @inject(CONFIG.CompanyStaticId) protected readonly companyId: string,
    @inject(TYPES.DocumentServiceClient) protected readonly documentClient: IDocumentServiceClient,
    @inject(TYPES.DocumentRequestBuilder) protected readonly documentRequestBuilder: IDocumentRequestBuilder,
    @inject(TYPES.TradeCargoClient) protected readonly tradeCargoClient: ITradeCargoClient,
    @inject(TYPES.LCCacheDataAgent) protected readonly lcCache: ILCCacheDataAgent,
    @inject(TYPES.NotificationManagerClient) protected readonly notificationManager: NotificationManager
  ) {}

  async processEvent(message: IDocumentEventData): Promise<boolean> {
    const trade = await this.getTrade(message)

    const documentType = await this.getDocumentType(message.documentType)

    await this.validateEvent(message, trade, documentType)

    let document: IRegisterDocument

    if (message.lcId) {
      const lc = await this.lcCache.getLC({ reference: message.lcId })
      if (
        !lc.tradeAndCargoSnapshot ||
        !lc.tradeAndCargoSnapshot.trade ||
        lc.tradeAndCargoSnapshot.trade.vaktId !== message.vaktId
      ) {
        this.logError(
          'TradeAndCargoSnapshot not found',
          ErrorNames.TradeDocumentProcessorTradeCargoNotFound,
          message,
          'TradeAndCargoSnapshotNotFound'
        )
        throw new InvalidMessageException(`TradeAndCargoSnapshot not found for lcId: ${message.lcId}`)
      }
      const lcDocument: ILCDocument = {
        parcelId: message.parcelId,
        name: path.basename(message.filename, path.extname(message.filename)),
        categoryId: documentType.categoryId,
        typeId: documentType.typeId
      }
      document = this.documentRequestBuilder.getLCDocumentRequest(lc, lcDocument, this.createFile(message), null)
    } else {
      document = this.documentRequestBuilder.getTradeDocumentRequest(
        message,
        documentType,
        this.companyId,
        this.createFile(message)
      )
    }

    await this.documentClient.registerDocument(document)

    try {
      const tradeEtrmId = this.companyId === trade.buyer ? trade.buyerEtrmId : trade.sellerEtrmId
      await this.notificationManager.createNotification(getReceivedTradeDocumentNotification(tradeEtrmId, trade._id))
    } catch (error) {
      this.logError(
        `Failed to send notification for Trade: ${message.vaktId}`,
        ErrorNames.TradeDocumentProcessorNotificationFailed,
        message,
        'TradeSendNotificationFailed'
      )
    }
    return Promise.resolve(true)
  }

  protected async validateEvent(message: IDocumentEventData, trade: ITrade, documentType): Promise<void> {
    if (!documentType) {
      this.logError(
        'Document not found with vaktTypeId',
        ErrorNames.TradeDocumentProcessorDocumentNotFound,
        message,
        'VaktDocumentNotFound'
      )
      throw new InvalidMessageException(`Can't find document with vaktTypeId: [${message.documentType}]`)
    }

    if (!trade) {
      this.logError(
        'Failed to process commercial document',
        ErrorNames.TradeDocumentProcessorCommercialDocumentFailed,
        message,
        'TradeNotFound'
      )
      throw new InvalidMessageException(`Trade ${message.vaktId} not found, error processing commercial document`)
    }

    if (trade.buyer !== this.companyId && trade.seller !== this.companyId) {
      this.logError(
        'Company is not party (Applicant/Beneficiary) in trade',
        ErrorNames.TradeDocumentProcessorCompanyNotParty,
        message,
        'CompanyNotPartyInTrade'
      )
      throw new InvalidMessageException(`Company is not party (Applicant/Beneficiary) in trade ${message.vaktId}.`)
    }

    if (message.parcelId && !(await this.validateParcel(trade._id, message.parcelId))) {
      this.logError(
        'Parcel not found for commercial document',
        ErrorNames.TradeDocumentProcessorParcelNotFound,
        message,
        'ParcelNotFound'
      )
      throw new InvalidMessageException(
        `Parcel ${message.parcelId} not found, error processing commercial document vaktId: ${message.vaktId}`
      )
    }

    if (message.lcId) {
      const lc = await this.lcCache.getLC({ reference: message.lcId })
      if (!lc) {
        this.logError(
          'LC not found, error processing document',
          ErrorNames.TradeDocumentProcessorLCNotFound,
          message,
          'LCNotFound'
        )
        throw new InvalidMessageException(
          `LC ${message.lcId} not found, error processing document vaktId: ${message.vaktId}`
        )
      }
    }

    this.logger.info(`VAKT message is valid`, {
      ...message
    })
  }

  protected async getDocumentType(vaktTypeId: string): Promise<IDocumentType> {
    const documentTypes = await this.documentClient.getDocumentTypes(DOCUMENT_PRODUCT.TradeFinance)

    const type = documentTypes ? documentTypes.find(t => t.vaktId === vaktTypeId) : null

    if (!type) {
      return null
    }

    return {
      typeId: type.id,
      categoryId: type.category.id,
      productId: type.product.id
    }
  }

  private createFile(message: IDocumentEventData): IFile {
    const extension = path.extname(message.filename)
    return {
      originalname: message.filename,
      buffer: Buffer.from(message.contents, 'base64'),
      mimetype: mime.lookup(extension),
      ext: extension
    }
  }

  private async getTrade(message: IDocumentEventData): Promise<ITrade> {
    return this.tradeCargoClient.getTradeByVakt(message.vaktId)
  }

  private async validateParcel(tradeId: string, parcelId: string): Promise<boolean> {
    const cargo = await this.tradeCargoClient.getCargoByTrade(tradeId)
    return cargo && cargo.parcels && cargo.parcels.some(y => y.id === parcelId)
  }

  private logError(logMessage: string, errorName: string, message: IDocumentEventData, errorCode?: string) {
    delete message.contents
    delete message.metadata

    this.logger.error(
      ErrorCode.ValidationInvalidOperation,
      errorName,
      logMessage,
      {
        ...message,
        error: errorCode
      },
      new Error().stack
    )
  }
}
