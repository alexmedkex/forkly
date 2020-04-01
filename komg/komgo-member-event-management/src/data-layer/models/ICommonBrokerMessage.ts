// The status of a message being processed by the event manager
export enum STATUS {
  // message has been decrypted successfully
  Decrypted = 'DECRYPTED',

  // message is currently being processed
  Processing = 'PROCESSING',

  // message has been processed successfully. It will be acked and removed from the queue
  Processed = 'PROCESSED',

  // message failed during processing due to a problem with the message. It will be acked
  // and removed from the queue
  FailedProcessing = 'FAILED_PROCESSING',

  // message failed due to infrastructure error such as being unable to contact a service
  FailedServerError = 'FAILED_SERVER_ERROR'
}

export interface ICommonBrokerMessage {
  status: STATUS
  routingKey: string
  messageProperties: object
  messagePayload: object
  error: string
}
