import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ErrorUtils } from '@komgo/microservice-config'
import {
  DepositLoanType,
  IDepositLoanResponse,
  ISaveDepositLoan,
  IDepositLoan,
  ISharedDepositLoan,
  ISaveSharedDepositLoan
} from '@komgo/types'
import { injectable, inject } from 'inversify'

import { IDepositLoanDataAgent } from '../../data-layer/data-agents/IDepositLoanDataAgent'
import { ISharedDepositLoanDataAgent } from '../../data-layer/data-agents/ISharedDepositLoanDataAgent'
import { TYPES } from '../../inversify/types'
import { ErrorName } from '../../utils/Constants'

import { IDepositLoanRequestService } from './DepositLoanRequestService'
import { ShareDepositLoanService } from './ShareDepositLoanService'

export interface IDepositLoanService {
  get(type: DepositLoanType, staticId: string): Promise<IDepositLoanResponse>
  find(type: DepositLoanType, query: object, projection?: object, options?: object): Promise<IDepositLoanResponse[]>
  create(type: DepositLoanType, request: ISaveDepositLoan): Promise<string>
  update(type: DepositLoanType, staticId: string, request: ISaveDepositLoan): Promise<void>
  delete(type: DepositLoanType, staticId: string): Promise<void>
}

@injectable()
export default class DepositLoanService implements IDepositLoanService {
  private readonly logger = getLogger('DepositLoanService')

  constructor(
    @inject(TYPES.DepositLoanRequestService) private readonly requestService: IDepositLoanRequestService,
    @inject(TYPES.DepositLoanDataAgent) private readonly depositLoanDataAgent: IDepositLoanDataAgent,
    @inject(TYPES.SharedDepositLoanDataAgent) private readonly sharedDepositLoanDataAgent: ISharedDepositLoanDataAgent,
    @inject(TYPES.ShareDepositLoanService) private readonly shareDepositLoanService: ShareDepositLoanService
  ) {}

  async get(type: DepositLoanType, staticId: string): Promise<IDepositLoanResponse> {
    const depositLoan = await this.depositLoanDataAgent.get(staticId)
    const sharedDepositLoan = await this.sharedDepositLoanDataAgent.find({ depositLoanStaticId: staticId })

    return {
      ...depositLoan,
      sharedWith: sharedDepositLoan
    }
  }

  async find(
    type: DepositLoanType,
    query: object,
    projection?: object,
    options?: object
  ): Promise<IDepositLoanResponse[]> {
    const filter = {
      ...query,
      type
    }

    const depositLoans = await this.depositLoanDataAgent.find(filter, projection, options)

    return Promise.all(depositLoans.map(item => this.getSharedDepositLoan(item)))
  }

  async create(type: DepositLoanType, request: ISaveDepositLoan): Promise<string> {
    this.logger.info(`Creating ${type}`)
    try {
      await this.checkDepositLoanExists(type, request)

      const { sharedWith, ...depositLoan } = request
      const depositLoanData = depositLoan as IDepositLoan
      const staticId = await this.depositLoanDataAgent.create(depositLoanData)
      depositLoanData.staticId = staticId

      const sharedWithData = sharedWith || []
      await Promise.all(sharedWithData.map(shared => this.createSharedWithData(shared, depositLoanData)))

      await this.closeNewRequestsForCompany(depositLoanData)

      return staticId
    } catch (err) {
      this.logger.error(ErrorCode.UnexpectedError, ErrorName.DepositLoanCreateFailed, {
        type,
        err: err.message,
        errorObject: err
      })
      throw err
    }
  }

  async update(type: DepositLoanType, staticId: string, request: ISaveDepositLoan): Promise<void> {
    this.logger.info(`Updating ${type}`, {
      type: request.type,
      staticId
    })
    try {
      const { sharedWith, ...data } = request
      const depositLoan = { ...data, staticId }
      const depositLoanData = depositLoan as IDepositLoan

      const existingDepositLoan = await this.depositLoanDataAgent.get(staticId)
      const savedDepositLoan = await this.depositLoanDataAgent.update(depositLoanData)

      const sharedWithData = sharedWith || []
      const existingSharedDepositLoans = await this.sharedDepositLoanDataAgent.find({ depositLoanStaticId: staticId })

      await Promise.all(
        sharedWithData.map(shared => {
          return this.updateSharedDepositLoans(depositLoanData, shared, existingSharedDepositLoans, existingDepositLoan)
        })
      )

      const deletedSharedDepositLoans = existingSharedDepositLoans.filter(existingdhared =>
        sharedWithData.every(shared => shared.sharedWithStaticId !== existingdhared.sharedWithStaticId)
      )

      await Promise.all(
        deletedSharedDepositLoans.map(async deleted => {
          await this.sharedDepositLoanDataAgent.delete(deleted.staticId)
          await this.shareDepositLoanService.process(null, deleted, savedDepositLoan, existingDepositLoan)
        })
      )

      await this.closeNewRequestsForCompany(depositLoanData)
    } catch (err) {
      this.logger.error(ErrorCode.UnexpectedError, ErrorName.DepositLoanUpdateFailed, {
        type: request.type,
        err: err.message,
        errorObject: err
      })
      throw err
    }
  }

