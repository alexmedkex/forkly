/**
 * Metric names shared among multiple classes
 */
export enum MetricNames {
  DocumentState = 'documentState',
  DocumentShared = 'documentShared',
  DocumentFeedbackSent = 'documentFeedbackSent',
  DocumentRequestSent = 'documentRequestSent',
  DocumentRequestNoteSent = 'documentRequestNoteSent',
  DocumentsSharedSize = 'documentsSharedSize'
}

/**
 * For metrics that have directions, like sending files that can come to
 * and from current node.
 */
export enum Directions {
  Inbound = 'inbound',
  Outbound = 'outbound'
}

/**
 * To record success/failure result
 */
export enum Result {
  Success = 'success',
  Error = 'error'
}
