import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { IDocumentReceivedMessage } from '@komgo/messaging-types'
import { IReceivablesDiscounting } from '@komgo/types'
import { injectable, inject } from 'inversify'

import { SubProductId } from '../../../constants'
import { ReceivablesDiscountingDataAgent } from '../../../data-layer/data-agents'
import { ErrorName } from '../../../ErrorName'
import { TYPES } from '../../../inversify'
import { IDocumentReceived } from '../../../types'
import { NotificationClient } from '../../microservice-clients'

@injectable()
export class DocumentReceivedUseCase {
  private readonly logger = getLogger('DocumentReceivedUseCase')
  constructor(
    @inject(TYPES.NotificationClient) private readonly notificationClient: NotificationClient,
    @inject(TYPES.ReceivablesDiscountingDataAgent) private readonly rdDataAgent: ReceivablesDiscountingDataAgent
  ) {}

  async execute(content: IDocumentReceivedMessage): Promise<void> {
    for (const doc of content.documents as IDocumentReceived[]) {
      const rd = await this.getRd(doc)
      if (rd) {
        await this.notifyDocumentReceived(rd, doc, content)
      } else {
        this.logger.warn(
          ErrorCode.DatabaseInvalidData,
          ErrorName.DocumentReceivedNotificationFailed,
          'Failed to find the RD Application associated with this document',
          { doc, senderStaticId: content.senderStaticId }
        )
      }
    }
    this.logger.info('Finished processing message content')
  }

  private async getRd(doc: IDocumentReceived) {
    if (doc.context && doc.context.subProductId === SubProductId.ReceivableDiscounting) {
      return this.rdDataAgent.findByStaticId(doc.context.rdId)
    }
    if (doc.context && doc.context.subProductId === SubProductId.Trade) {
      return this.rdDataAgent.findByTradeSourceId(doc.context.vaktId)
    }
    return null
  }

  private async notifyDocumentReceived(
    rd: IReceivablesDiscounting,
    document: IDocumentReceived,
    content: IDocumentReceivedMessage
  ) {
    const notification = await this.notificationClient.createDocumentReceivedNotification(
      rd,
      content.senderStaticId,
      document.typeName,
      document.context
    )
    await this.notificationClient.sendNotification(notification)
  }
}
