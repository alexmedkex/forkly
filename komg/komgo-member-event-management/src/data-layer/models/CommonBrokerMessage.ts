import DataAccess from '@komgo/data-access'
import * as mongoose from 'mongoose'

interface ICommonBrokerMessageModel extends mongoose.Document {
  id: string
}

export type CommonBrokerMessageModel = mongoose.Model<ICommonBrokerMessageModel>

export function CommonToInternalMessageModel(schema) {
  return DataAccess.connection.model<CommonBrokerMessageModel>('inbound-common-broker-message', schema)
}
export function InternalToCommonMessageModel(schema) {
  return DataAccess.connection.model<CommonBrokerMessageModel>('outbound-common-broker-message', schema)
}
