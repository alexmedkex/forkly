import 'reflect-metadata'
import createMockInstance from 'jest-create-mock-instance'

import { NotificationManager, NotificationLevel } from '@komgo/notification-publisher'
import { ILetterOfCredit, LetterOfCreditTaskType, buildFakeLetterOfCredit, IDataLetterOfCredit } from '@komgo/types'

import { TRADE_FINANCE_ACTION, TRADE_FINANCE_PRODUCT_ID } from '../../tasks/permissions'

import { LetterOfCreditNotificationManager } from './LetterOfCreditNotificationManager'
import { ILetterOfCreditNotificationManager } from './ILetterOfCreditNotificationManager'

describe('LetterOfCreditNotificationManager', () => {
  let mockNotificationManager: jest.Mocked<NotificationManager>
  let letterOfCreditNotificationManager: ILetterOfCreditNotificationManager
  let letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>

  beforeAll(() => {
    mockNotificationManager = createMockInstance(NotificationManager)
    letterOfCredit = buildFakeLetterOfCredit()
    letterOfCreditNotificationManager = new LetterOfCreditNotificationManager(mockNotificationManager)
  })

  describe('createNotification', () => {
    it('should create a notification', async () => {
      const message = 'Message'
      const additionalContext = {}
      const letterOfCreditTaskType = LetterOfCreditTaskType.ReviewRequested
      const tradeFinanceAction = TRADE_FINANCE_ACTION.ReviewLC
      const expectedContext = {
        type: 'ILetterOfCredit',
        staticId: letterOfCredit.staticId
      }

      await letterOfCreditNotificationManager.createNotification(
        letterOfCredit,
        message,
        additionalContext,
        letterOfCreditTaskType,
        tradeFinanceAction
      )

      expect(mockNotificationManager.createNotification).toHaveBeenCalled()
      expect(mockNotificationManager.createNotification).toHaveBeenCalledTimes(1)
      expect(mockNotificationManager.createNotification).toHaveBeenCalledWith({
        context: expectedContext,
        level: NotificationLevel.info,
        productId: TRADE_FINANCE_PRODUCT_ID,
        type: letterOfCreditTaskType,
        requiredPermission: {
          productId: TRADE_FINANCE_PRODUCT_ID,
          actionId: tradeFinanceAction
        },
        message
      })
    })
  })
})
