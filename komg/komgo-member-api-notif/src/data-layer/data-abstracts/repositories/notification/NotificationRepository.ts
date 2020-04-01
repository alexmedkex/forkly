import { Document, Model } from 'mongoose'
import DataAccess from '@komgo/data-access'

import { INotification } from '../../../../service-layer/responses/notification'

import NotificationSchema from './NotificationSchema'

type NotificationModel = INotification & Document

export const NotificationRepo: Model<NotificationModel> = DataAccess.connection.model<NotificationModel>(
  'notification',
  NotificationSchema
)
