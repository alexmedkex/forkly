import {
  buildFakeSharedCreditLine,
  buildFakeCreditLine,
  ICreditLineSaveRequest,
  buildFakeCreditLineRequest
} from '@komgo/types'
import 'reflect-metadata'

import { ICompanyClient } from './clients/ICompanyClient'
import { ICounterpartyClient } from './clients/ICounterpartyClient'
import { CreditLineValidationService } from './CreditLineValidationService'
import { ErrorUtils, IValidationErrors } from '@komgo/microservice-config'
import { ErrorCode } from '@komgo/error-utilities'
import InvalidDataError from './errors/InvalidDataError'
import { ValidateError } from 'tsoa'

let validationService: CreditLineValidationService
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

describe('CreditLineValidationService', () => {
  beforeEach(() => {
    counterpartyClient = {
      getCounterparties: jest.fn()
    }
    companyClient = {
      getCompanies: jest.fn(),
      getCompanyByStaticId: jest.fn()
    }
    validationService = new CreditLineValidationService(counterpartyClient, companyClient)
  })

  describe('.validate', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should validate credit line create request', async () => {
      const creditLineRequest = buildFakeCreditLineRequest()
      const sharedCreditLine = creditLineRequest.sharedCreditLines[0]
      counterpartyClient.getCounterparties = jest.fn().mockResolvedValue([
        {
          ...mockCompany,
          staticId: sharedCreditLine.sharedWithStaticId,
          covered: true
        }
      ])

      companyClient.getCompanyByStaticId = jest.fn().mockResolvedValue({
        ...mockCompany,
        staticId: creditLineRequest.counterpartyStaticId,
        isFinancialInstitution: false
      })

      await validationService.validateRiskCover(creditLineRequest as ICreditLineSaveRequest)

      expect(counterpartyClient.getCounterparties).toBeCalledWith({ isFinancialInstitution: false })
      expect(companyClient.getCompanyByStaticId).toBeCalled()
    })

    it('should fail when company is not found', async () => {
      const creditLineRequest = buildFakeCreditLineRequest()
      counterpartyClient.getCounterparties = jest.fn().mockResolvedValue([
        {
          staticId: creditLineRequest.counterpartyStaticId,
          covered: true,
          ...mockCompany
        }
      ])
      companyClient.getCompanyByStaticId = jest.fn().mockResolvedValue(null)

      await expect(validationService.validate(creditLineRequest as ICreditLineSaveRequest)).rejects.toBeDefined()
    })

    it('should fail when company is financial institution', async () => {
      const creditLineRequest = buildFakeCreditLineRequest()
      counterpartyClient.getCounterparties = jest.fn().mockResolvedValue([
        {
          staticId: creditLineRequest.counterpartyStaticId,
          covered: true,
          ...mockCompany
        }
      ])
      companyClient.getCompanyByStaticId = jest.fn().mockResolvedValue({
        ...mockCompany,
        staticId: creditLineRequest.counterpartyStaticId,
        isFinancialInstitution: true
      })

      await expect(validationService.validate(creditLineRequest as ICreditLineSaveRequest)).rejects.toBeDefined()
    })

    it('should fail when counterparty is not found', async () => {
      const creditLineRequest = buildFakeCreditLineRequest()
      counterpartyClient.getCounterparties = jest.fn().mockResolvedValue([])

      companyClient.getCompanyByStaticId = jest.fn().mockResolvedValue({
        ...mockCompany,
        staticId: creditLineRequest.counterpartyStaticId,
        isFinancialInstitution: false
      })
      await expect(
        validationService.validateRiskCover(creditLineRequest as ICreditLineSaveRequest)
      ).rejects.toBeDefined()
      expect(counterpartyClient.getCounterparties).toBeCalled()
    })

    it('wrong credit line request schema', async () => {
      const creditLineRequest = {
        ...buildFakeCreditLineRequest(),
        availability: null
      }

      await expect(validationService.validate(creditLineRequest as ICreditLineSaveRequest)).rejects.toBeDefined()
    })

    it('valid credit line owner', async () => {
      companyClient.getCompanyByStaticId = jest.fn().mockResolvedValue({
        isFinancialInstitution: true,
        ...mockCompany
      })

      const result = await validationService.validateCreditLineOwner('1234')

      expect(companyClient.getCompanyByStaticId).toBeCalled()
      expect(result).toEqual({
        isFinancialInstitution: true,
        ...mockCompany
      })
    })

    it('should return invalid credit line owner', async () => {
      companyClient.getCompanyByStaticId = jest.fn().mockResolvedValue({
        isFinancialInstitution: false,
        ...mockCompany
      })

      await expect(validationService.validateCreditLineOwner('1234')).rejects.toEqual(
        new InvalidDataError(`Company with 1234 is not  financial institution`)
      )
    })

    it('should not find the company', async () => {
      companyClient.getCompanyByStaticId = jest.fn().mockResolvedValue()

      await expect(validationService.validateCreditLineOwner('1234')).rejects.toEqual(
        new InvalidDataError(`Company with 1234 does not exist in registry`)
      )
    })

    it('valid credit line counterparty', async () => {
      companyClient.getCompanyByStaticId = jest.fn().mockResolvedValue({
        isFinancialInstitution: false,
        ...mockCompany
      })

      const result = await validationService.validateCreditLineCounterparty('1234')

      expect(companyClient.getCompanyByStaticId).toBeCalled()
      expect(result).toEqual({
        isFinancialInstitution: false,
        ...mockCompany
      })
    })

    it('should return invalid credit line company', async () => {
      companyClient.getCompanyByStaticId = jest.fn().mockResolvedValue({
        isFinancialInstitution: true,
        ...mockCompany
      })

      await expect(validationService.validateCreditLineCounterparty('1234')).rejects.toEqual(
        new InvalidDataError(`Company with 1234 can't be  financial institution`)
      )
    })

    it('should not find the company', async () => {
      companyClient.getCompanyByStaticId = jest.fn().mockResolvedValue()

      await expect(validationService.validateCreditLineCounterparty('1234')).rejects.toEqual(
        new InvalidDataError(`Company with 1234 does not exist in registry`)
      )
    })

    it('validate non finance institution', async () => {
      companyClient.getCompanyByStaticId = jest.fn().mockResolvedValue({
        isFinancialInstitution: false,
        ...mockCompany
      })

      const result = await validationService.validateNonFinanceInstitution('1234')

      expect(companyClient.getCompanyByStaticId).toBeCalled()
      expect(result).toEqual({
        isFinancialInstitution: false,
        ...mockCompany
      })
    })

    it('validate non finance institution - not found company', async () => {
      companyClient.getCompanyByStaticId = jest.fn().mockResolvedValue()

      await expect(validationService.validateNonFinanceInstitution('1234')).rejects.toEqual(
        new InvalidDataError(`Company with 1234 does not exist in registry`)
      )
    })

    it('validate non finance institution - invalid company', async () => {
      companyClient.getCompanyByStaticId = jest.fn().mockResolvedValue({
        isFinancialInstitution: true,
        ...mockCompany
      })

      await expect(validationService.validateNonFinanceInstitution('1234')).rejects.toEqual(
        new InvalidDataError(`Company with 1234 is financial institution`)
      )
    })
  })
})
