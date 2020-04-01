import { inject, injectable } from 'inversify'
import { ITimerServiceClient } from './ITimerServiceClient'
import { TYPES } from '../../inversify/types'
import { ILC } from '../../data-layer/models/ILC'
import { ITimerRequestBuilder } from './TimerRequestBuilder'
import { getLogger } from '@komgo/logging'
import { ICreateTimerResponse } from './ITimer'
import { ILCCacheDataAgent } from '../../data-layer/data-agents'
import { COMPANY_LC_ROLE } from '../CompanyRole'
import {
  getTimerHalfwayNotification,
  getTimerExpiredNotification
} from '../messaging/notifications/notificationBuilder'
import { ICompanyRegistryService } from '../../service-layer/ICompanyRegistryService'
import { ITimerService } from './TimerService'
import { TimerDurationUnit, TimerType } from '@komgo/types'

export interface ILCTimerService {
  lcIssuanceTimer(lc: ILC, companyRole: COMPANY_LC_ROLE): Promise<ICreateTimerResponse>
  lcDeactiveIssuanceTimer(lc: ILC): Promise<void>
}

@injectable()
export class LCTimerService implements ILCTimerService {
  private logger = getLogger('LCTimerService')
  private readonly halfway = 2

  constructor(
    @inject(TYPES.LCCacheDataAgent) private readonly lcCacheDataAgent: ILCCacheDataAgent,
    @inject(TYPES.TimerService) private readonly timerService: ITimerService,
    @inject(TYPES.TimerRequestBuilder) private readonly timerRequestBuilder: ITimerRequestBuilder,
    @inject(TYPES.CompanyRegistryService) private readonly companyRegistryService: ICompanyRegistryService
  ) {}

  async lcIssuanceTimer(lc: ILC, companyRole: COMPANY_LC_ROLE): Promise<ICreateTimerResponse> {
    if (!lc.issueDueDate) {
      throw new Error('Issue due date not set')
    }
    const applicant = await this.getCompanyName(lc.applicantId)
    try {
      const timer = {
        unit: lc.issueDueDate.unit as TimerDurationUnit,
        duration: lc.issueDueDate.duration,
        timerType: TimerType.CalendarDays
      }

      const response = await this.timerService.createTimer(
        timer,
        [
          {
            notification: getTimerHalfwayNotification(lc, companyRole, applicant),
            factor: this.halfway
          },
          {
            notification: getTimerExpiredNotification(lc, companyRole),
            factor: 1
          }
        ],
        this.timerRequestBuilder.createLCTimerContext(lc)
      )

      if (response && response.staticId) {
        lc.issueDueDate.timerStaticId = response.staticId
        lc.issueDueDate.timerType = TimerType.CalendarDays
        await this.lcCacheDataAgent.updateField(lc._id, 'issueDueDate', lc.issueDueDate)
      }
      return response
    } catch (error) {
      this.logger.info('Timer save failed, continuing...')
    }
  }

  async lcDeactiveIssuanceTimer(lc: ILC): Promise<void> {
    if (lc.issueDueDate && lc.issueDueDate.timerStaticId) {
      await this.timerService.deactivateTimer(lc.issueDueDate.timerStaticId)
    }
  }

  private async getCompanyName(companyId: string) {
    const response = await this.companyRegistryService.getMember(companyId)
    const company = response && response.data ? response.data[0] : null

    return company ? company.x500Name.CN : ''
  }
}
