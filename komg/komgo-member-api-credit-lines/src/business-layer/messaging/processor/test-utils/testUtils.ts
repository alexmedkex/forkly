import { Currency, DepositLoanPeriod, DepositLoanType } from '@komgo/types'
import 'reflect-metadata'

import CreditLineRequestDataAgent from '../../../../data-layer/data-agents/CreditLineRequestDataAgent'
import DisclosedCreditLineDataAgent from '../../../../data-layer/data-agents/DisclosedCreditLineDataAgent'
import { CreditLineRequestService } from '../../../CreditLineRequestService'
import { CreditLineValidationService } from '../../../CreditLineValidationService'
import { FeatureType } from '../../../enums/feature'
import { NotificationClient } from '../../../notifications/notifications/NotificationClient'
import { ISharedCreditLineMessage } from '../../messages/IShareCreditLineMessage'
import { ISharedDepositLoanMessage } from '../../messages/IShareDepositLoanMessage'
import { MessageType } from '../../MessageTypes'

export const buildFakeSharedCreditLineMessage = (): ISharedCreditLineMessage => {
  const message: ISharedCreditLineMessage = {
    version: 1,
    messageType: MessageType.ShareCreditLine,
    featureType: FeatureType.RiskCover,

    staticId: 'staticId',
    ownerStaticId: 'bankId',
    recepientStaticId: 'traderId',

    payload: {
      counterpartyStaticId: 'buyerId',
      context: { productId: 'tradeFinance', subProductId: 'rd' },
      data: {
        appetite: true,
        availability: true,
        availabilityAmount: 100,
        currency: Currency.EUR
      }
    }
  }

  return message
}

export const buildFakeSharedDepositLoanMessage = (): ISharedDepositLoanMessage => {
  const message: ISharedDepositLoanMessage = {
    version: 1,
    messageType: MessageType.ShareCreditLine,
    featureType: FeatureType.Deposit,

    staticId: 'staticId',
    ownerStaticId: 'bankId',
    recepientStaticId: 'traderId',

    payload: {
      type: DepositLoanType.Deposit,
      currency: Currency.USD,
      period: DepositLoanPeriod.Months,
      periodDuration: 3,
      data: {
        appetite: true,
        pricing: 0.1
      }
    }
  }

  return message
}

export const getValidationServiceMock = createMockInstance => {
  const validationService = createMockInstance(CreditLineValidationService)

  validationService.validateCreditLineOwner.mockResolvedValue({
    staticId: 'bankId',
    x500Name: { O: 'Bank name' }
  } as any)
  validationService.validateCreditLineCounterparty.mockResolvedValue({
    staticId: 'buyerId',
    x500Name: { O: 'Buyer name' }
  } as any)

  return validationService
}

export const buildProcessorMocks = createMockInstance => {
  const disclosedDataAgent = createMockInstance(DisclosedCreditLineDataAgent)
  const creditLineRequestDataAgent = createMockInstance(CreditLineRequestDataAgent)
  const validationService = getValidationServiceMock(createMockInstance)
  const notificationClient = createMockInstance(NotificationClient)
  const creditLineRequestService = createMockInstance(CreditLineRequestService)

  disclosedDataAgent.create.mockResolvedValue('staticId')

  return {
    disclosedDataAgent,
    creditLineRequestDataAgent,
    validationService,
    notificationClient,
    creditLineRequestService
  }
}
