import { ILCPresentation } from '../../data-layer/models/ILCPresentation'
import { ILC } from '../../data-layer/models/ILC'
export interface ILCPresentationService {
  createNewPresentation(lc: ILC): Promise<ILCPresentation>
  updatePresentation(presentation: ILCPresentation): Promise<ILCPresentation>
  getLCPresentation(attibutes): Promise<ILCPresentation>
  getLCPresentationById(id: string): Promise<ILCPresentation>
  getLCPresentationByReference(reference: string): Promise<ILCPresentation>
  getPresentationsByLcReference(reference: string): Promise<ILCPresentation[]>
  getLCPresentationDocuments(lc: ILC, presentation: ILCPresentation)
  deletePresentationById(id: string): Promise<void>
  deletePresentationDocument(presentationId: string, documentId: string): Promise<void>
  submitPresentation(presentation: ILCPresentation, comment: string, lc: ILC): Promise<string>
}
