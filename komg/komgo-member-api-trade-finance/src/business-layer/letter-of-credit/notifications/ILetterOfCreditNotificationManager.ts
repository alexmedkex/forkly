import { ILetterOfCredit, LetterOfCreditTaskType, IDataLetterOfCredit } from '@komgo/types'
import { NotificationLevel, INotificationCreateRequest } from '@komgo/notification-publisher'

import { TRADE_FINANCE_ACTION } from '../../tasks/permissions'

export interface ILetterOfCreditNotificationManager {
  createNotification(
    lc: ILetterOfCredit<IDataLetterOfCredit>,
    message: string,
    additionalContext: any,
    type: LetterOfCreditTaskType,
    actionType: TRADE_FINANCE_ACTION,
    level?: NotificationLevel
  )
  buildNotification(
    letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>,
    message: string,
    additionalContext: any,
    type: LetterOfCreditTaskType,
    actionType: TRADE_FINANCE_ACTION,
    level?: NotificationLevel
  ): INotificationCreateRequest
}
