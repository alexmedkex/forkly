import Mongoose from 'mongoose'

export interface IRFPRequest {
  rfpId: string
  rdId: string
  senderStaticId?: string
  participantStaticIds: string[]
  createdAt?: Date
  updatedAt?: Date
}

export interface IRFPRequestDocument extends Mongoose.Document, IRFPRequest {}
