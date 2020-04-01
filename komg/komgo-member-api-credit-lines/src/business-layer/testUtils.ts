import { CreditLineRequestType, CreditLineRequestStatus, ICreditLineRequest } from '@komgo/types'

export const buildFakeCreditLineRequest: () => ICreditLineRequest = () => ({
  staticId: 'static-id',
  requestType: CreditLineRequestType.Received,
  context: { productId: 'tradeFinance', subProductId: 'rd' },
  counterpartyStaticId: 'request-for-id',
  companyStaticId: 'requested-by-id',
  comment: 'string',
  status: CreditLineRequestStatus.Pending,
  createdAt: '2019-01-01',
  updatedAt: '2019-01-01'
})
