import { ILCTransactionManager } from '../../src/business-layer/blockchain/ILCTransactionManager'
import { injectable } from 'inversify'

@injectable()
export class LCTransactionManagerMock implements ILCTransactionManager {
  deployLC(lcParams: object): Promise<string> {
    throw new Error('Method not implemented.')
  }
  async issueLC(contractAddress: string, mt700: string, reference: string): Promise<string> {
    return '0x660f1b5240d4f6cd25fadb899340caccd19255fbfd713ada1bb6b450950ad1b7'
  }
  async requestRejectLC(contractAddress: string, comment: string): Promise<string> {
    return '0x660f1b5240d4f6cd25fadb899340caccd19255fbfd713ada1bb6b450950ad1b7'
  }
  issuedLCRejectByBeneficiary(contractAddress: string, comment: string) {
    return '0x660f1b5240d4f6cd25fadb899340caccd19255fbfd713ada1bb6b450950ad1b7'
  }
  issuedLCRejectByAdvisingBank(contractAddress: string, comment: string) {
    return '0x660f1b5240d4f6cd25fadb899340caccd19255fbfd713ada1bb6b450950ad1b7'
  }
  async adviseLC(contractAddress: string): Promise<string> {
    return '0x660f1b5240d4f6cd25fadb899340caccd19255fbfd713ada1bb6b450950ad1b7'
  }
  async acknowledgeLC(contractAddress: string): Promise<string> {
    return '0x660f1b5240d4f6cd25fadb899340caccd19255fbfd713ada1bb6b450950ad1b7'
  }
}
