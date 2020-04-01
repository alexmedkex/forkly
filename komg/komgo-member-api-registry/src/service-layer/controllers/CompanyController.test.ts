import 'reflect-metadata'
import { MockInstance } from 'jest'

import ICreateCompanyResponse from '../responses/ICreateCompanyResponse'
import CompanyRequest from '../requests/CompanyRequest'
import Company from '../../data-layer/models/Company'
import { TYPES } from '../../inversify/types'
import ICompanyUseCase from '../../business-layer/company/ICompanyUseCase'
import { CompanyController } from './CompanyController'
import CompanyDataAgent from '../../data-layer/data-agents/CompanyDataAgent'
import TransactionSigner from '../../business-layer/transaction-signer/TransactionSigner'
import { HttpException } from '@komgo/microservice-config'

const VALID_HASH = '0x0'
const genericError = new Error('something went wrong')

const createCompanyValid: MockInstance = jest.fn(() => {
  return VALID_HASH
})

const createCompanyInvalid: MockInstance = jest.fn(() => {
  throw genericError
})

const mockRequest: CompanyRequest = {
  companyEnsDomain: 'company1.komgo',
  companyAddress: '0x0'
}

describe('createCompany', () => {
  it('should return a valid transaction.', async () => {
    const controller = new CompanyController({
      createCompany: createCompanyValid
    })

    const result = await controller.createCompany(mockRequest)

    expect(result.txHash).toEqual(VALID_HASH)
  })

  it('should throw if use case throws an error', async () => {
    const controller = new CompanyController({
      createCompany: createCompanyInvalid
    })

    let error
    try {
      const result = await controller.createCompany(mockRequest)
    } catch (e) {
      error = e
    }

    expect(error).toBeInstanceOf(HttpException)
  })
})
