import DataAccess from '@komgo/data-access'
import mongoose from 'mongoose'

import { AddrIndexSchema } from './AddrIndexSchema'
import { IAddrIndexDocument } from './IAddrIndexDocument'

interface IAddrIndexDocumentModel extends IAddrIndexDocument, mongoose.Document {
  id: string
}

export type AddrIndexDocumentModel = mongoose.Model<IAddrIndexDocumentModel>

export const AddrIndex: AddrIndexDocumentModel = DataAccess.connection.model<IAddrIndexDocumentModel>(
  'AddrIndex',
  AddrIndexSchema
)
