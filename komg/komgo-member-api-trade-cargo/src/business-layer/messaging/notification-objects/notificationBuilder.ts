import { PRODUCT_ID, NOTIFICATION_TYPE, NOTIFICATION_USER, NOTIFICATION_LEVEL } from '../enums'
// tslint:disable-next-line:no-submodule-imports
import { INotificationCreateRequest } from '@komgo/notification-publisher'

export const getCreatedTradeNotification = (vaktId: string, etrmId: string, id: any): INotificationCreateRequest => {
  return getCommonNotificationTradeCargo(vaktId, id, {
    message: `New trade ${etrmId} is available for financing`,
    level: NOTIFICATION_LEVEL.warning
  })
}

export const getUpdatedTradeNotification = (vaktId: string, etrmId: string, id: any): INotificationCreateRequest => {
  return getCommonNotificationTradeCargo(vaktId, id, {
    message: `Updated trade data for trade ${etrmId}`,
    level: NOTIFICATION_LEVEL.info
  })
}

export const getCreatedCargoNotification = (vaktId: string, etrmId: string, id: any): INotificationCreateRequest => {
  return resolveNotification(
    id,
    getCommonNotificationTradeCargo(vaktId, id, {
      message: id ? `New cargo movements data received for trade ${etrmId}` : 'New cargo data received',
      level: NOTIFICATION_LEVEL.info
    })
  )
}

export const getUpdatedCargoNotification = (vaktId: string, etrmId: string, id: any): INotificationCreateRequest => {
  return resolveNotification(
    id,
    getCommonNotificationTradeCargo(vaktId, id, {
      message: id ? `Updated cargo movements data received for trade ${etrmId}` : 'Update for cargo data received',
      level: NOTIFICATION_LEVEL.info
    })
  )
}

const getCommonNotificationTradeCargo = (vaktId: string, id: any, messageData): INotificationCreateRequest => {
  return {
    productId: PRODUCT_ID.TradeFinance,
    type: NOTIFICATION_TYPE.LCTask,
    requiredPermission: {
      productId: PRODUCT_ID.TradeFinance,
      actionId: NOTIFICATION_USER.ManageTrades
    },
    context: {
      vaktId,
      id
    },
    ...messageData
  }
}

const resolveNotification = (id: string, notification: INotificationCreateRequest): INotificationCreateRequest => {
  if (!id) {
    notification.context.id = null
  }
  return notification
}
