import 'reflect-metadata'
import CompanyUseCase from './CompanyUseCase'
import Company from '../../data-layer/models/Company'
import { TransactionSignResult } from '../../data-layer/models/TransactionSignResult'
import Web3Instance from '../transaction-signer/Web3Instance'
import { IWeb3Instance } from '../transaction-signer/IWeb3Instance'

const validCompanyInput = new Company('test', 'test')
const validTxSignResult = new TransactionSignResult('0x0000')
const genericError = new Error('something went wrong')
const agent = {
  getCreateCompanyData: jest.fn()
}

const signer = {
  sendTransaction: jest.fn()
}

const web3: IWeb3Instance = {
  sha3: jest.fn((label: string) => '0x0'),
  eth: jest.fn()
}

const useCase = new CompanyUseCase(agent, signer, web3)

describe('createCompany', () => {
  it('should return a transaction hash.', async () => {
    agent.getCreateCompanyData.mockImplementation(() => '0x000')
    signer.sendTransaction.mockImplementation(() => validTxSignResult)

    const tx = await useCase.createCompany(validCompanyInput)

    expect(tx).toEqual('0x0000')
  })

  it('should throw if data agent throws an error', async () => {
    agent.getCreateCompanyData.mockImplementation(() => {
      throw genericError
    })
    signer.sendTransaction.mockImplementation(() => validTxSignResult)

    let error
    try {
      const tx = await useCase.createCompany(validCompanyInput)
    } catch (e) {
      error = e
    }

    expect(error).toEqual(genericError)
  })

  it('should throw if signer throws an error', async () => {
    agent.getCreateCompanyData.mockImplementation(() => '0x000')
    signer.sendTransaction.mockImplementation(() => {
      throw genericError
    })

    let error
    try {
      const tx = await useCase.createCompany(validCompanyInput)
    } catch (e) {
      error = e
    }

    expect(error).toEqual(genericError)
  })
})
