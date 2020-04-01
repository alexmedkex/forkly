import { ErrorCode } from '@komgo/error-utilities'
import {
  IShared,
  IProductContext,
  IAppetiteShared,
  IEmailTemplateData,
  IDepositLoan,
  IDepositLoanRequest
} from '@komgo/types'
import * as _ from 'lodash'

import { IAppetiteSharedType, IAppetiteDataShared } from '../../types/IApetiteShared'
import { getEmailsConfigs, IEmailConfig } from '../emails/EmailConfig'
import { getNotificationsConfigs, INotificationConfig } from '../notifications/NotificationConfig'
import { NotificationException } from '../notifications/NotificationException'
import { NotificationOperation } from '../notifications/NotificationOperation'
import { TaskType } from '../tasks/TaskType'

export const isAppetiteShared = (shareableData: IAppetiteSharedType) => {
  if (!shareableData) {
    return false
  }

  if (isIAppetiteSharedType(shareableData)) {
    return shareableData && shareableData.appetite && shareableData.appetite.shared
  }

  if (isIAppetiteDataSharedType(shareableData)) {
    return shareableData && shareableData.data && shareableData.data.appetite && shareableData.data.appetite.shared
  }

  return false
}

const isIAppetiteSharedType = (data: IAppetiteSharedType): data is IAppetiteShared => {
  return (data as IAppetiteShared).appetite !== undefined
}

const isIAppetiteDataSharedType = (data: IAppetiteSharedType): data is IAppetiteDataShared => {
  return (data as IAppetiteDataShared).data !== undefined
}

export const getValueToShare = <T>(data: IShared, valueAccessor: (T) => number) => {
  return data && data.shared ? valueAccessor(data) : undefined
}

export const getNotificationType = (context: IProductContext, notificationOperation: NotificationOperation) => {
  const notificationsConfigs = getNotificationsConfigs()

  const notificationConfig = _.find(
    notificationsConfigs,
    (n: INotificationConfig) =>
      n.context.productId === context.productId &&
      n.context.subProductId === context.subProductId &&
      n.operation === notificationOperation
  ) as INotificationConfig

  if (!notificationConfig) {
    throw new NotificationException(
      'Notification type not found based on provided context',
      ErrorCode.ValidationInvalidOperation
    )
  }

  return notificationConfig.notificationType
}

export const getEmailData = (taskType: TaskType, taskLink: string): IEmailTemplateData => {
  const { subject, taskTitle } = _.find(
    getEmailsConfigs(),
    (data: IEmailConfig) => data.taskType === taskType
  ) as IEmailConfig

  return {
    subject,
    taskTitle,
    taskLink
  }
}

export const getCurrencyAndTenorInfo = (data: IDepositLoan | IDepositLoanRequest) => {
  const periodText = data.periodDuration === 1 ? data.period.toLowerCase().slice(0, -1) : data.period.toLowerCase()
  return `${data.currency} ${data.periodDuration ? data.periodDuration : ''} ${periodText}`.replace('  ', ' ')
}
