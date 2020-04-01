import { Schema } from 'mongoose'
import { StateTransitionSchema } from '../StateTransitionSchema'
import { LetterOfCreditStatus } from '@komgo/types'

export const MONGODB_DUPLICATE_ERROR = 11000

export const MONGO_DB_TIMEOUT = 10000

const templateInstanceSchema: Schema = new Schema(
  {
    templateStaticId: {
      type: String,
      required: true
    },
    template: {
      type: {},
      required: true
    },
    dataSchemaId: {
      type: String,
      required: true
    },
    data: {
      type: {},
      required: true
    },
    bindings: {
      type: {},
      required: true
    },
    templateSchemaId: {
      type: String
    },
    version: {
      type: Number
    }
  },
  { minimize: false, _id: false }
)

export const LetterOfCreditSchema: Schema = new Schema(
  {
    version: {
      type: Number
    },
    templateInstance: {
      type: templateInstanceSchema
    },
    stateHistory: [
      {
        type: StateTransitionSchema
      }
    ],
    staticId: {
      type: String
    },
    transactionHash: {
      type: String
    },
    reference: {
      type: String
    },
    contractAddress: {
      type: String
    },
    status: {
      type: String,
      enum: Object.values(LetterOfCreditStatus)
    },
    nonce: {
      type: Number
    },
    hashedData: {
      type: String
    },
    type: {
      type: String,
      enum: ['STANDBY', 'DOCUMENTARY'],
      required: true
    },
    issuingDocumentHash: {
      type: String
    }
  },
  {
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
    },
    toObject: {
      transform: (doc, ret) => {
        delete ret._id
        delete ret.__v
        return ret
      }
    }
  }
)
