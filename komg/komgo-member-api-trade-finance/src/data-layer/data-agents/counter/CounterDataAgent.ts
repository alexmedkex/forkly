import { injectable } from 'inversify'

import { getLogger } from '@komgo/logging'
import { CounterRepo } from '../../mongodb/counter/CounterRepo'
import { ICounterDataAgent } from './ICounterDataAgent'
import { ICounter } from '../../models'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../../exceptions/utils'
import { DatabaseConnectionException } from '../../../exceptions'

@injectable()
export class CounterDataAgent implements ICounterDataAgent {
  private logger = getLogger('CounterDataAgent')

  public async getCounterAndUpdate(type: string, context: any): Promise<number> {
    let counter: ICounter
    try {
      counter = await CounterRepo.findOneAndUpdate(
        {
          type,
          context
        },
        { $inc: { value: 1 } },
        {
          new: true,
          upsert: true
        }
      )
    } catch (e) {
      const error = `Failed to get counter and update it ${type} ${context} ${e.message}`
      this.logger.error(ErrorCode.ConnectionDatabase, ErrorNames.GetCounterAndUpdateFailed, {
        error,
        message: e.message
      })
      throw new DatabaseConnectionException(error)
    }
    return counter.value
  }
}
