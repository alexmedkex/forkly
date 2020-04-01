import { LC_STATE } from './events/LC/LCStates'
import { getCompanyLCRole } from './util/getCompanyLCRole'
import { COMPANY_LC_ROLE } from './CompanyRole'
import { ILC } from '../data-layer/models/ILC'
import { injectable } from 'inversify'
import { ILCTaskProcessor } from './tasks/LCTaskProcessor'
import { getLogger } from '@komgo/logging'
import { ILCCacheDataAgent } from '../data-layer/data-agents'
import { TaskStatus } from '@komgo/notification-publisher'
import { InvalidOperationException } from '../exceptions'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../exceptions/utils'

@injectable()
export abstract class LCActionBaseUseCase {
  protected state: LC_STATE
  protected abstract companyRole: COMPANY_LC_ROLE
  protected baseLogger = getLogger('LCActionBaseUseCase')

  constructor(
    protected readonly companyId: string,
    private readonly taskProcessor: ILCTaskProcessor,
    private readonly lcCacheDataAgent: ILCCacheDataAgent
  ) {}

  protected async executeUseCase(lc, destinationState: LC_STATE, useCaseData?: { [s: string]: any }) {
    const role = getCompanyLCRole(this.companyId, lc)
    this.checkIfCanExecute(lc, role, destinationState)

    await this.updateTask(lc, destinationState, role, TaskStatus.Pending)
    try {
      const transactionResult = await this.sendTransaction(lc, useCaseData)
      await this.updateLcStateDestination(lc, destinationState)

      return transactionResult
    } catch (e) {
      this.baseLogger.error(
        ErrorCode.UnexpectedError,
        ErrorNames.LCActionExecuteUseCaseFailed,
        `LC Use Case action failed`,
        { lcReference: lc.reference },
        new Error().stack
      )

      // set the task back to ToDo from Pending and re throw the original error
      await this.updateTask(lc, destinationState, role, TaskStatus.ToDo)
      throw e
    }
  }

  protected checkIfCanExecute(lc: ILC, role: COMPANY_LC_ROLE, destinationState: LC_STATE): any {
    if (role !== this.companyRole) {
      this.baseLogger.error(
        ErrorCode.ValidationInvalidOperation,
        ErrorNames.InvalidCompanyRole,
        `Only company with LC role [${this.companyRole}] can execute. Currently company is: [${role}]`,
        { lcReference: lc.reference },
        new Error().stack
      )
      throw new InvalidOperationException(
        `Only company with LC role [${this.companyRole}] can execute. Currently company is: [${role}]`
      )
    }

    this.checkLcStateValid(lc)

    // If the destinationState has already been set it means this use case has already been carried out
    if (lc.destinationState === destinationState) {
      this.baseLogger.error(
        ErrorCode.ValidationInvalidOperation,
        ErrorNames.InvalidLCTransition,
        `Lc transition to ${destinationState} is already in progress`,
        {
          role,
          destinationState
        },
        new Error().stack
      )
      throw new InvalidOperationException(`Lc transition to ${destinationState} is already in progress`)
    }
  }

  protected checkLcStateValid(lc: ILC) {
    if (lc.status !== this.state) {
      this.baseLogger.error(
        ErrorCode.ValidationInvalidOperation,
        ErrorNames.InvalidLCStatus,
        { lcReference: lc.reference },
        new Error().stack
      )
      throw new InvalidOperationException(
        `Only lc in status [${this.state}] can be processed. Currently status is: [${lc.status}]`
      )
    }
  }

  /**
   * This will send the releavant LC data in a tranaction to the blockchain
   * @param lc the LC being acted on
   * @param useCaseData any extra data that needs to be sent as part of the transaction
   */
  protected abstract sendTransaction(lc: ILC, useCaseData?: { [s: string]: any })

  private async updateLcStateDestination(lc: ILC, destinationState: LC_STATE) {
    // Swallow the exception and carry on. If the lc.destinationState does not get updated the worst case is
    // that the user can resubmit the transaction which should fail and be dealt with seperately
    try {
      await this.lcCacheDataAgent.updateField(lc._id, 'destinationState', destinationState)
    } catch (e) {
      this.baseLogger.info('Failed to update lc.destinationState, continuing...')
    }
  }

  private async updateTask(lc: any, destinationState: LC_STATE, role: COMPANY_LC_ROLE, taskStatus: TaskStatus) {
    try {
      await this.taskProcessor.updateTask(lc, destinationState, role, taskStatus)
    } catch (e) {
      this.baseLogger.info('Failed to set Task status, continuing...', {
        taskStatus,
        destinationState
      })
    }
  }
}
