import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ErrorUtils, HttpException } from '@komgo/microservice-config'
import {
  Body,
  Controller,
  Get,
  Post,
  Route,
  Security,
  SuccessResponse,
  Tags,
  Delete,
  Path,
  Query,
  Put,
  Response
} from 'tsoa'

import { ITimerScheduleService } from '../../business-layer/schedule/TimerScheduleService'
import { ITimerDataAgent } from '../../data-layer/data-agents/ITimerDataAgent'
import { ITimer } from '../../data-layer/models/ITimer'
import { TimerStatus } from '../../data-layer/models/TimerStatus'
import { inject, provideSingleton } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { ICreateTimerRequest } from '../requests/timer'
import { ICreateTimerResponse } from '../responses/timer/ICreateTimerResponse'
import { IGetTimerResponse } from '../responses/timer/IGetTimerResponse'
import { HttpServerMessages } from '../utils/HttpConstants'

@Tags('Timers')
@Route('timers')
@provideSingleton(TimersController)
export class TimersController extends Controller {
  private readonly logger = getLogger('TimersController')

  constructor(
    @inject(TYPES.TimerDataAgent) private timerDataAgent: ITimerDataAgent,
    @inject(TYPES.TimerScheduleService) private readonly timerScheduleService: ITimerScheduleService
  ) {
    super()
  }

  /**
   * Create new timer with received arguments. Scheduler in the background also will be started immediately.
   *
   * @summary Create new Timer
   *
   * @param {ICreateTimerRequest} timerRequest Spec of the new timer
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('internal')
  @Post('')
  @SuccessResponse(201, 'Created')
  public async create(@Body() timerRequest: ICreateTimerRequest): Promise<ICreateTimerResponse> {
    this.logger.info('Creating timer')
    const timer: ITimer = this.mapTimerCreateRequest(timerRequest)
    const staticId = await this.timerDataAgent.create(timer)
    await this.timerScheduleService.scheduleJobs(staticId)

    this.setStatus(201)
    return { staticId }
  }

  /**
   * Deactivate the existing timer by timerStaticId. Scheduler in the background will also be deactivated.
   *
   * @summary Deactivate the existing timer by id
   *
   * @param {string} id timerStaticId
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('internal')
  @Put('{id}/deactivate')
  @SuccessResponse(200, 'Timer successfully deactivated')
  public async deactivate(@Path() id: string): Promise<void> {
    this.logger.info('Timer deactivate', {
      timerStaticId: id
    })
    await this.timerScheduleService.stopTimer(id, TimerStatus.Closed)
    this.setStatus(200)
  }

  /**
   * Cancel the existing timer by timerStaticId. Scheduler in the background will also be canceled.
   *
   * @summary Cancel the existing timer by id
   *
   * @param {string} id timerStaticId
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('internal')
  @Put('{id}/cancel')
  @SuccessResponse(200, 'Timer successfully cancelled')
  public async cancel(@Path() id: string): Promise<void> {
    this.logger.info('Timer cancel', {
      timerStaticId: id
    })
    await this.timerScheduleService.stopTimer(id, TimerStatus.Cancelled)
    this.setStatus(200)
  }

  /**
   * Delete the existing timer by timerStaticId. Delete timer means just to set deletedAt date (Soft delete).
   *
   * @summary Delete the existing timer by id
   *
   * @param {string} id timerStaticId
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('internal')
  @Delete('{id}')
  @SuccessResponse(204, 'Timer successfully deleted')
  public async delete(@Path() id: string): Promise<void> {
    this.logger.info('Timer delete', {
      timerStaticId: id
    })
    await this.timerScheduleService.stopTimer(id, TimerStatus.Cancelled)
    await this.timerDataAgent.delete(id)
    this.setStatus(204)
  }

  /**
   * Get all timers. Timer can be filtered by timer context that is proveded in GET request.
   *
   * @summary Get all timers
   *
   * @param {string} context Timer context filter
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('internal')
  @Get()
  @SuccessResponse(200, 'GET')
  public async getTimers(@Query('context') context?: string): Promise<IGetTimerResponse[]> {
    const filter = this.parseContext(context)
    const result = await this.timerDataAgent.find(null, filter)
    return result
  }

  /**
   * Return timer by id.
   *
   * @summary Get timer by id.
   *
   * @param {string} id of the timer
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('internal')
  @Get('{id}')
  @SuccessResponse(200, 'GET')
  public async getById(@Path('id') id: string): Promise<IGetTimerResponse> {
    const result = await this.timerDataAgent.get(id)
    return result
  }

  private mapTimerCreateRequest(timerRequest: ICreateTimerRequest): ITimer {
    return {
      ...timerRequest,
      submissionDateTime: new Date(),
      context: timerRequest.context
    }
  }

  private parseContext(context) {
    try {
      return JSON.parse(context)
    } catch (err) {
      this.logger.error(ErrorCode.ValidationHttpSchema, 'ContextObjectError', err.message)
      throw ErrorUtils.badRequestException(
        ErrorCode.ValidationHttpSchema,
        'Invalid timer request. Context is not valid',
        null
      )
    }
  }
}
