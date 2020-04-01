import { IFile } from '../types/IFile'

export interface IRegisterDocument {
  productId: string
  categoryId: string
  typeId: string

  owner: IOwner
  metadata: IKeyValueRequest[]
  name: string
  context: object
  documentData: IFile
  comment?: string
}

export interface IOwner {
  firstName: string
  lastName: string
  companyId: string
}

export interface IKeyValueRequest {
  name: string
  value: string
}
