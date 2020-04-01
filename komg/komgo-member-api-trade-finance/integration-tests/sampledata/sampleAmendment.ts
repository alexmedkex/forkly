import { ILCAmendment, LCAmendmentStatus } from '@komgo/types'

export const sampleAmendment: ILCAmendment = {
  diffs: [
    {
      op: 'add',
      path: '/vaktId',
      value: '55445544545',
      type: 'ITrade',
      oldValue: 'asd'
    },
    {
      op: 'add',
      path: '/vaktId',
      value: '55445544545',
      type: 'ICargo',
      oldValue: 'asd'
    }
  ],
  status: LCAmendmentStatus.Pending,
  staticId: '1234513123123',
  createdAt: '10/10/10',
  updatedAt: '10/10/10',
  version: 1,
  lcStaticId: '5c8936a098515c014ca7f6ae',
  lcReference: 'LC-RAU-19-10'
}
