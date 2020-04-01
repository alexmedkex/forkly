import { ILCPresentation } from '../../data-layer/models/ILCPresentation'
import { ILC } from '../../data-layer/models/ILC'
import { IReceivedDocumentsResponse } from '../documents/IReceivedDocuments'
import { ISharedDocumentsResponse } from '../documents/ISharedDocumentsResponse'
import { IPresentationSharedDocuments } from './IPresentationSharedDocuments'

export interface ILCPresentationReviewService {
  markCompliant(presentation: ILCPresentation, lc: ILC): Promise<any>
  markDiscrepant(presentation: ILCPresentation, lc: ILC, comment: string): Promise<any>
  adviseDiscrepancies(presentation: ILCPresentation, lc: ILC, comment: string): Promise<any>
  acceptDiscrepancies(presentation: ILCPresentation, lc: ILC, comment: string): Promise<any>
  rejectDiscrepancies(presentation: ILCPresentation, lc: ILC, comment: string): Promise<any>

  getReceivedDocuments(presentation: ILCPresentation): Promise<IReceivedDocumentsResponse[]>
  sendDocumentFeedback(presentation: ILCPresentation): Promise<void>
  getDocumentsFeedback(presentation: ILCPresentation): Promise<IPresentationSharedDocuments>
}
