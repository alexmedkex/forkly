import mongoose from 'mongoose'
import { INonce } from './INonce'
import { NonceSchema } from './NonceSchema'
import DataAccess from '@komgo/data-access'

export type NonceModel = mongoose.Model<INonce>

export const Nonce: NonceModel = DataAccess.connection.model<INonce>('Nonce', NonceSchema)
