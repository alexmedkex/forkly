import { IHasProduct } from '../../data-agents/interfaces/IHasProduct'
import { IKeyValue } from '../IKeyValue'

import IDownloadInfo from './DownloadInfo'
import { IContent } from './IContent'
import { IOwner } from './IOwner'
import { ISharedWith } from './ISharedWith'
import { IUnsignedContent } from './IUnsignedContent'
import IUploadInfo from './UploadInfo'

export interface IDocument extends IHasProduct {
  id: string
  context: object
  name: string
  productId: string
  categoryId: string
  typeId: string
  owner: IOwner
  hash: string
  contentHash: string
  komgoStamp: boolean
  createdAt?: Date
  registrationDate: Date
  metadata: IKeyValue[]
  content: IContent
  contentPreview?: IUnsignedContent
  sharedWith: ISharedWith[]
  sharedBy: string
  comment?: string
  state: string
  uploadInfo?: IUploadInfo
  downloadInfo?: IDownloadInfo
}
