import {
  buildFakeSharedCreditLine,
  buildFakeCreditLine,
  ICreditLineSaveRequest,
  buildFakeCreditLineRequest,
  ICreateCreditLineRequest
} from '@komgo/types'
import 'reflect-metadata'

import { ICompanyClient } from './clients/ICompanyClient'
import { ICounterpartyClient } from './clients/ICounterpartyClient'
import { RequestValidationService } from './RequestValidationService'

const MOCK_DATA: ICreateCreditLineRequest = {
  context: { productId: 'product-id', subProductId: 'sub-product-id' },
  comment: 'test-comment',
  counterpartyStaticId: 'c6a17f26-d8d6-4b98-aed1-55bdefdc6d40',
  companyIds: ['975c02b1-239d-4aaa-99ba-890a4ac34b1d']
}

let validationService: RequestValidationService
let counterpartyClient: ICounterpartyClient
let companyClient: ICompanyClient

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

describe('RequestValidationService', () => {
  beforeEach(() => {
    counterpartyClient = {
      getCounterparties: jest.fn()
    }
    companyClient = {
      getCompanies: jest.fn(),
      getCompanyByStaticId: jest.fn()
    }
    validationService = new RequestValidationService(counterpartyClient, companyClient)
  })

  describe('.validate', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('valid credit line request', async () => {
      const request = { ...MOCK_DATA }
      const companyId = request.companyIds[0]
      counterpartyClient.getCounterparties = jest.fn().mockResolvedValue([
        {
          ...mockCompany,
          staticId: companyId,
          covered: true
        }
      ])

      companyClient.getCompanyByStaticId = jest.fn().mockResolvedValue({
        ...mockCompany,
        staticId: request.counterpartyStaticId,
        isFinancialInstitution: false
      })

      await validationService.validate(request as ICreateCreditLineRequest)

      expect(counterpartyClient.getCounterparties).toBeCalledWith({ isFinancialInstitution: true })
      expect(companyClient.getCompanyByStaticId).toBeCalled()
    })

    it('fail company not found', async () => {
      const request = { ...MOCK_DATA }
      counterpartyClient.getCounterparties = jest.fn().mockResolvedValue([
        {
          staticId: request.companyIds[0],
          covered: true,
          ...mockCompany
        }
      ])
      companyClient.getCompanyByStaticId = jest.fn().mockResolvedValue(null)

      await expect(validationService.validate(request as ICreateCreditLineRequest)).rejects.toBeDefined()
    })

    it('fail company is financial institution', async () => {
      const request = { ...MOCK_DATA }
      counterpartyClient.getCounterparties = jest.fn().mockResolvedValue([
        {
          staticId: request.companyIds[0],
          covered: true,
          ...mockCompany
        }
      ])
      companyClient.getCompanyByStaticId = jest.fn().mockResolvedValue({
        ...mockCompany,
        staticId: request.counterpartyStaticId,
        isFinancialInstitution: true
      })

      await expect(validationService.validate(request)).rejects.toBeDefined()
    })

    it('fail counterparty not found', async () => {
      const request = { ...MOCK_DATA }
      counterpartyClient.getCounterparties = jest.fn().mockResolvedValue([])

      companyClient.getCompanyByStaticId = jest.fn().mockResolvedValue({
        ...mockCompany,
        staticId: request.counterpartyStaticId,
        isFinancialInstitution: false
      })
      await expect(validationService.validate(request)).rejects.toBeDefined()
      expect(counterpartyClient.getCounterparties).toBeCalled()
    })
  })
})
