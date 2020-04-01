import DataAccess from '@komgo/data-access'
import * as mongoose from 'mongoose'

import { ISessionResponse } from '../../service-layer/responses/session'

import { SessionSchema } from './SessionSchema'

export type SessionModel = mongoose.Model<ISessionResponse>

export const Session: SessionModel = DataAccess.connection.model<ISessionResponse>('session', SessionSchema)
