import { SchemaOptions } from 'mongoose'

export const MONGODB_DUPLICATE_ERROR = 11000

export const MONGO_DB_TIMEOUT = 10000

export const DEFAULT_SCHEMA_CONFIG: SchemaOptions = {
  minimize: false,
  timestamps: {
    createdAt: true,
    updatedAt: true
  },
  // This is set to add guarantees that a record is persisted and can survive
  // a failure of on MongoDB node
  writeConcern: {
    // Require a majority of nodes in the cluster to confirm that a record has been stored
    w: 'majority',
    // This sets journaling to true which means confirmation is sent after a record is persisted to disk
    j: true,
    // The time to wait for acknowledgements before returning an error
    wtimeout: MONGO_DB_TIMEOUT
  }
}
