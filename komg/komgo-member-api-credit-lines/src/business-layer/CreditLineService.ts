import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ErrorUtils } from '@komgo/microservice-config'
import {
  ISharedCreditLine,
  ICreditLineSaveRequest,
  ISharedCreditLineRequest,
  ICreditLine,
  ICreditLineResponse,
  IInformationShared,
  IProductContext
} from '@komgo/types'
import { injectable, inject } from 'inversify'

import { ICreditLineDataAgent } from '../data-layer/data-agents/ICreditLineDataAgent'
import { ISharedCreditLineDataAgent } from '../data-layer/data-agents/ISharedCreditLineDataAgent'
import { TYPES } from '../inversify/types'
import { ErrorName } from '../utils/Constants'

import { ICreditLineRequestService } from './CreditLineRequestService'
import { ShareCreditLineService } from './ShareCreditLineService'

export interface ICreditLineService {
  get(staticId: string): Promise<ICreditLineResponse>
  find(query: object, projection?: object, options?: object): Promise<ICreditLineResponse[]>
  findOne(query: object, projection?: object, options?: object): Promise<ICreditLineResponse>
  create(request: ICreditLineSaveRequest): Promise<string>
  update(staticId: string, request: ICreditLineSaveRequest): Promise<void>
  delete(staticId: string): Promise<void>
  getByProduct(productId: string, subproductId: string, counterpartyStaticId: string): Promise<ICreditLineResponse>
}

@injectable()
export default class CreditLineService implements ICreditLineService {
  private readonly logger = getLogger('CreditLineService')

  constructor(
    @inject(TYPES.ShareCreditLineService) private readonly shareCreditLineService: ShareCreditLineService,
    @inject(TYPES.CreditLineRequestService) private readonly creditLineRequestService: ICreditLineRequestService,
    @inject(TYPES.CreditLineDataAgent) private readonly creditLineDataAgent: ICreditLineDataAgent,
    @inject(TYPES.SharedCreditLineDataAgent) private readonly sharedCreditLineDataAgent: ISharedCreditLineDataAgent
  ) {}

  async get(staticId: string): Promise<ICreditLineResponse> {
    const creditLine = await this.creditLineDataAgent.get(staticId)
    const sharedCreditLines = await this.sharedCreditLineDataAgent.find({ creditLineStaticId: staticId })

    return {
      ...creditLine,
      sharedCreditLines
    }
  }

  async getSharedCreditLine(creditLine: ICreditLine): Promise<ICreditLineResponse> {
    const sharedCreditLines = await this.sharedCreditLineDataAgent.find({ creditLineStaticId: creditLine.staticId })

    return {
      ...creditLine,
      sharedCreditLines
    }
  }

  async find(query: object, projection?: object, options?: object): Promise<ICreditLineResponse[]> {
    const creditLines = await this.creditLineDataAgent.find(query, projection, options)

    return Promise.all(creditLines.map(creditLine => this.getSharedCreditLine(creditLine)))
  }

  async findOne(query: object, projection?: object, options?: object): Promise<ICreditLineResponse> {
    const creditLine = await this.creditLineDataAgent.findOne(query, projection, options)

    const sharedCreditLines = await this.sharedCreditLineDataAgent.find({ creditLineStaticId: creditLine.staticId })

    return {
      ...creditLine,
      sharedCreditLines
    }
  }

  async create(request: ICreditLineSaveRequest): Promise<string> {
    this.logger.info('Creating credit line', { counterpartyStaticId: request.counterpartyStaticId })
    try {
      await this.checkCreditLineExists(request)

      const { sharedCreditLines, ...creditLine } = request
      const creditLineData = creditLine as ICreditLine
      const creditLineStaticId = await this.creditLineDataAgent.create(creditLineData)
      creditLineData.staticId = creditLineStaticId

      const sharedCL = sharedCreditLines || []
      await Promise.all(sharedCL.map(shared => this.createSharedCreditLine(shared, creditLineData)))

      await this.closeNewRequestsForCompany(creditLineData.counterpartyStaticId, creditLine.context)

      return creditLineStaticId
    } catch (err) {
      this.logger.error(ErrorCode.UnexpectedError, ErrorName.CreditLineCreateFailed, {
        counterpartyStaticId: request.counterpartyStaticId,
        // sharedWith: request.sharedCreditLines ? request.sharedCreditLines.map(shared => shared.sharedWithStaticId) : [],
        err: err.message,
        errorObject: err
      })
      throw err
    }
  }

  async update(staticId: string, request: ICreditLineSaveRequest): Promise<void> {
    this.logger.info('Updating credit line', {
      counterpartyStaticId: request.counterpartyStaticId,
      context: request.context
    })
    try {
      const { sharedCreditLines, ...data } = request

      const creditLine = { ...data, staticId }
      const creditLineData = creditLine as ICreditLine

      const existingCreditLine = await this.creditLineDataAgent.get(staticId)

      creditLineData.context = existingCreditLine.context

      await this.creditLineDataAgent.update(creditLineData)

      const sharedCL = sharedCreditLines || []
      const existingSharedCreditLines = await this.sharedCreditLineDataAgent.find({ creditLineStaticId: staticId })

      await Promise.all(
        sharedCL.map(shared => {
          return this.updateSharedCreditLine(
            creditLineData,
            shared as any,
            existingSharedCreditLines,
            existingCreditLine
          )
        })
      )

      const deletedSharedCreditLines = existingSharedCreditLines.filter(existing =>
        sharedCL.every(shared => shared.staticId !== existing.staticId)
      )

      await Promise.all(
        deletedSharedCreditLines.map(async deleted => {
          await this.sharedCreditLineDataAgent.delete(deleted.staticId)
          await this.shareCreditLineService.process(null, deleted, creditLineData, existingCreditLine)
        })
      )

      await this.closeNewRequestsForCompany(creditLineData.counterpartyStaticId, creditLine.context)
    } catch (err) {
      this.logger.error(ErrorCode.UnexpectedError, ErrorName.CreditLineUpdateFailed, {
        context: request.context,
        counterpartyStaticId: request.counterpartyStaticId,
        err: err.message,
        errorObject: err
      })
      throw err
    }
  }

