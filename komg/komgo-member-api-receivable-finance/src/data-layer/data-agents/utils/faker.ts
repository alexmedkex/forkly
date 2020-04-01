import { ReplyType } from '@komgo/types'
import { v4 as uuid4 } from 'uuid'

import { IReply } from '../../models/replies/IReply'

const MOCK_STATIC_ID = 'cc24a24b-ada5-4332-9ee7-394da255df67'

export const mockTrade = {
  _id: 'tradeId'
}
export const mockMovements = [
  {
    _id: 'movementId0'
  },
  {
    _id: 'movementId1'
  }
]

export const buildFakeReply = (overrides: Partial<IReply> = {}, uniqueIds: boolean = false): IReply => {
  const staticId = uniqueIds ? uuid4() : MOCK_STATIC_ID
  return {
    staticId,
    rdId: 'rdId',
    type: ReplyType.Submitted,
    participantId: 'participantId',
    senderStaticId: 'senderStaticId',
    ...overrides
  }
}
