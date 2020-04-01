import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { INotificationCreateRequest, NotificationLevel, NotificationManager } from '@komgo/notification-publisher'
import { tradeFinanceManager } from '@komgo/permissions'
import { axiosRetry, exponentialDelay } from '@komgo/retry'
import { IEmailTemplateData, IReceivablesDiscounting, ReplyType } from '@komgo/types'
import * as AxiosError from 'axios-error'
import { inject, injectable } from 'inversify'

import { PRODUCT_ID } from '../../constants'
import { TradeSnapshotDataAgent } from '../../data-layer/data-agents'
import { ErrorName } from '../../ErrorName'
import { TYPES, VALUES } from '../../inversify'
import { NotificationType, UpdateType } from '../types'

import { CompanyRegistryClient } from './CompanyRegistryClient'
import { getSectionName } from './utils'

const NOT_FOUND_ERROR_CODE = 404

/**
 * Client to send notifications.
 */
@injectable()
export class NotificationClient {
  private readonly logger = getLogger('NotificationClient')

  constructor(
    @inject(TYPES.NotificationManager) private readonly notificationManager: NotificationManager,
    @inject(TYPES.TradeSnapshotDataAgent) private readonly tradeSnapshotDataAgent: TradeSnapshotDataAgent,
    @inject(TYPES.CompanyRegistryClient) private readonly companyRegistryClient: CompanyRegistryClient,
    @inject(VALUES.CompanyStaticId) private readonly companyStaticId: string,
    @inject(VALUES.KapsuleUrl) private readonly kapsuleUrl: string,
    private readonly retryDelay = 1000
  ) {}

  /**
   * Creates a notification for update of the RD application
   *
   * @param rd RD updated
   * @param senderStaticId static id of the sender company
   * @param updateType section updated
   * @param actionId Permission necessary to view the notification
   * @param context context of the notification
   * @param createdAt date RD created / updated
   */
  public async createUpdateNotification(
    rd: IReceivablesDiscounting,
    senderStaticId: string,
    updateType: UpdateType,
    actionId: string,
    context: any,
    createdAt: string
  ): Promise<INotificationCreateRequest> {
    let message = `Receivables discounting updated for trade ${rd.tradeReference.sellerEtrmId}`
    try {
      const tradeSnapshot = await this.tradeSnapshotDataAgent.findByTradeSourceId(rd.tradeReference.sourceId)
      const senderName = await this.companyRegistryClient.getCompanyNameFromStaticId(senderStaticId)
      const buyerName = await this.companyRegistryClient.getCompanyNameFromStaticId(tradeSnapshot.trade.buyer)
      message = `${getSectionName(updateType, this.logger)} updated for ${
        rd.tradeReference.sellerEtrmId
      } by ${senderName} on ${buyerName}`
    } catch (error) {
      this.logger.warn(
        ErrorCode.ConnectionMicroservice,
        ErrorName.NotificationError,
        'Failed to get node information',
        {
          error: error.message
        }
      )
    }

    const newContext = { ...context, updateType, senderStaticId, createdAt }
    const notification = await this.createNotification(
      NotificationType.RDUpdate,
      message,
      newContext,
      actionId,
      this.resolveNotificationEmail(`Receivables discounting updated for trade ${rd.tradeReference.sellerEtrmId}`)
    )
    return notification
  }

