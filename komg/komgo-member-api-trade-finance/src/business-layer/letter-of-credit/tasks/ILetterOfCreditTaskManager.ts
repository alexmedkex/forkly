import { ILetterOfCredit, LetterOfCreditTaskType, IDataLetterOfCredit } from '@komgo/types'
import { TRADE_FINANCE_ACTION } from '../../tasks/permissions'
import { IEmailNotificationOptions } from '../../common/types'

export interface ILetterOfCreditTaskManager {
  createTask(
    letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>,
    text: string,
    type: LetterOfCreditTaskType,
    actionType: TRADE_FINANCE_ACTION,
    emailNotificationOptions?: IEmailNotificationOptions
  )
  resolveTask(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>, taskType: LetterOfCreditTaskType, outcome: boolean)
}
