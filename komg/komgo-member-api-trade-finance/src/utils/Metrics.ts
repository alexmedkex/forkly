export enum LCAmendmentControllerEndpoints {
  Create = 'create',
  Approve = 'approve',
  Reject = 'reject',
  Get = 'get'
}

export enum LCControllerEndpoints {
  GetLCDocument = 'getLCDocument',
  GetLCDocumentContent = 'getLCDocumentContent',
  IssueLC = 'issueLC',
  RequestReject = 'requestReject',
  Advise = 'advise',
  Acknowledge = 'acknowledge',
  RejectBeneficiary = 'rejectBeneficiary',
  RejectAdvising = 'rejectAdvising',
  CreateLC = 'createLC',
  GetLC = 'getLC',
  GetLCDocuments = 'getLCDocuments',
  GetLCs = 'getLCs'
}

export enum LCPresentationControllerEndpoints {
  AddPresentation = 'addPresentation',
  GetPresentationDocuments = 'getPresentationDocuments',
  GetPresentationVaktDocuments = 'getPresentationVaktDocuments',
  UploadPresentationDocument = 'uploadPresentationDocument',
  DeletePresentationById = 'deletePresentationById',
  DeletePresentationDocument = 'deletePresentationDocument',
  SubmitPresentation = 'submitPresentation',
  AddDocuments = 'addDocuments',
  MarkCompliant = 'markCompliant',
  MarkDiscrepant = 'markDiscrepant',
  AdviseDsicrepancies = 'adviseDsicrepancies',
  AcceptDiscrepancies = 'acceptDiscrepancies',
  RejectDiscrepancies = 'rejectDiscrepancies',
  GetPresentationDocumentReview = 'getPresentationDocumentReview',
  GetPresentationFeedback = 'getPresentationFeedback'
}

export enum SBLCControllerEndpoints {
  Create = 'create',
  Get = 'get',
  IssueSBLC = 'issueSBLC',
  RejectIssueSBLC = 'rejectIssueSBLC',
  GetDocuments = 'getDocuments',
  GetLCDocument = 'getLCDocument',
  GetLCDocumentContent = 'getLCDocumentContent',
  Find = 'find'
}

export enum Metric {
  FlowMessageReceived = 'flowMessageReceived',
  FlowMessageProcessed = 'flowMessageProcessed',
  APICallReceived = 'apiCallReceived',
  APICallFinished = 'apiCallFinished',
  BlockchainEventReceived = 'blockchainEventReceived',
  BlockchainEventFinished = 'blockchainEventFinished',
  Error = 'error'
}
