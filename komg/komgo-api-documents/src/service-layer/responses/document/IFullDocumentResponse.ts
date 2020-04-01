import { KeyValueRequest } from '../../request/KeyValueRequest'
import { IFullCategoryResponse } from '../category/IFullCategoryResponse'
import { IProductResponse } from '../product'
import { IFullTypeResponse } from '../type/IFullTypeResponse'

import { IContentResponse } from './IContentResponse'
import IDownloadInfoResponse from './IDownloadInfoResponse'
import { IOwnerResponse } from './IOwnerResponse'
import { ISharedInfo } from './ISharedInfo'
import { ISharedWithResponse } from './ISharedWithResponse'
import IUploadInfoResponse from './IUploadInfoResponse'

export interface IFullDocumentResponse {
  id: string
  context: any
  name: string
  product: IProductResponse
  category: IFullCategoryResponse
  type: IFullTypeResponse
  owner: IOwnerResponse
  hash: string
  contentHash: string
  komgoStamp: boolean
  sharedWith: ISharedWithResponse[]
  registrationDate: Date
  receivedDate: Date
  content: IContentResponse
  metadata: KeyValueRequest[]
  sharedBy: string
  comment?: string
  state: string
  uploadInfo?: IUploadInfoResponse
  downloadInfo?: IDownloadInfoResponse
  sharedInfo?: ISharedInfo
}
