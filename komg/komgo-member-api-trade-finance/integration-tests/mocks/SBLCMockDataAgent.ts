import { ISBLCDataAgent } from '../../src/data-layer/data-agents'
import { IStandbyLetterOfCredit, buildFakeStandByLetterOfCredit } from '@komgo/types'

const NonImplementedError = new Error('Not implemented')

export class SBLCMockDataAgent implements ISBLCDataAgent {
  async getByContractAddress(contractAddress: string): Promise<IStandbyLetterOfCredit> {
    return buildFakeStandByLetterOfCredit()
  }
  async save(sblc: IStandbyLetterOfCredit): Promise<string> {
    throw NonImplementedError
  }

  async find(query?: object, projection?: object, options?: object): Promise<IStandbyLetterOfCredit[]> {
    throw NonImplementedError
  }

  async count(query?: object): Promise<number> {
    throw NonImplementedError
  }

  async update(conditions: any, sblc: IStandbyLetterOfCredit): Promise<IStandbyLetterOfCredit> {
    throw NonImplementedError
  }

  async get(staticId: string): Promise<IStandbyLetterOfCredit> {
    return buildFakeStandByLetterOfCredit()
  }

  async getNonce(contractAddress: string): Promise<number> {
    return 0
  }
}
