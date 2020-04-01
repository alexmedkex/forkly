import { DOCUMENT_PRODUCT } from '../../documents/documentTypes'
import { NOTIFICATION_TYPE, NOTIFICATION_USER } from './enums'
import { INotificationCreateRequest, NotificationLevel } from '@komgo/notification-publisher'
import { ILC } from '../../../data-layer/models/ILC'
import { COMPANY_LC_ROLE } from '../../CompanyRole'
import { TRADE_FINANCE_ACTION } from '../../tasks/permissions'
import { getCompanyLCRole } from '../../util/getCompanyLCRole'
import { LC_STATE } from '../../events/LC/LCStates'

const permissionsPerResponsability = {
  [COMPANY_LC_ROLE.Applicant]: TRADE_FINANCE_ACTION.ManageLCRequest,
  [COMPANY_LC_ROLE.IssuingBank]: TRADE_FINANCE_ACTION.ReviewLCApplication,
  [COMPANY_LC_ROLE.AdvisingBank]: TRADE_FINANCE_ACTION.ReviewIssuedLC,
  [COMPANY_LC_ROLE.Beneficiary]: TRADE_FINANCE_ACTION.ReviewIssuedLC
}

export const getReceivedTradeDocumentNotification = (etrmId: string, tradeId?: string): INotificationCreateRequest => {
  return getCommonNotificationTradeDocuments(tradeId, {
    message: `Received trade document for trade: ${etrmId}`,
    level: NotificationLevel.info
  })
}

export const getTimerHalfwayNotification = (
  lc: ILC,
  currentCompanyRole: COMPANY_LC_ROLE,
  applicant: string
): INotificationCreateRequest => {
  return getCommonTimerNotification(lc, currentCompanyRole, {
    message: `LC ${lc.reference} Issuance Request from ${applicant} has reached its halfway`,
    level: currentCompanyRole === COMPANY_LC_ROLE.Applicant ? NotificationLevel.info : NotificationLevel.danger
  })
}

export const getTimerExpiredNotification = (
  lc: ILC,
  currentCompanyRole: COMPANY_LC_ROLE
): INotificationCreateRequest => {
  return getCommonTimerNotification(lc, currentCompanyRole, {
    message: `LC ${lc.reference} timer has expired`,
    level: NotificationLevel.info
  })
}

export const getDeletedTradeDocumentNotification = (
  etrmId: string,
  fileName: string,
  tradeId?: string
): INotificationCreateRequest => {
  return getCommonNotificationTradeDocuments(tradeId, {
    message: `Discarded trade document: ${fileName} for trade: ${etrmId}`,
    level: NotificationLevel.info
  })
}

export const getLCStateUpdateNotification = (
  lc: ILC,
  status: LC_STATE,
  currentCompanyRole: COMPANY_LC_ROLE,
  performerName: string
): INotificationCreateRequest => {
  return {
    productId: DOCUMENT_PRODUCT.TradeFinance,
    type: NOTIFICATION_TYPE.LCInfo,
    requiredPermission: {
      productId: DOCUMENT_PRODUCT.TradeFinance,
      actionId: permissionsPerResponsability[currentCompanyRole]
    },
    context: {
      lcid: lc._id
    },
    message: getLCStatusChangeMessage(lc, status, performerName),
    level: NotificationLevel.info
  }
}

export const getCommonTimerNotification = (
  lc: ILC,
  currentCompanyRole: COMPANY_LC_ROLE,
  messageData
): INotificationCreateRequest => {
  return {
    productId: DOCUMENT_PRODUCT.TradeFinance,
    type: NOTIFICATION_TYPE.LCInfo,
    requiredPermission: {
      productId: DOCUMENT_PRODUCT.TradeFinance,
      actionId: permissionsPerResponsability[currentCompanyRole]
    },
    context: {
      lcid: lc._id
    },
    ...messageData
  }
}

const getCommonNotificationTradeDocuments = (tradeId: string, messageData): INotificationCreateRequest => {
  return {
    productId: DOCUMENT_PRODUCT.TradeFinance,
    type: NOTIFICATION_TYPE.LCTask,
    requiredPermission: {
      productId: DOCUMENT_PRODUCT.TradeFinance,
      actionId: NOTIFICATION_USER.ManageLCRequest
    },
    context: {
      id: tradeId
    },
    ...messageData
  }
}

const getLCStatusChangeMessage = (lc: ILC, status: LC_STATE, performerName: string) => {
  if (status === LC_STATE.ISSUED_LC_REJECTED) {
    return `Issued LC ${lc.reference} has been rejected by ${performerName}`
  }

  if (status === LC_STATE.REQUEST_REJECTED) {
    return `LC ${lc.reference} request has been rejected by ${performerName}`
  }

  return `LC ${lc.reference} has been ${status} by ${performerName}`
}