  async closeNewRequestsForCompany(counterpartyStaticId: string, context: IProductContext) {
    // close all new requests that hasn't been responded to
    return this.creditLineRequestService.closeAllPendingRequests(counterpartyStaticId, context)
  }

  async delete(staticId: string): Promise<void> {
    const existingCreditLine = await this.creditLineDataAgent.findOne({ staticId })
    await this.creditLineDataAgent.delete(staticId)

    const existingSharedCreditLines = await this.sharedCreditLineDataAgent.find({ creditLineStaticId: staticId })
    await Promise.all(
      existingSharedCreditLines.map(async deleted => {
        this.logger.info(`Deleting shared credit line: ${deleted.staticId}`)
        await this.sharedCreditLineDataAgent.delete(deleted.staticId)
        await this.shareCreditLineService.process(null, deleted, null, existingCreditLine)
      })
    )

    if (existingCreditLine) {
      await this.closeNewRequestsForCompany(existingCreditLine.counterpartyStaticId, existingCreditLine.context)
    }
  }

  async getByProduct(productId: string, subProductId: string, counterpartyStaticId): Promise<ICreditLineResponse> {
    const creditLine = await this.creditLineDataAgent.findOne({
      context: {
        productId,
        subProductId
      },
      counterpartyStaticId
    })

    if (!creditLine) {
      return null
    }

    return this.getSharedCreditLine(creditLine)
  }

  private async checkCreditLineExists(request: ICreditLineSaveRequest) {
    const existingCreditLine = await this.creditLineDataAgent.findOne({
      context: request.context,
      counterpartyStaticId: request.counterpartyStaticId
    })
    if (existingCreditLine) {
      this.logger.error(
        ErrorCode.ValidationHttpContent,
        ErrorName.CreditLineInvalidData,
        `Creditline for counterparty exists`,
        {
          productId: request.context.productId,
          subProductId: request.context.subProductId,
          counterpartyStaticId: request.counterpartyStaticId
        }
      )
      throw ErrorUtils.conflictException(ErrorCode.DatabaseInvalidData, `Creditline for counterparty exists`, {
        counterpartyStaticId: [`Creditline for counterparty exists`]
      })
    }
  }

  private async updateSharedCreditLine(
    creditLine: ICreditLine,
    shared: ISharedCreditLine<IInformationShared>,
    existingLines: Array<ISharedCreditLine<IInformationShared>>,
    existingCreditLine: ICreditLine
  ) {
    const existing = shared.staticId
      ? existingLines.find(x => shared.sharedWithStaticId === x.sharedWithStaticId)
      : null
    try {
      if (existing) {
        this.logger.info('Updating shared credit line', { staticId: existing.staticId })
        const sharedCreditLineData = {
          ...shared,
          staticId: existing.staticId,
          creditLineStaticId: creditLine.staticId
        }
        await this.sharedCreditLineDataAgent.update(sharedCreditLineData)

        return this.shareCreditLineService.process(sharedCreditLineData, existing, creditLine, existingCreditLine)
      }
    } catch (err) {
      this.logger.error(ErrorCode.UnexpectedError, ErrorName.SharedCLUpdateFailed, {
        creditLineStaticId: creditLine.staticId,
        counterpartyStaticId: shared.counterpartyStaticId,
        sharedWithStaticId: shared.sharedWithStaticId,
        err: err.message,
        errorObject: err
      })
      throw err
    }

    return this.createSharedCreditLine(shared, creditLine)
  }

  private async createSharedCreditLine(sharedCreditLine: ISharedCreditLineRequest, creditLine: ICreditLine) {
    this.logger.info('Creating shared credit line')
    try {
      const data = {
        ...sharedCreditLine,
        creditLineStaticId: creditLine.staticId,
        staticId: undefined
      }
      const staticId = await this.sharedCreditLineDataAgent.create(data)

      data.staticId = staticId

      return this.processAddedSharedCreditLine(data, creditLine)
    } catch (err) {
      this.logger.error(ErrorCode.UnexpectedError, ErrorName.SharedCLCreateFailed, {
        creditLineStaticId: creditLine.staticId,
        counterpartyStaticId: sharedCreditLine.counterpartyStaticId,
        sharedWithStaticId: sharedCreditLine.sharedWithStaticId,
        err: err.message,
        errorObject: err
      })
      throw err
    }
  }

  private async processAddedSharedCreditLine(
    sharedCreaditLine: ISharedCreditLine<IInformationShared>,
    creditLine: ICreditLine
  ) {
    return this.shareCreditLineService.process(sharedCreaditLine, null, creditLine, null)
  }
}
