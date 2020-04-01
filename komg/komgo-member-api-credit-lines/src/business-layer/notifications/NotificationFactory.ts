import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { INotificationCreateRequest, NotificationLevel } from '@komgo/notification-publisher'
import { ICreditLineRequest, IProductContext, IDisclosedDepositLoan } from '@komgo/types'
import { injectable } from 'inversify'
import * as _ from 'lodash'

import { IDisclosedCreditLine } from '../../data-layer/models/IDisclosedCreditLine'
import { ErrorName } from '../../utils/Constants'

import { PRODUCT_ID, NOTIFICATION_TYPE } from './enums'
import { getNotificationsConfigs, INotificationConfig } from './NotificationConfig'
import { NotificationException } from './NotificationException'
import { NotificationType } from './NotificationType'

export interface INotificationFactory {
  getNotification(
    type: NotificationType,
    data: ICreditLineRequest | IDisclosedCreditLine,
    financialInstitution: string,
    company: string
  )
}

@injectable()
export class NotificationFactory implements INotificationFactory {
  private readonly logger = getLogger('NotificationFactory')
  private notificationConfig: INotificationConfig[]
  private readonly strategies = new Map<
    NotificationType,
    (
      type: NotificationType,
      data: ICreditLineRequest | IDisclosedCreditLine,
      financialInstitution: string,
      company: string
    ) => INotificationCreateRequest
  >()

  constructor() {
    this.notificationConfig = getNotificationsConfigs()
    this.setupStrategies()
  }

  getNotification(
    type: NotificationType,
    data: ICreditLineRequest | IDisclosedCreditLine,
    financialInstitution: string,
    company: string
  ) {
    return this.strategies.get(type)(type, data, financialInstitution, company)
  }

  private getCreditLineNotification(
    type: NotificationType,
    data: IDisclosedCreditLine,
    financialInstitution: string,
    company: string
  ): INotificationCreateRequest {
    let msg
    switch (type) {
      case NotificationType.DisclosedRiskCover:
        msg = 'has added risk cover information on'
        break
      case NotificationType.UpdateDisclosedRiskCover:
        msg = 'has updated risk cover information on'
        break
      case NotificationType.RevokeDisclosedRiskCover:
        msg = 'has updated risk cover information on'
        break
      case NotificationType.DisclosedBankLine:
        msg = 'has added bank lines information on'
        break
      case NotificationType.UpdateDisclosedBankLine:
        msg = 'has updated bank lines information on'
        break
      case NotificationType.RevokeDisclosedBankLine:
        msg = 'has updated bank lines information on'
        break
    }

    return this.getCreditLineCommonNotification(data, {
      message: `${financialInstitution} ${msg} ${company}`,
      level: NotificationLevel.info
    })
  }

  private getDeclineRequestNotification(
    type: NotificationType,
    data: ICreditLineRequest,
    financialInstitution: string,
    company: string
  ): INotificationCreateRequest {
    let msg = ''
    switch (type) {
      case NotificationType.DeclineRequestRiskCover:
        msg = 'has declined the request for risk cover information on'
        break
      case NotificationType.DeclineRequestBankLine:
        msg = 'has declined the request for bank lines information on'
    }
    return this.getCreditLineRequestCommonNotification(data, {
      message: `${financialInstitution} ${msg} ${company}`,
      level: NotificationLevel.info
    })
  }

  private setupStrategies() {
    const notiTypes = [
      NotificationType.DisclosedRiskCover,
      NotificationType.DisclosedBankLine,
      NotificationType.UpdateDisclosedRiskCover,
      NotificationType.UpdateDisclosedBankLine,
      NotificationType.RevokeDisclosedRiskCover,
      NotificationType.RevokeDisclosedBankLine
    ]

    notiTypes.forEach(type => this.strategies.set(type, this.getCreditLineNotification.bind(this)))

    const reqNotifTypes = [NotificationType.DeclineRequestRiskCover, NotificationType.DeclineRequestBankLine]
    reqNotifTypes.forEach(type => this.strategies.set(type, this.getDeclineRequestNotification.bind(this)))
  }

  private getCreditLineNotificationContext(data: IDisclosedCreditLine) {
    return {
      disclosedCreditLineId: data.staticId,
      creditLineOwnerStaticId: data.ownerStaticId,
      creditLineCounterpartyStaticId: data.counterpartyStaticId,
      productId: data.context.productId,
      subProductId: data.context.subProductId
    }
  }

  private getCreditLineCommonNotification(data: IDisclosedCreditLine, messageData): INotificationCreateRequest {
    return {
      productId: PRODUCT_ID.TradeFinance,
      type: NOTIFICATION_TYPE.CLInfo,
      requiredPermission: {
        ...this.getNotificationPermission(data.context)
      },
      context: {
        ...this.getCreditLineNotificationContext(data)
      },
      ...messageData
    }
  }

  private getCreditLineRequestCommonNotification(data: ICreditLineRequest, messageData): INotificationCreateRequest {
    return {
      productId: PRODUCT_ID.TradeFinance,
      type: NOTIFICATION_TYPE.CLInfo,
      requiredPermission: {
        ...this.getNotificationPermission(data.context)
      },
      context: {
        ...data.context
      },
      ...messageData
    }
  }

  private getNotificationPermission(context: IProductContext) {
    const notificationConfig = _.find(
      this.notificationConfig,
      (n: INotificationConfig) =>
        n.context.productId === PRODUCT_ID.TradeFinance && n.context.subProductId === context.subProductId
    ) as INotificationConfig

    if (!notificationConfig) {
      this.logger.error(ErrorCode.ValidationInvalidOperation, ErrorName.InvalidNotificationContext, {
        context
      })
      throw new NotificationException(
        'Notification type not found based on provided context',
        ErrorCode.ValidationInvalidOperation
      )
    }

    return {
      productId: PRODUCT_ID.TradeFinance,
      actionId: notificationConfig.actionId
    }
  }
}
