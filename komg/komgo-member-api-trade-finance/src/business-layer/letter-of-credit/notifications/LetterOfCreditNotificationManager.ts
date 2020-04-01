import { injectable, inject } from 'inversify'

import { ILetterOfCredit, LetterOfCreditTaskType, IDataLetterOfCredit } from '@komgo/types'
import { NotificationManager, NotificationLevel, INotificationCreateRequest } from '@komgo/notification-publisher'
import { getLogger } from '@komgo/logging'

import { TYPES } from '../../../inversify'

import { TRADE_FINANCE_ACTION, TRADE_FINANCE_PRODUCT_ID } from '../../tasks/permissions'

import { ILetterOfCreditNotificationManager } from './ILetterOfCreditNotificationManager'

@injectable()
export class LetterOfCreditNotificationManager implements ILetterOfCreditNotificationManager {
  private readonly notificationManager: NotificationManager
  private readonly logger = getLogger('LetterOfCreditNotificationManager')

  constructor(@inject(TYPES.NotificationManagerClient) notificationManager: NotificationManager) {
    this.notificationManager = notificationManager
  }

  buildNotification(
    letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>,
    message: string,
    additionalContext: any,
    type: LetterOfCreditTaskType,
    actionType: TRADE_FINANCE_ACTION,
    level: NotificationLevel = NotificationLevel.info
  ): INotificationCreateRequest {
    this.logger.info('Creating notification for letter of credit', {
      letterOfCredit: letterOfCredit.staticId
    })
    const context = {
      ...this.buildContext(letterOfCredit),
      ...additionalContext
    }

    return {
      context,
      level,
      productId: TRADE_FINANCE_PRODUCT_ID,
      type,
      requiredPermission: {
        productId: TRADE_FINANCE_PRODUCT_ID,
        actionId: actionType
      },
      message
    }
  }

  async createNotification(
    letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>,
    message: string,
    additionalContext: any,
    type: LetterOfCreditTaskType,
    actionType: TRADE_FINANCE_ACTION,
    level: NotificationLevel = NotificationLevel.info
  ) {
    this.logger.info('About to send a notification for letter of credit', {
      letterOfCredit: letterOfCredit.staticId
    })

    await this.notificationManager.createNotification(
      this.buildNotification(letterOfCredit, message, additionalContext, type, actionType, level)
    )
  }

  private buildContext(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>): any {
    // TODO Make common
    return {
      type: 'ILetterOfCredit',
      staticId: letterOfCredit.staticId
    }
  }
}
