// tslint:disable-next-line: no-implicit-dependencies
import createMockInstance from 'jest-create-mock-instance'
import 'reflect-metadata'

import { CreditLineRequestService } from '../../CreditLineRequestService'
import { ICreditLineRequestMessage } from '../messages/ICreditLineRequestMessage'
import { FeatureType } from '../../enums/feature'
import { MessageType } from '../MessageTypes'

import CreditLineRequestEventProcessor from './CreditLineRequestEventProcessor'

const mockCreditLineRequestService = createMockInstance(CreditLineRequestService)

describe('CreditLineRequestEventProcessor', () => {
  const processor = new CreditLineRequestEventProcessor(mockCreditLineRequestService)
  const message: ICreditLineRequestMessage = {
    featureType: FeatureType.RiskCover,
    messageType: MessageType.CreditLineRequest,
    counterpartyStaticId: 'counterpartyStaticId',
    companyStaticId: 'companyStaticId',
    recepientStaticId: 'recepientStaticId',
    comment: 'comment',
    context: {
      productId: 'productId',
      subProductId: 'subProductId'
    },
    version: 1
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should process new credit line request', async () => {
    await processor.processMessage(message)

    expect(mockCreditLineRequestService.requestReceived).toHaveBeenCalled()
  })
})
