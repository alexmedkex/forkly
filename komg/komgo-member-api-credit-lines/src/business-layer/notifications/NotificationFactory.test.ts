import { ICreditLineRequest, CreditLineRequestType, CreditLineRequestStatus, Currency } from '@komgo/types'
import 'reflect-metadata'

import { IDisclosedCreditLine } from '../../data-layer/models/IDisclosedCreditLine'

import { PRODUCT_ID, SUB_PRODUCT_ID } from './enums'
import { NotificationFactory } from './NotificationFactory'
import { NotificationType } from './NotificationType'

const creditLineRequest: ICreditLineRequest = {
  comment: 'comment',
  companyStaticId: 'companyStaticId',
  context: {
    productId: 'productId',
    subProductId: 'subProductId'
  },
  counterpartyStaticId: 'counterpartyStaticId',
  createdAt: undefined,
  requestType: CreditLineRequestType.Received,
  staticId: 'staticId',
  status: CreditLineRequestStatus.Pending,
  updatedAt: undefined
}

const disclosedCreditLine: IDisclosedCreditLine = {
  appetite: true,
  availability: true,
  availabilityAmount: 100,
  context: {
    productId: 'productId',
    subProductId: 'subProductId'
  },
  counterpartyStaticId: 'counterpartyStaticId',
  currency: Currency.AED,
  data: {},
  ownerStaticId: 'ownerStaticId',
  staticId: 'staticId',
  createdAt: undefined,
  updatedAt: undefined
}

describe('CreditLineRequestTaskFactory', () => {
  let notificationFactory: NotificationFactory = new NotificationFactory()

  it('should create CL.DisclosedRiskCover notification', () => {
    const notification = notificationFactory.getNotification(
      NotificationType.DisclosedRiskCover,
      {
        ...disclosedCreditLine,
        context: {
          productId: PRODUCT_ID.TradeFinance,
          subProductId: SUB_PRODUCT_ID.RiskCover
        }
      },
      'financialInstitution',
      'company'
    )

    expect(notification).toMatchObject({
      message: 'financialInstitution has added risk cover information on company'
    })
  })

  it('should create CL.DisclosedBankLine notification', () => {
    const notification = notificationFactory.getNotification(
      NotificationType.DisclosedBankLine,
      {
        ...disclosedCreditLine,
        context: {
          productId: PRODUCT_ID.TradeFinance,
          subProductId: SUB_PRODUCT_ID.BankLine
        }
      },
      'financialInstitution',
      'company'
    )

    expect(notification).toMatchObject({
      message: 'financialInstitution has added bank lines information on company'
    })
  })

  it('should create CL.UpdateDisclosedRiskCover notification', () => {
    const notification = notificationFactory.getNotification(
      NotificationType.UpdateDisclosedRiskCover,
      {
        ...disclosedCreditLine,
        context: {
          productId: PRODUCT_ID.TradeFinance,
          subProductId: SUB_PRODUCT_ID.RiskCover
        }
      },
      'financialInstitution',
      'company'
    )

    expect(notification).toMatchObject({
      message: 'financialInstitution has updated risk cover information on company'
    })
  })

  it('should create CL.UpdateDisclosedBankLine notification', () => {
    const notification = notificationFactory.getNotification(
      NotificationType.UpdateDisclosedBankLine,
      {
        ...disclosedCreditLine,
        context: {
          productId: PRODUCT_ID.TradeFinance,
          subProductId: SUB_PRODUCT_ID.BankLine
        }
      },
      'financialInstitution',
      'company'
    )

    expect(notification).toMatchObject({
      message: 'financialInstitution has updated bank lines information on company'
    })
  })

  it('should create CL.RevokeDisclosedRiskCover notification', () => {
    const notification = notificationFactory.getNotification(
      NotificationType.RevokeDisclosedRiskCover,
      {
        ...disclosedCreditLine,
        context: {
          productId: PRODUCT_ID.TradeFinance,
          subProductId: SUB_PRODUCT_ID.RiskCover
        }
      },
      'financialInstitution',
      'company'
    )

    expect(notification).toMatchObject({
      message: 'financialInstitution has updated risk cover information on company'
    })
  })

  it('should create CL.RevokeDisclosedBankLine notification', () => {
    const notification = notificationFactory.getNotification(
      NotificationType.RevokeDisclosedBankLine,
      {
        ...disclosedCreditLine,
        context: {
          productId: PRODUCT_ID.TradeFinance,
          subProductId: SUB_PRODUCT_ID.BankLine
        }
      },
      'financialInstitution',
      'company'
    )

    expect(notification).toMatchObject({
      message: 'financialInstitution has updated bank lines information on company'
    })
  })

  it('should create CL.DeclineRequestRiskCover notification', () => {
    const notification = notificationFactory.getNotification(
      NotificationType.DeclineRequestRiskCover,
      {
        ...disclosedCreditLine,
        context: {
          productId: PRODUCT_ID.TradeFinance,
          subProductId: SUB_PRODUCT_ID.RiskCover
        }
      },
      'financialInstitution',
      'company'
    )

    expect(notification).toMatchObject({
      message: 'financialInstitution has declined the request for risk cover information on company'
    })
  })

  it('should create CL.DeclineRequestBankLine notification', () => {
    const notification = notificationFactory.getNotification(
      NotificationType.DeclineRequestBankLine,
      {
        ...disclosedCreditLine,
        context: {
          productId: PRODUCT_ID.TradeFinance,
          subProductId: SUB_PRODUCT_ID.BankLine
        }
      },
      'financialInstitution1',
      'financialInstitution2'
    )

    expect(notification).toMatchObject({
      message: 'financialInstitution1 has declined the request for bank lines information on financialInstitution2'
    })
  })

  it('should throw exception - invalid context for sending notification', () => {
    try {
      notificationFactory.getNotification(
        NotificationType.DeclineRequestBankLine,
        disclosedCreditLine,
        'financialInstitution1',
        'financialInstitution2'
      )
    } catch (err) {
      expect(err.message).toEqual('Notification type not found based on provided context')
    }
  })
})
