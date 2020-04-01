import { injectable, inject } from 'inversify'
import { TYPES } from '../../inversify/types'
import { IDocumentServiceClient } from '../documents/DocumentServiceClient'
import { NotificationManager, INotificationCreateRequest } from '@komgo/notification-publisher'
import { IDocumentRequestBuilder } from '../documents/DocumentRequestBuilder'
import { IDocumentEventData } from '../documents/IDocumentEventData'
import { ITradeCargoClient } from '../trade-cargo/ITradeCargoClient'
import { TradeDocumentProcessor } from './TradeDocumentProcessor'
import { DOCUMENT_PRODUCT } from '../documents/documentTypes'
import { ILCCacheDataAgent } from '../../data-layer/data-agents'
import { getDeletedTradeDocumentNotification } from '../messaging/notifications/notificationBuilder'
import { IDocumentType } from '../documents/IDocumentType'
import { CONFIG } from '../../inversify/config'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../exceptions/utils'
import { ITrade } from '@komgo/types'

@injectable()
export class DiscardTradeDocumentProcessor extends TradeDocumentProcessor {
  constructor(
    @inject(CONFIG.CompanyStaticId) companyId: string,
    @inject(TYPES.DocumentServiceClient) documentClient: IDocumentServiceClient,
    @inject(TYPES.DocumentRequestBuilder) documentRequestBuilder: IDocumentRequestBuilder,
    @inject(TYPES.TradeCargoClient) tradeCargoClient: ITradeCargoClient,
    @inject(TYPES.LCCacheDataAgent) lcCache: ILCCacheDataAgent,
    @inject(TYPES.NotificationManagerClient) notificationManager: NotificationManager
  ) {
    super(companyId, documentClient, documentRequestBuilder, tradeCargoClient, lcCache, notificationManager)
  }

  async processEvent(message: IDocumentEventData): Promise<boolean> {
    const trade: ITrade = await this.tradeCargoClient.getTradeByVakt(message.vaktId)
    const documentType: IDocumentType = await this.getDocumentType(message.documentType)

    await this.validateEvent(message, trade, documentType)

    const productId = DOCUMENT_PRODUCT.TradeFinance

    const context = await this.documentRequestBuilder.getTradeDocumentContext(message.vaktId)
    const document = await this.documentClient.getDocument(productId, documentType.typeId, context)
    if (!document) {
      this.logger.error(
        ErrorCode.DatabaseMissingData,
        ErrorNames.DiscardTradeDocumentProcessorDocumentNotFound,
        {
          productId,
          typeId: documentType.typeId,
          context
        },
        new Error().stack
      )
      return false
    }

    const deletedDocument = await this.documentClient.deleteDocument(productId, document.id)
    if (!deletedDocument) {
      this.logger.error(
        ErrorCode.ConnectionMicroservice,
        ErrorNames.DiscardTradeDocumentProcessorDeleteDocumentFailed,
        {
          productId,
          typeId: document.typeId
        },
        new Error().stack
      )

      return false
    }

    try {
      const tradeEtrmId = this.companyId === trade.buyer ? trade.buyerEtrmId : trade.sellerEtrmId
      const deleteNotification: INotificationCreateRequest = getDeletedTradeDocumentNotification(
        tradeEtrmId,
        document.name,
        trade._id
      )
      await this.notificationManager.createNotification(deleteNotification)
    } catch (notifError) {
      this.logger.error(
        ErrorCode.ConnectionMicroservice,
        ErrorNames.DicardedDocumentCreateNotificationFailed,
        'Failed to create notification for discarded document',
        new Error().stack
      )
    }

    return true
  }
}
