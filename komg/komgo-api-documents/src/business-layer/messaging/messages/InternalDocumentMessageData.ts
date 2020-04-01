import { OwnerMessageData } from './OwnerMessageData'

export class InternalDocumentMessageData {
  id: string
  context?: object
  productId: string
  categoryId: string
  categoryName?: string
  typeId: string
  typeName?: string
  name: string
  owner: OwnerMessageData
  hash: string
  contentHash: string
  komgoStamp: boolean
  registrationDate: Date
  notes: string
}
