import 'reflect-metadata'
import CompanyDataAgent from './CompanyDataAgent'
import { IContractArtifacts } from '../smart-contracts/IContractArtifacts'
import Company from '../models/Company'
import { TransactionData } from '../models/TransactionData'

const genericError = new Error('Error: something went wrong')
const VALID_HASH = '0x0'
const newCompany = new Company('a', 'b')

const returnRegisterData: MockInstance = jest.fn(async () => {
  return VALID_HASH
})

const mockKomgoRegistrarInstance = {
  address: VALID_HASH,
  contract: {
    registerAndSetResolvers: {
      getData: returnRegisterData
    }
  }
}

const mockContractArtifacts: IContractArtifacts = {
  komgoRegistrar: () => mockKomgoRegistrarInstance
}

describe('addCompany', () => {
  let companyDataAgent

  beforeEach(() => {
    companyDataAgent = new CompanyDataAgent(mockContractArtifacts)
  })

  it('should return the hash if getData succeeds.', async () => {
    const data = await companyDataAgent.getCreateCompanyData('company1.komgo', VALID_HASH)

    expect(data).toEqual(new TransactionData(VALID_HASH, VALID_HASH))
  })

  it('should throw an error if getData fails', async () => {
    returnRegisterData.mockReturnValue(Promise.reject(genericError))

    const asyncData = companyDataAgent.getCreateCompanyData('com.komgo', newCompany)

    await expect(asyncData).rejects.toBeDefined()
  })
})