  async closeNewRequestsForCompany(depositLoan: IDepositLoan) {
    // close all new requests that hasn't been responded to
    return this.requestService.closeAllPendingRequests(
      depositLoan.type,
      depositLoan.currency,
      depositLoan.period,
      depositLoan.periodDuration
    )
  }

  async delete(type: DepositLoanType, staticId: string): Promise<void> {
    const existingDepositLoan = await this.depositLoanDataAgent.findOne({ staticId })
    await this.depositLoanDataAgent.delete(staticId)

    const existingSharedDepositLoan = await this.sharedDepositLoanDataAgent.find({ depositLoanStaticId: staticId })
    await Promise.all(
      existingSharedDepositLoan.map(async deleted => {
        this.logger.info(`Deleting shared deposit / loan: ${deleted.staticId}`)
        await this.sharedDepositLoanDataAgent.delete(deleted.staticId)
        await this.shareDepositLoanService.process(null, deleted, null, existingDepositLoan)
      })
    )

    if (existingDepositLoan) {
      await this.closeNewRequestsForCompany(existingDepositLoan)
    }
  }

  private async getSharedDepositLoan(depositLoan: IDepositLoan): Promise<IDepositLoanResponse> {
    const sharedDepositLoans = await this.sharedDepositLoanDataAgent.find({ depositLoanStaticId: depositLoan.staticId })

    return {
      ...depositLoan,
      sharedWith: sharedDepositLoans
    }
  }

  private async checkDepositLoanExists(type: DepositLoanType, request: ISaveDepositLoan) {
    const key = {
      currency: request.currency,
      period: request.period,
      periodDuration: request.periodDuration
    }

    const existing = await this.depositLoanDataAgent.findOne({
      type,
      ...key
    })

    if (existing) {
      this.logger.error(
        ErrorCode.ValidationHttpContent,
        ErrorName.DepositLoanInvalidData,
        `${type} with specified parameters already exists`,
        {
          ...key
        }
      )

      throw ErrorUtils.conflictException(
        ErrorCode.DatabaseInvalidData,
        `${type} with specified parameters already exists`,
        {
          parameters: [Object.keys(key).reduce((val, k) => val + ` ${k}:${key[k]};`, `type: ${type};`)]
        }
      )
    }
  }

  private async updateSharedDepositLoans(
    depositLoan: IDepositLoan,
    shared: ISaveSharedDepositLoan,
    existingSharedDepositLoan: ISharedDepositLoan[],
    existingDepositLoan: IDepositLoan
  ) {
    const existing = existingSharedDepositLoan.find(x => shared.sharedWithStaticId === x.sharedWithStaticId)
    try {
      if (existing) {
        this.logger.info('Updating shared deposit/loan', { staticId: existing.staticId })
        const sharedDepositLoanData = {
          ...shared,
          staticId: existing.staticId,
          depositLoanStaticId: depositLoan.staticId,
          createdAt: undefined,
          updatedAt: undefined
        }
        await this.sharedDepositLoanDataAgent.update(sharedDepositLoanData)

        return this.shareDepositLoanService.process(sharedDepositLoanData, existing, depositLoan, existingDepositLoan)
      }
    } catch (err) {
      this.logger.error(ErrorCode.UnexpectedError, ErrorName.SharedDepositLoanUpdateFailed, {
        depositLoanStaticId: depositLoan.staticId,
        sharedWithStaticId: shared.sharedWithStaticId,
        err: err.message,
        errorObject: err
      })
      throw err
    }

    return this.createSharedWithData(shared, depositLoan)
  }

  private async createSharedWithData(sharedDepositLoan: ISaveSharedDepositLoan, depositLoan: IDepositLoan) {
    this.logger.info('Creating shared deposit loan')

    try {
      const data: ISharedDepositLoan = {
        ...sharedDepositLoan,
        depositLoanStaticId: depositLoan.staticId,
        staticId: undefined,
        createdAt: undefined,
        updatedAt: undefined
      }
      const staticId = await this.sharedDepositLoanDataAgent.create(data)

      data.staticId = staticId
      return this.processAddedDepositLoan(data, depositLoan)
    } catch (err) {
      this.logger.error(ErrorCode.UnexpectedError, ErrorName.SharedCLCreateFailed, {
        depositLoanStaticId: depositLoan.staticId,
        err: err.message,
        errorObject: err
      })
      throw err
    }
  }

  private async processAddedDepositLoan(sharedDepositLoan: ISharedDepositLoan, depositLoan: IDepositLoan) {
    return this.shareDepositLoanService.process(sharedDepositLoan, null, depositLoan, null)
  }
}
