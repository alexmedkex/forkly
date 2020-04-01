import { getLogger } from '@komgo/logging'
import { injectable } from 'inversify'

import { ILC } from '../../../../data-layer/models/ILC'
import { COMPANY_LC_ROLE } from '../../../CompanyRole'
import { IVaktMessageNotifier } from '../../../messaging/VaktMessageNotifier'
import { ITaskCreateData } from '../../../tasks/ITaskCreateData'
import { ILCTaskProcessor } from '../../../tasks/LCTaskProcessor'
import { getCompanyLCRole } from '../../../util/getCompanyLCRole'
import getLCMetaData from '../../../util/getLCMetaData'
import { LC_STATE } from '../LCStates'
import { ILCTransitionEvent } from './ILCTransitionEvent'
import { ILCTransitionEventProcessor } from './ILCTransitionEventProcessor'

@injectable()
export abstract class LCEventBaseProcessor implements ILCTransitionEventProcessor {
  public abstract state: LC_STATE
  protected logger = getLogger('LCEventProcessors')
  private handlers = new Map<COMPANY_LC_ROLE, (lc: ILC, role: COMPANY_LC_ROLE) => Promise<void>>()

  constructor(
    protected readonly companyId: string,
    private readonly vaktMessageNotifier: IVaktMessageNotifier,
    private readonly lCTaskProcessor: ILCTaskProcessor
  ) {}

  async processStateTransition(lc: ILC, event: ILCTransitionEvent): Promise<boolean> {
    this.logger.info(`[processor ${this.state}] Processing state: [${event.stateId}]`, getLCMetaData(lc))

    await this.process(lc, event.performerId)

    return Promise.resolve(true)
  }

  protected async process(lc: ILC, performerId: string) {
    const role: COMPANY_LC_ROLE = getCompanyLCRole(this.companyId, lc)

    const handler = this.handlers.get(role)

    this.logger.info(`Current company role: ${role}`, getLCMetaData(lc))

    if (handler) {
      await handler(lc, role)
    }

    await this.resolveTask(lc, role)
    const task = await this.createTask(lc, role)
    await this.sendNotif(task, lc, this.state, role, performerId)
    await this.notifyVakt(lc, role)
  }

  protected addHandler(role: COMPANY_LC_ROLE, handler: (lc: ILC, role: COMPANY_LC_ROLE) => Promise<void>) {
    this.handlers.set(role, handler)
  }

  protected async resolveTask(lc: ILC, role: COMPANY_LC_ROLE) {
    return this.lCTaskProcessor.resolveTask(lc, this.state, role)
  }

  protected createTask(lc: ILC, role: COMPANY_LC_ROLE) {
    return this.lCTaskProcessor.createTask(lc, this.state, role)
  }

  private async notifyVakt(lc: ILC, role: COMPANY_LC_ROLE) {
    this.logger.info(`Notifying VAKT`, getLCMetaData(lc))
    await this.vaktMessageNotifier.sendVaktMessage(lc, this.state, role)
  }

  private async sendNotif(task: ITaskCreateData, lc: ILC, state: LC_STATE, role: COMPANY_LC_ROLE, performerId: string) {
    this.logger.info('sending notification', {
      state,
      role,
      performerId
    })
    if (task && task.notification) {
      // task with notification sent, skip another notif
      return
    }
    try {
      await this.lCTaskProcessor.sendStateUpdatedNotification(lc, state, role, performerId)
    } catch (err) {
      this.logger.info('Error sending notification', {
        errorObject: err
      })
      // do nothing, do not fail if just nofication fails
    }
  }
}
