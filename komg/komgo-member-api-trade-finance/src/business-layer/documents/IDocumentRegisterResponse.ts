export interface IContentResponse {
  fileId: string
  signature: string
}

export interface IOwnerResponse {
  firstName: string
  lastName: string
  companyId: string
}

export class KeyValueResponse {
  name: string
  value: string
}

export interface IProductResponse {
  id: string
  name: string
}

export interface ICategoryResponse {
  id: string
  product: IProductResponse
  name: string
}

export enum FieldType {
  STRING = 'string',
  DATE = 'date',
  NUMBER = 'number'
}

export interface IFieldResponse {
  id: string
  name: string
  type: FieldType
  isArray: boolean
}

export interface ITypeResponse {
  id: string
  product: IProductResponse
  category: ICategoryResponse
  name: string
  vaktId?: string
  fields: IFieldResponse[]
  predefined: boolean
}

export interface IDocumentRegisterResponse {
  id: string
  context: any
  name: string
  product: IProductResponse
  category: ICategoryResponse
  type: ITypeResponse
  owner: IOwnerResponse
  hash: string
  registrationDate: Date
  content: IContentResponse
  metadata: KeyValueResponse[]
  sharedWith: string[]
  sharedBy: string
  comment?: string
}
