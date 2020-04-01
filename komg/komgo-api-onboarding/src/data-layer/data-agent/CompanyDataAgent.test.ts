import { ErrorCode } from '@komgo/error-utilities'
import { ErrorUtils } from '@komgo/microservice-config'
import { Status } from '@komgo/types'

import mockingoose from 'mockingoose'
import 'reflect-metadata'

import { Company } from '../models/Company'

jest.mock('../../utils/generatePw', () => ({
  default: () => generatedName
}))

jest.mock('uuid', () => ({
  v4: () => generatedMnid
}))

const generatedName = 'test-num'
const generatedMnid = 'test-mnid'
const mockPreCompanyData = {
  x500Name: {
    O: 'O',
    C: 'C',
    L: 'L',
    STREET: 'STREET',
    PC: 'PC'
  },
  hasSWIFTKey: true,
  isFinancialInstitution: true,
  isMember: true,
  companyAdminEmail: 'test@test.com',
  memberType: 'FMS'
}

const harborCred = {
  harborUser: 'user',
  harborEmail: 'test@test.com',
  harborPassword: 'pass'
}
const updatedCompanyData = {
  status: Status.Draft,
  staticId: generatedMnid,
  komgoMnid: generatedMnid,
  rabbitMQCommonUser: `${generatedMnid}-USER`,
  rabbitMQCommonPassword: generatedName,
  ...mockPreCompanyData
}
const companyNotFoundMessage = 'Company not found'

import CompanyDataAgent from './CompanyDataAgent'

describe('CompanyDataAgent', () => {
  let companyDataAgent
  beforeEach(() => {
    mockingoose.resetAll()
    companyDataAgent = new CompanyDataAgent()
  })

  it('should add company', async () => {
    mockingoose(Company).toReturn(mockPreCompanyData)
    const result = await companyDataAgent.createCompany(mockPreCompanyData)
    expect(result.toJSON()).toMatchObject({
      ...mockPreCompanyData,
      addedToENS: false,
      addedToMQ: false,
      komgoMnid: 'test-mnid',
      staticId: 'test-mnid',
      status: 'Ready'
    })
  })

  it('should return company', async () => {
    mockingoose(Company).toReturn(updatedCompanyData, 'findOne')
    const result = await companyDataAgent.getCompany(generatedMnid)
    expect(result.toJSON()).toMatchObject({
      ...updatedCompanyData,
      x500Name: {
        ...updatedCompanyData.x500Name,
        CN: updatedCompanyData.x500Name.O // CN should be set to O
      },
      status: Status.Ready
    })
  })

  it('should throw error if company does not exists', async () => {
    await expect(companyDataAgent.getCompany('wrong company id')).rejects.toEqual(
      ErrorUtils.notFoundException(ErrorCode.ValidationHttpContent, companyNotFoundMessage)
    )
  })

  it('should update company', async () => {
    mockingoose(Company).toReturn(updatedCompanyData, 'findOne')
    mockingoose(Company).toReturn(updatedCompanyData, 'findOneAndUpdate')
    const result = await companyDataAgent.update(generatedMnid, harborCred)
    expect(result.toJSON()).toMatchObject({
      ...updatedCompanyData,
      status: Status.Ready
    })
  })

  it('should throw error if company does not exists on update', async () => {
    mockingoose(Company).toReturn(updatedCompanyData, 'findOneAndUpdate')
    await expect(companyDataAgent.update('wrong company id', {})).rejects.toEqual(
      ErrorUtils.notFoundException(ErrorCode.ValidationHttpContent, companyNotFoundMessage)
    )
  })

  it('should delete company by staticId', async () => {
    expect.assertions(1)
    mockingoose(Company).toReturn(query => {
      expect(query.getQuery()).toMatchObject({ staticId: 'static-id' })
    }, 'deleteOne')
    await companyDataAgent.deleteCompany('static-id')
  })
})
