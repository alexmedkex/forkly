import { tradeFinanceManager } from '@komgo/permissions'
import { IProductContext } from '@komgo/types'

import { PRODUCT_ID, SUB_PRODUCT_ID } from './enums'
import { NotificationOperation } from './NotificationOperation'
import { NotificationType } from './NotificationType'

export interface INotificationConfig {
  context: IProductContext
  operation: NotificationOperation
  notificationType: NotificationType
  actionId: string
}

export const getNotificationsConfigs = (): INotificationConfig[] => {
  return [
    {
      actionId: tradeFinanceManager.canReadRiskCover.action,
      context: {
        productId: PRODUCT_ID.TradeFinance,
        subProductId: SUB_PRODUCT_ID.RiskCover
      },
      operation: NotificationOperation.Disclosed,
      notificationType: NotificationType.DisclosedRiskCover
    },
    {
      actionId: tradeFinanceManager.canCrudBankLine.action,
      context: {
        productId: PRODUCT_ID.TradeFinance,
        subProductId: SUB_PRODUCT_ID.BankLine
      },
      operation: NotificationOperation.Disclosed,
      notificationType: NotificationType.DisclosedBankLine
    },
    {
      actionId: tradeFinanceManager.canReadRiskCover.action,
      context: {
        productId: PRODUCT_ID.TradeFinance,
        subProductId: SUB_PRODUCT_ID.RiskCover
      },
      operation: NotificationOperation.UpdateDisclosed,
      notificationType: NotificationType.UpdateDisclosedRiskCover
    },
    {
      actionId: tradeFinanceManager.canCrudBankLine.action,
      context: {
        productId: PRODUCT_ID.TradeFinance,
        subProductId: SUB_PRODUCT_ID.BankLine
      },
      operation: NotificationOperation.UpdateDisclosed,
      notificationType: NotificationType.UpdateDisclosedBankLine
    },
    {
      actionId: tradeFinanceManager.canReadRiskCover.action,
      context: {
        productId: PRODUCT_ID.TradeFinance,
        subProductId: SUB_PRODUCT_ID.RiskCover
      },
      operation: NotificationOperation.RevokeDisclosed,
      notificationType: NotificationType.RevokeDisclosedRiskCover
    },
    {
      actionId: tradeFinanceManager.canCrudBankLine.action,
      context: {
        productId: PRODUCT_ID.TradeFinance,
        subProductId: SUB_PRODUCT_ID.BankLine
      },
      operation: NotificationOperation.RevokeDisclosed,
      notificationType: NotificationType.RevokeDisclosedBankLine
    },
    {
      actionId: tradeFinanceManager.canReadRiskCover.action,
      context: {
        productId: PRODUCT_ID.TradeFinance,
        subProductId: SUB_PRODUCT_ID.RiskCover
      },
      operation: NotificationOperation.DeclineRequest,
      notificationType: NotificationType.DeclineRequestRiskCover
    },
    {
      actionId: tradeFinanceManager.canCrudBankLine.action,
      context: {
        productId: PRODUCT_ID.TradeFinance,
        subProductId: SUB_PRODUCT_ID.BankLine
      },
      operation: NotificationOperation.DeclineRequest,
      notificationType: NotificationType.DeclineRequestBankLine
    }
  ]
}
