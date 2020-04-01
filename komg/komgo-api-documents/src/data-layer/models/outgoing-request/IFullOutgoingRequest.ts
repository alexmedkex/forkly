import { IFullHasProduct } from '../../data-agents/interfaces/IFullHasProduct'
import { IFullDocument } from '../document'
import { INote } from '../requests/INote'
import { IFullType } from '../type/IFullType'

export interface IFullOutgoingRequest extends IFullHasProduct {
  companyId: string
  types: IFullType[]
  forms?: IFullDocument[]
  createdAt: Date
  updatedAt?: Date
  notes?: INote[]
  deadline?: Date
}
