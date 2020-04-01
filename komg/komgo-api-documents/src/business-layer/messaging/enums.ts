export const API_DOCUMENTS_REQUEST_ORIGIN = 'apiDocuments'

export enum EVENT_NAME {
  RequestDocuments = 'KOMGO.DOCUMENTS.RequestDocuments',
  RequestDocumentsNote = 'KOMGO.DOCUMENTS.RequestDocumentsNotes',
  RequestDocumentsDismissedTypes = 'KOMGO.DOCUMENTS.RequestDocumentsDismissedTypes',
  SendDocuments = 'KOMGO.DOCUMENTS.SendDocuments',
  SendDocumentFeedback = 'KOMGO.DOCUMENTS.SendDocumentFeedback',
  // The last part of the routing key should be the same as API_DOCUMENTS_REQUEST_ORIGIN
  BlockchainTransactionError = 'KOMGO.SIGNER.SendTx.Error.apiDocuments',
  BlockchainTransactionSuccess = 'KOMGO.SIGNER.SendTx.Success.apiDocuments',
  // Websockets routing key
  InternalWsAction = 'INTERNAL.WS.action',
  InternalWsFunction = 'INTERNAL.WS.function'
}

export enum TASK_TYPE {
  DocumentRequest = 'KYC.DocRequest',
  DocumentsReview = 'KYC.ReviewDocuments'
}

export enum NOTIFICATION_TYPE {
  DocumentTask = 'Document.task',
  DocumentInfo = 'Document.info',
  DocumentRequestCreated = 'Document.RequestCreated.info',
  TradeFinanceDocumentShare = 'TradeFinance.Document.share'
}

export enum NOTIFICATION_USER {
  ComplianceManagerOrAnalyst = 'complianceManagerOrAnalyst',
  KYCManagerOrAnalyst = 'kycAnalyst',
  CrudAndShare = 'crudAndShare'
}

export enum FEEDBACK_STATUS {
  Pending = 'pending',
  Accepted = 'accepted',
  Rejected = 'rejected'
}

export enum DOCUMENT_STATE_EVENT {
  RegisteredSuccess = '@@docs/SHOW_DOCUMENT_REGISTERED_SUCCESS',
  RegisteredError = '@@docs/SHOW_DOCUMENT_REGISTERED_ERROR'
}
