import 'reflect-metadata'

import { CreditLineValidationFactory } from './CreditLineValidationFactory'
import { CreditLineValidationService } from './CreditLineValidationService'
import { ICounterpartyClient } from './clients/ICounterpartyClient'
import { ICompanyClient } from './clients/ICompanyClient'
import { buildFakeCreditLineRequest, ICreditLineSaveRequest } from '@komgo/types'
import { PRODUCT_ID, SUB_PRODUCT_ID } from './notifications/enums'
import { RequestValidationService } from './RequestValidationService'

let validationService: CreditLineValidationService
let requestValidationService: RequestValidationService
let counterpartyClient: ICounterpartyClient
let companyClient: ICompanyClient
let creditLineValidationFactory: CreditLineValidationFactory

const mockCompany = {
  data: [
    {
      guid: '1111',
      komgoMnid: '2222',
      vaktMnid: '3333',
      x500Name: '44444',
      address: '555666',
      text: undefined
    }
  ]
}

describe('CreditLineValidationFactory', () => {
  beforeEach(() => {
    counterpartyClient = {
      getCounterparties: jest.fn()
    }
    companyClient = {
      getCompanies: jest.fn(),
      getCompanyByStaticId: jest.fn()
    }
    validationService = new CreditLineValidationService(counterpartyClient, companyClient)
    requestValidationService = new RequestValidationService(counterpartyClient, companyClient)
    creditLineValidationFactory = new CreditLineValidationFactory(validationService, requestValidationService)
  })

  it('should validate RiskCover request', async () => {
    const creditLineRequest = buildFakeCreditLineRequest()
    const riskCoverRequest = {
      ...creditLineRequest,
      context: {
        productId: PRODUCT_ID.TradeFinance,
        subProductId: SUB_PRODUCT_ID.RiskCover
      }
    }
    const sharedCreditLine = riskCoverRequest.sharedCreditLines[0]
    counterpartyClient.getCounterparties = jest.fn().mockResolvedValue([
      {
        ...mockCompany,
        staticId: sharedCreditLine.sharedWithStaticId,
        covered: true
      }
    ])

    companyClient.getCompanyByStaticId = jest.fn().mockResolvedValue({
      ...mockCompany,
      staticId: riskCoverRequest.counterpartyStaticId,
      isFinancialInstitution: false
    })

    await creditLineValidationFactory.getCreditLineValidation(
      CreditLineValidationFactory.ValidationType(riskCoverRequest.context),
      riskCoverRequest as ICreditLineSaveRequest
    )

    expect(counterpartyClient.getCounterparties).toBeCalledWith({ isFinancialInstitution: false })
    expect(companyClient.getCompanyByStaticId).toBeCalled()
  })
})
