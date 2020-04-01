import { ILCTransactionManager } from '../../src/business-layer/blockchain/ILCTransactionManager'
import { injectable } from 'inversify'

@injectable()
export class LCTransactionManagerErrorMock implements ILCTransactionManager {
  deployLC(lcParams: object): Promise<string> {
    throw new Error('Method not implemented.')
  }
  async issueLC(contractAddress: string, mt700: string, reference: string): Promise<string> {
    throw new Error('')
  }
  async requestRejectLC(contractAddress: string, comment: string): Promise<string> {
    throw new Error('')
  }
  issuedLCRejectByBeneficiary(contractAddress: string, comment: string) {
    throw new Error('')
  }
  issuedLCRejectByAdvisingBank(contractAddress: string, comment: string) {
    throw new Error('')
  }
  async adviseLC(contractAddress: string): Promise<string> {
    throw new Error('')
  }
  async acknowledgeLC(contractAddress: string): Promise<string> {
    throw new Error('')
  }
}
