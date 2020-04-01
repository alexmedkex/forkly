import mongoose from 'mongoose'
import DataAccess from '@komgo/data-access'

import { IKeyDocument } from './IKeyDocument'
import { KeySchema } from './KeySchema'

export type KeyModel = mongoose.Model<IKeyDocument>

export const Key: KeyModel = DataAccess.connection.model<IKeyDocument>('Key', KeySchema)
