import { Action } from 'redux'
import { ImmutableMap } from '../../../../utils/types'

export enum ErrorReportActionType {
  CREATE_ERROR_REPORT_REQUEST = '@@report/CREATE_ERROR_REPORT_REQUEST',
  CREATE_ERROR_REPORT_SUCCESS = '@@report/CREATE_ERROR_REPORT_SUCCESS',
  CREATE_ERROR_REPORT_FAILURE = '@@report/CREATE_ERROR_REPORT_FAILURE',
  ADD_ATTACHMENTS_REQUEST = '@@report/ADD_ATTACHMENTS_REQUEST',
  ADD_ATTACHMENTS_SUCCESS = '@@report/ADD_ATTACHMENTS_SUCCESS',
  STORE_REQUEST = '@@report/STORE_REQUEST'
}

export interface ErrorReportCustomFieldInterface {
  id: string
  value: any
}

export interface ErrorReportCommentInterface {
  body: string
  uploads: FileList
}

export enum ErrorReportSeverity {
  '1 - Urgent' = 1,
  '2 - High',
  '3 - Medium',
  '4 - Low'
}

export interface ErrorReportInterface {
  subject: string
  comment: ErrorReportCommentInterface
  custom_fields: ErrorReportCustomFieldInterface[]
}

export interface ErrorReportFormicInterface {
  subject: string
  description: string
  stepsToReproduce: string
  addTechnicalInfo: boolean
  technicalInfo: string
  uploads: FileList
  severity: ErrorReportSeverity
}

export interface ErrorReportStateFields {
  lastRequests: ErrorReportRequest[]
  lastError: ErrorReportError | null
  uploads: string[]
  isOpenModal: boolean
  isOpenFeedbackModal: boolean
}

export interface ErrorReportRequest {
  timestamp?: number
  method?: string
  url?: string
  requestId?: string
}

export interface ErrorReportError {
  origin?: string
  message?: string
  cause?: string
  requestId?: string
}

export type ErrorReportState = ImmutableMap<ErrorReportStateFields>

export interface StoreRequest extends Action {
  type: ErrorReportActionType.STORE_REQUEST
  payload: ErrorReportRequest
}
