import 'reflect-metadata'
import { LCPresentationContract } from './LCPresentationContract'
import { Web3Wrapper } from '@komgo/blockchain-access'

describe('LCPresentationContract', () => {
  it('should init ', () => {
    expect(new LCPresentationContract(Web3Wrapper.web3Instance)).toBeDefined()
  })
})
