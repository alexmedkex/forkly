import { IQuote } from '@komgo/types'

import { IReply } from '../../data-layer/models/replies/IReply'

export interface IProductResponse {
  rfpReply: IReply
  quote?: IQuote
}
