import { ILCPresentation } from '../../models/ILCPresentation'

export interface ILCPresentationDataAgent {
  savePresentation(presentation: ILCPresentation)
  updateField(id: string, field: keyof ILCPresentation, value: any)
  getById(id: string): Promise<ILCPresentation>
  getByReference(reference: string): Promise<ILCPresentation>
  getByAttributes(attibutes): Promise<ILCPresentation>
  getByLcReference(reference: string): Promise<ILCPresentation[]>
  deleteLCPresentation(id: string): Promise<void>
}
