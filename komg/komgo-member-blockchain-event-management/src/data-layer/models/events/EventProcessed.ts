import DataAccess from '@komgo/data-access'
import { getLogger } from '@komgo/logging'
import mongoose from 'mongoose'

import { Model } from '../constants'
import { logIndexCreation } from '../utils/logIndexCreation'

import { EventProcessedSchema } from './EventProcessedSchema'
import { IEventProcessedDocument } from './IEventProcessedDocument'

export type EventProcessedModel = mongoose.Model<IEventProcessedDocument>

export const EventProcessed: EventProcessedModel = DataAccess.connection.model<IEventProcessedDocument>(
  Model.EventProcessed,
  EventProcessedSchema
)

logIndexCreation(getLogger('EventProcessedModel'), EventProcessed)
