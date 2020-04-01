import { IEmailTemplateData } from '@komgo/types'

export enum TaskStatus {
  ToDo = 'To Do',
  InProgress = 'In Progress',
  Done = 'Done',
  Pending = 'Pending Confirmation'
}

export enum TaskType {
  ReviewIssued = 'SBLC.ReviewIssued',
  ReviewRequested = 'SBLC.ReviewRequested',
  AmendmentReviewTrade = 'LC_AMENDMENT_REVIEW_TRADE',
  AmendmentReviewAmendment = 'LC_AMENDMENT_REVIEW_AMENDMENT',
  ReviewPresentation = 'LC.ReviewPresentation',
  ViewPresentedDocuments = 'LC.ViewPresentedDocuments',
  ReviewDiscrepantPresentation = 'LC.ReviewDiscrepantPresentation',
  ReviewPresentationDiscrepancies = 'LC.ReviewPresentationDiscrepancies',
  ReviewLCApplication = 'LC.ReviewLCApplication',
  ReviewTrade = 'LC.ReviewTrade',
  ReviewAppRefusal = 'LC.ReviewAppRefusal',
  ReviewIssuedLC = 'LC.ReviewIssuedLC',
  IssuedLCRefusal = 'LC.IssuedLCRefusal',
  ManagePresentation = 'LC.ManagePresentation',
  ReviewTradeDocs = 'LC.ReviewTradeDocs',
  LCReviewIssued = 'LetterOfCredit.ReviewIssued',
  LCReviewRequested = 'LetterOfCredit.ReviewRequested',
  ReviewRequest = 'RFP.ReviewRequest',
  ReviewResponse = 'RFP.ReviewResponse',
  ReviewAccept = 'RFP.ReviewAccept',
  DocRequest = 'KYC.DocRequest',
  ReviewDocuments = 'KYC.ReviewDocuments',
  info = 'Counterparty.info',
  task = 'Counterparty.task',
  ReviewCLR = 'CL.ReviewRequest',
  ReviewDLR = 'CL.DepositLoan.ReviewRequest',
  LetterOfCreditReviewRequested = 'LetterOfCredit.ReviewRequested'
}

export interface IRequiredPermission {
  productId: string
  actionId: string
}

export type ITaskContext = any

export interface ITaskCreateRequest {
  outcome?: boolean
  summary: string
  taskType: TaskType
  status?: TaskStatus
  counterpartyStaticId?: string
  emailData?: IEmailTemplateData
  context: ITaskContext
  requiredPermission: IRequiredPermission
  dueAt?: Date
}

export interface ITaskWithMessageCreateRequest {
  task: ITaskCreateRequest
  message: string
}

export interface ITaskUpdateStatusRequest {
  status: TaskStatus
  taskType: string
  context: ITaskContext
  comment?: string
  outcome?: boolean
}

export interface ITaskUpdateAssigneeRequest {
  assignee?: string
}

export interface ITask {
  _id: string
  summary: string
  taskType: TaskType
  status: TaskStatus
  counterpartyStaticId?: string
  assignee: string | null
  requiredPermission: IRequiredPermission
  context: ITaskContext
  comment?: string
  outcome?: boolean
  updatedAt: Date
  createdAt: Date
  dueAt?: Date
}
