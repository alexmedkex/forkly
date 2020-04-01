import { PRODUCT_ID, NOTIFICATION_TYPE, NOTIFICATION_USER, NOTIFICATION_LEVEL } from '../enums'
import {
  TaskStatus,
  ITaskCreateRequest,
  ITaskUpdateStatusRequest,
  INotificationCreateRequest
  // tslint:disable-next-line:no-submodule-imports
} from '@komgo/notification-publisher/dist/interfaces'

const getCommonNotificationCoverage = (companyId: string, messageData): INotificationCreateRequest => {
  return {
    productId: PRODUCT_ID.Coverage,
    payload: {
      companyId
    },
    context: {
      companyId
    },
    requiredPermission: {
      productId: PRODUCT_ID.Coverage,
      actionId: NOTIFICATION_USER.CoverageManage
    },
    type: NOTIFICATION_TYPE.COUNTERPARTY_INFO,
    level: NOTIFICATION_LEVEL.danger,
    ...messageData
  }
}

export const getCounterpartyReqReceived = (
  requestId: string,
  companyId: string,
  companyName: string
): { task: ITaskCreateRequest; notification: INotificationCreateRequest } => {
  return {
    task: {
      summary: `Counterparty request received from ${companyName}`,
      taskType: NOTIFICATION_TYPE.COUNTERPARTY_TASK,
      status: TaskStatus.ToDo,
      counterpartyStaticId: companyId,
      context: {
        type: 'counterpartyCoverageRequest',
        id: requestId
      },
      requiredPermission: {
        productId: PRODUCT_ID.Coverage,
        actionId: NOTIFICATION_USER.CoverageManage
      }
    },
    notification: getCommonNotificationCoverage(companyId, {
      message: `Counterparty request received from ${companyName}`
    })
  }
}

export const getTaskStatusUpdateRequest = (
  requestId: string,
  status: TaskStatus,
  outcome: boolean
): ITaskUpdateStatusRequest => ({
  status,
  taskType: NOTIFICATION_TYPE.COUNTERPARTY_TASK,
  context: {
    type: 'counterpartyCoverageRequest',
    id: requestId
  },
  outcome
})

export const getCounterpartyReqApproved = (companyId: string, companyName: string): INotificationCreateRequest => {
  return getCommonNotificationCoverage(companyId, {
    message: `${companyName} added to the list of counterparties`
  })
}

export const getCounterpartyReqRejected = (companyId: string, companyName: string): INotificationCreateRequest => {
  return getCommonNotificationCoverage(companyId, {
    message: `Counterparty request rejected by ${companyName}`
  })
}

export const getCounterpartyAutoAdd = (companyId: string, companyName: string): INotificationCreateRequest => {
  return getCommonNotificationCoverage(companyId, {
    message: `Counterparty auto added with trade receipt ${companyName}`,
    type: NOTIFICATION_TYPE.COUNTERPARTY_INFO,
    level: NOTIFICATION_LEVEL.danger
  })
}
