import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { injectable } from 'inversify'
import * as _ from 'lodash'

import { ErrorName } from '../../utils/Constants'
import { DataAccessException, DATA_ACCESS_ERROR } from '../exceptions/DataAccessException'
import { ITimer } from '../models/ITimer'
import { TimerDataStatus } from '../models/TimerDataStatus'
import { TimerStatus } from '../models/TimerStatus'
import { TimerRepo } from '../mongodb/TimerRepo'
import { flattenFieldQuery } from '../utils/query-utils'

import { ITimerDataAgent } from './ITimerDataAgent'

@injectable()
export default class TimerDataAgent implements ITimerDataAgent {
  private readonly logger = getLogger('TimerDataAgent')
  private readonly notImplemented = this.notImplemented

  async create(timer: ITimer): Promise<string> {
    try {
      const { staticId } = await TimerRepo.create(timer)
      return staticId
    } catch (err) {
      this.timerError(err)
    }
  }

  async update(staticId: string, data: ITimer): Promise<void> {
    throw new DataAccessException(DATA_ACCESS_ERROR.NOT_IMPLEMENTED, this.notImplemented)
  }

  public async updateField(staticId: string, field: string, value: any) {
    try {
      await TimerRepo.findOneAndUpdate({ staticId }, { $set: { [field]: value } })
    } catch (err) {
      this.timerError(err)
    }
  }

  public async updatePushArray(staticId: string, field: string, value: any) {
    try {
      await TimerRepo.findOneAndUpdate({ staticId }, { $push: { [field]: value } })
    } catch (err) {
      this.timerError(err)
    }
  }

  async updateStatus(staticId: string, status: TimerStatus): Promise<void> {
    const timer = await this.getByStaticId(staticId)

    if (timer.status === status) {
      this.logger.error(ErrorCode.DatabaseInvalidData, ErrorName.InvalidTimerData, {
        staticId
      })
      throw new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, `Timer is already is status ${status}`)
    }

    timer.updatedAt = new Date()
    timer.status = status
    timer.timerData.forEach(data => {
      if (_.find(this.allowedStatusChange(status), s => s !== data.status)) {
        data.status = status
      }
    })

    try {
      await timer.save()
    } catch (err) {
      this.timerError(err)
    }
  }

  async delete(staticId: string): Promise<void> {
    const timer = await this.getByStaticId(staticId)

    if (timer.deletedAt) {
      this.logger.error(ErrorCode.DatabaseInvalidData, ErrorName.InvalidTimerData, {
        staticId
      })
      throw new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, `Timer is already deleted`)
    }

    timer.set({
      deletedAt: new Date()
    })

    try {
      await timer.save()
    } catch (err) {
      this.timerError(err)
    }
  }

  async get(staticId: string): Promise<ITimer> {
    return this.getByStaticId(staticId)
  }

  async find(query: object, context: object, projection?: object, options?: object): Promise<any[]> {
    try {
      const result = await TimerRepo.find({
        ...query,
        ...flattenFieldQuery(context, 'context')
      })

      return result
    } catch (err) {
      this.timerError(err)
    }
  }

  async findOne(query: object) {
    throw new DataAccessException(DATA_ACCESS_ERROR.NOT_IMPLEMENTED, this.notImplemented)
  }

  async count(query?: object): Promise<number> {
    throw new DataAccessException(DATA_ACCESS_ERROR.NOT_IMPLEMENTED, this.notImplemented)
  }

  private async getByStaticId(staticId: string): Promise<any> {
    let timer = null
    try {
      timer = await TimerRepo.findOne({ staticId })
    } catch (err) {
      this.timerError(err)
    }

    if (!timer) {
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.MissingTimerDataForStaticId, {
        staticId
      })
      throw new DataAccessException(DATA_ACCESS_ERROR.NOT_FOUND, ErrorName.MissingTimerDataForStaticId, null)
    }

    if (timer.deletedAt) {
      this.logger.error(ErrorCode.DatabaseInvalidData, ErrorName.InvalidTimerData, {
        staticId
      })
      throw new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, `Timer is deleted`)
    }

    return timer
  }

  private timerError(err) {
    if (err instanceof DataAccessException) {
      throw err
    }

    const errors = err && err.errors ? err.errors : null

    if (err.name === 'ValidationError') {
      this.logger.error(ErrorCode.DatabaseInvalidData, ErrorName.InvalidTimerData, {
        err: err.message,
        errorName: err.name
      })

      throw new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, err.message, errors)
    }

    this.logger.error(ErrorCode.UnexpectedError, ErrorName.UnexpectedError, {
      err: err.message,
      errorName: err && err.name ? err.name : null
    })

    throw new DataAccessException(DATA_ACCESS_ERROR.GENERAL_ERROR, err.message, errors)
  }

  private allowedStatusChange(status: TimerStatus): TimerDataStatus[] {
    switch (status) {
      case TimerStatus.Closed:
        return [TimerDataStatus.Completed, TimerDataStatus.Cancelled]
      case TimerStatus.Cancelled:
        return [TimerDataStatus.Completed, TimerDataStatus.Closed]
      case TimerStatus.Completed:
        return [TimerDataStatus.Cancelled, TimerDataStatus.Closed]
      default:
        return []
    }
  }
}
