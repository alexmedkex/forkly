import 'reflect-metadata'
import { ILetterOfCreditTransactionManager } from '../../src/business-layer/letter-of-credit/tx-managers'
import { ILetterOfCredit, IDataLetterOfCredit } from '@komgo/types'
import { injectable } from 'inversify'
import { MicroserviceConnectionException } from '../../src/exceptions'

@injectable()
export class LetterOfCreditTransactionManagerMock implements ILetterOfCreditTransactionManager {
  public static TRANSACTION_HASH = '1212121212121212121212121212121212121212111111111111111111111111'

  deploy(params: ILetterOfCredit<IDataLetterOfCredit>): Promise<any> {
    return null
  }
  issue(contractAddress: string, params: ILetterOfCredit<IDataLetterOfCredit>): Promise<any> {
    return null
  }
  requestReject(contractAddress: string): Promise<any> {
    return null
  }
}
