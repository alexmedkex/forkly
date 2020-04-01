import 'reflect-metadata'
import AttributeUseCase from './AttributeUseCase'
import Attribute from '../../data-layer/models/Attribute'
import { TransactionSignResult } from '../../data-layer/models/TransactionSignResult'
import AttributeDataAgent from '../../data-layer/data-agents/AttributeDataAgent'
import TransactionSigner from '../transaction-signer/TransactionSigner'

const validNodeInput = 'test'
const validAttributeInput = new Attribute('test', 'test')
const validTxSignResult = new TransactionSignResult('0x0000')

const agent = {
  getAddAttributeData: jest.fn()
}

const signer = {
  sendTransaction: jest.fn()
}

const useCase = new AttributeUseCase(agent, signer)

describe('addAttribute', () => {
  it('should add an attribute and return a transaction hash.', async () => {
    agent.getAddAttributeData.mockImplementation(() => '0x000')
    signer.sendTransaction.mockImplementation(() => validTxSignResult)
    const tx = await useCase.addAttribute(validNodeInput, validAttributeInput)
    expect(tx).toEqual('0x0000')
  })
})
