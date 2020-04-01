import DataAccess from '@komgo/data-access'
import mongoose from 'mongoose'

import ActionSchema from './ActionSchema'
import IActionDocument from './IActionDocument'
import { logIndexCreation } from './models-utils'

export type ActionModel = mongoose.Model<IActionDocument>

export const Action: ActionModel = DataAccess.connection.model<IActionDocument>('rfp-actions', ActionSchema)

logIndexCreation(Action)
