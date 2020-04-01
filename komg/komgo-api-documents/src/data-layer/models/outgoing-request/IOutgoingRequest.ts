import { IHasProduct } from '../../data-agents/interfaces/IHasProduct'
import { INote } from '../requests/INote'

export interface IOutgoingRequest extends IHasProduct {
  companyId: string
  types: string[]
  forms?: string[]
  createdAt?: Date
  updatedAt?: Date
  notes?: INote[]
  deadline?: Date
}
