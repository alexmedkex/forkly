import { KeyValueRequest } from '../../../service-layer/request/KeyValueRequest'
import { IFullHasProduct } from '../../data-agents/interfaces/IFullHasProduct'
import { IFullCategory } from '../category/IFullCategory'
import { IFullType } from '../type/IFullType'

import IDownloadInfo from './DownloadInfo'
import { IContent } from './IContent'
import { IOwner } from './IOwner'
import { ISharedWith } from './ISharedWith'
import { IUnsignedContent } from './IUnsignedContent'
import IUploadInfo from './UploadInfo'

export interface IFullDocument extends IFullHasProduct {
  name: string
  context: object
  category: IFullCategory
  type: IFullType
  owner: IOwner
  hash: string
  contentHash: string
  komgoStamp: boolean
  registrationDate: Date
  createdAt: Date
  metadata: KeyValueRequest[]
  content: IContent
  contentPreview?: IUnsignedContent
  sharedWith: ISharedWith[]
  sharedBy: string
  comment?: string
  state: string
  uploadInfo?: IUploadInfo
  downloadInfo?: IDownloadInfo
}