  /**
   * Creates a notification for update of the RD application
   *
   * @param rd RD updated
   * @param senderStaticId static id of the sender company
   * @param documentType type of document
   * @param actionId Permission necessary to view the notification
   * @param context context of the notification
   */
  public async createDocumentReceivedNotification(
    rd: IReceivablesDiscounting,
    senderStaticId: string,
    documentType: string,
    context: any
  ) {
    let senderName: string
    let actionId: string = tradeFinanceManager.canReadRDRequests.action // default
    try {
      senderName = await this.companyRegistryClient.getCompanyNameFromStaticId(senderStaticId)
      const companyInfo = await this.companyRegistryClient.getCompanyInfoFromStaticId(this.companyStaticId)
      actionId = companyInfo.isFinancialInstitution
        ? tradeFinanceManager.canReadRDRequests.action
        : tradeFinanceManager.canReadRD.action
    } catch (error) {
      this.logger.warn(
        ErrorCode.ConnectionMicroservice,
        ErrorName.NotificationError,
        'Failed to get node information, could not set sender name and action',
        {
          error: error.message
        }
      )
    }
    const docType = documentType || 'Document'
    const sender = senderName || 'Unknown Sender'
    const newContext = { ...context, documentType, senderStaticId, rdId: rd.staticId }
    const notification = this.createNotification(
      NotificationType.DocumentReceived,
      `${docType} received from ${sender} for receivable discounting for Trade ID ${rd.tradeReference.sellerEtrmId}`,
      newContext,
      actionId,
      this.resolveNotificationEmail(`${docType} received for receivable discounting`)
    )
    return notification
  }

  /**
   * Creates a notification for RFP flow
   *
   * @param context Context of the notification
   * @param replyType Reply type
   * @param message Message
   * @param actionId Permission necessary to view the notification
   * @param senderStaticId Sender company static id
   * @throws NotificationSendError if fails to send a notification
   */
  public createRFPNotification(
    context: any,
    replyType: ReplyType,
    message: string,
    actionId: string,
    senderStaticId: string,
    emailMessage: string
  ): INotificationCreateRequest {
    const newContext = { ...context, replyType, senderStaticId }
    return this.createNotification(
      NotificationType.RFPInfo,
      message,
      newContext,
      actionId,
      this.resolveNotificationEmail(emailMessage)
    )
  }

  /**
   * Creates a notification
   *
   * @param notification notification to send
   * @throws NotificationSendError if fails to send a notification
   */
  public async sendNotification(notification: INotificationCreateRequest) {
    try {
      this.logger.info('Sending notification')
      // notifManager has its own version of axios so we can't use axios-retry
      await axiosRetry(async () => this.notificationManager.createNotification(notification), {
        delay: exponentialDelay(this.retryDelay)
      })
    } catch (error) {
      const msg = 'Error calling the Notifications API'
      const axiosError = new AxiosError(msg, error)
      this.logger.error(ErrorCode.ConnectionMicroservice, ErrorName.NotificationError, msg, {
        code: axiosError.message,
        axiosResponse: error.response ? error.response.data : '<none>'
      })

      if (this.roleNotFound(axiosError)) {
        this.logger.error(
          ErrorCode.ConnectionMicroservice,
          ErrorName.NoticationRoleNotFound,
          'Attempted to send notification, role not found',
          { context: notification.context }
        )
        return
      }
    }
  }

  /**
   * Creates a new email object
   *
   * @param taskTitle title of the task
   * @param subject email subject. Default 'Risk Cover / Receivable Discounting'
   */
  public resolveNotificationEmail(
    notificationTitle: string,
    subject: string = 'Risk Cover / Receivable Discounting'
  ): IEmailTemplateData {
    return {
      subject,
      taskTitle: notificationTitle,
      taskLink: this.getNotificationBaseUrl()
    }
  }

  private createNotification(
    notificationType: NotificationType,
    message: string,
    context: any,
    actionId: string,
    emailData?: IEmailTemplateData
  ): INotificationCreateRequest {
    return {
      productId: PRODUCT_ID,
      type: notificationType,
      level: NotificationLevel.info,
      requiredPermission: {
        productId: PRODUCT_ID,
        actionId
      },
      context,
      message,
      ...(emailData ? { emailData } : {})
    }
  }

  private getNotificationBaseUrl() {
    return `${this.kapsuleUrl}/notifications`
  }

  private roleNotFound(axiosError: AxiosError): boolean {
    return axiosError.status && axiosError.response.status === NOT_FOUND_ERROR_CODE
  }
}
