import { KeyValueRequest } from '../../request/KeyValueRequest'

import { IContentResponse } from './IContentResponse'
import { IOwnerResponse } from './IOwnerResponse'
import { ISharedInfo } from './ISharedInfo'
import { ISharedWithResponse } from './ISharedWithResponse'

export interface IDocumentResponse {
  id: string
  context: any
  name: string
  productId: string
  categoryId: string
  typeId: string
  owner: IOwnerResponse
  hash: string
  contentHash: string
  komgoStamp: boolean
  registrationDate: Date
  content: IContentResponse
  metadata: KeyValueRequest[]
  sharedWith?: ISharedWithResponse[]
  sharedBy: string
  comment?: string
  state: string
  sharedInfo?: ISharedInfo
}
