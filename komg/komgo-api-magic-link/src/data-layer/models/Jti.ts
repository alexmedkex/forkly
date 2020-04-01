import DataAccess from '@komgo/data-access'
import * as mongoose from 'mongoose'

import { IJtiResponse } from '../../service-layer/responses/document/IJtiResponse'

import { JtiSchema } from './JtiSchema'

export type JtiModel = mongoose.Model<IJtiResponse>

export const Jti: JtiModel = DataAccess.connection.model<IJtiResponse>('jti', JtiSchema)
