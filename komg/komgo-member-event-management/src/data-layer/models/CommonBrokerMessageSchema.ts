import { Schema } from 'mongoose'

export default function CommonBrokerSchema(writeTimeout) {
  return new Schema(
    {
      status: {
        type: String,
        enum: ['DECRYPTED', 'PROCESSED', 'PROCESSING', 'FAILED_PROCESSING', 'FAILED_SERVER_ERROR'],
        required: true
      },
      routingKey: {
        type: String,
        required: false
      },
      messageProperties: {
        type: Object,
        required: true
      },
      messagePayload: {
        type: Object,
        required: true
      },
      error: {
        type: String,
        required: false
      }
    },
    {
      timestamps: { createdAt: true, updatedAt: false },
      versionKey: false,
      // This is set to add guarantees that the Audit Record gets perisisted
      writeConcern: {
        // This means we require a majority of repica sets to confirm that the Audit Record has been written to the DB
        w: 'majority',
        // This sets jounaling to true which means that it will wait until its written to the DB
        j: true,
        // The time to wait for acknowledgements before returning an error
        wtimeout: writeTimeout
      }
    }
  )
}
