import { INotificationCreateRequest, NotificationLevel } from '@komgo/notification-publisher'
import { tradeFinanceManager } from '@komgo/permissions'
import { IDepositLoan, DepositLoanType, IDisclosedDepositLoan } from '@komgo/types'
import { injectable } from 'inversify'
import * as _ from 'lodash'

import { IDepositLoanRequestDocument } from '../../data-layer/models/IDepositLoanRequestDocument'
import { Product } from '../enums/products'
import { getCurrencyAndTenorInfo } from '../utils/utils'

import { PRODUCT_ID, NOTIFICATION_TYPE } from './enums'
import { NotificationOperation } from './NotificationOperation'

@injectable()
export class DepositLoanNotificationFactory {
  private readonly strategies: Array<{
    key: {
      operation: NotificationOperation
      type: DepositLoanType
    }
    builder: (
      operation: NotificationOperation,
      data: IDepositLoan | IDepositLoanRequestDocument,
      financialInstitution: string
    ) => INotificationCreateRequest
  }> = []

  constructor() {
    this.setupStrategies()
  }

  getNotification(
    operation: NotificationOperation,
    data: IDepositLoan | IDepositLoanRequestDocument,
    financialInstitution: string
  ) {
    return this.strategies
      .find(s => s.key.operation === operation && s.key.type === data.type)
      .builder(operation, data, financialInstitution)
  }

  private getDepositLoanNotification(
    operation: NotificationOperation,
    data: IDisclosedDepositLoan,
    financialInstitution: string
  ): INotificationCreateRequest {
    let msg

    if (operation === NotificationOperation.Disclosed) {
      msg = `has added ${
        data.type === DepositLoanType.Deposit ? 'Deposit' : 'Loan'
      } information on ${getCurrencyAndTenorInfo(data)}`
    } else if (
      operation === NotificationOperation.UpdateDisclosed ||
      operation === NotificationOperation.RevokeDisclosed
    ) {
      msg = `has updated ${
        data.type === DepositLoanType.Deposit ? 'Deposit' : 'Loan'
      } information on ${getCurrencyAndTenorInfo(data)}`
    } else if (operation === NotificationOperation.DeclineRequest) {
      msg = ` has declined the request for ${
        data.type === DepositLoanType.Deposit ? 'Deposit' : 'Loan'
      } information on ${getCurrencyAndTenorInfo(data)}`
    }

    return this.getCreditLineCommonNotification(data, operation, {
      message: `${financialInstitution} ${msg}`,
      level: NotificationLevel.info
    })
  }

  private setupStrategies() {
    const notifTypes = [
      NotificationOperation.Disclosed,
      NotificationOperation.UpdateDisclosed,
      NotificationOperation.RevokeDisclosed,
      NotificationOperation.DeclineRequest
    ]

    notifTypes.forEach(operation => {
      this.strategies.push({
        key: {
          operation,
          type: DepositLoanType.Deposit
        },
        builder: this.getDepositLoanNotification.bind(this)
      })
      this.strategies.push({
        key: {
          operation,
          type: DepositLoanType.Loan
        },
        builder: this.getDepositLoanNotification.bind(this)
      })
    })
  }

  private getNotificationContext(data: IDisclosedDepositLoan) {
    return {
      ownerStaticId: data.ownerStaticId,
      type: data.type,
      currency: data.currency,
      period: data.period,
      periodDuration: data.periodDuration
    }
  }

  private getCreditLineCommonNotification(
    data: IDisclosedDepositLoan,
    operation: NotificationOperation,
    messageData
  ): INotificationCreateRequest {
    return {
      productId: PRODUCT_ID.TradeFinance,
      type: NOTIFICATION_TYPE.DepositLoanInfo,
      requiredPermission: this.getNotificationPermission(data),
      context: {
        ...this.getNotificationContext(data),
        operation
      },
      ...messageData
    }
  }

  private getNotificationPermission(data: IDisclosedDepositLoan) {
    return {
      productId: Product.TradeFinance,
      actionId:
        data.type === DepositLoanType.Deposit
          ? tradeFinanceManager.canReadDeposit.action
          : tradeFinanceManager.canReadLoan.action
    }
  }
}
