import { ILetterOfCreditDataAgent } from '../../src/data-layer/data-agents'
import { ILetterOfCredit, buildFakeLetterOfCredit, IDataLetterOfCredit } from '@komgo/types'

const NonImplementedError = new Error('Not implemented')

export class LetterOfCreditMockDataAgent implements ILetterOfCreditDataAgent {
  async getByContractAddress(contractAddress: string): Promise<ILetterOfCredit<IDataLetterOfCredit>> {
    return buildFakeLetterOfCredit()
  }
  async save(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>): Promise<string> {
    throw NonImplementedError
  }

  async find(query?: object, projection?: object, options?: object): Promise<ILetterOfCredit<IDataLetterOfCredit>[]> {
    throw NonImplementedError
  }

  async count(query?: object): Promise<number> {
    throw NonImplementedError
  }

  async update(
    conditions: any,
    letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>
  ): Promise<ILetterOfCredit<IDataLetterOfCredit>> {
    throw NonImplementedError
  }

  async get(staticId: string): Promise<ILetterOfCredit<IDataLetterOfCredit>> {
    return buildFakeLetterOfCredit()
  }

  async getNonce(contractAddress: string): Promise<number> {
    return 0
  }

  async getByTransactionHash(): Promise<ILetterOfCredit<IDataLetterOfCredit>> {
    return buildFakeLetterOfCredit()
  }
}
