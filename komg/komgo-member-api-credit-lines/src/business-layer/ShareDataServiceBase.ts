import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { IAppetite } from '@komgo/types'
import { injectable, inject } from 'inversify'
import * as _ from 'lodash'

import { TYPES } from '../inversify/types'
import { IAppetiteSharedType, IBaseSharedData } from '../types/IApetiteShared'
import { ErrorName } from '../utils/Constants'

import { FeatureType } from './enums/feature'
import { ICreditLineBaseMessage, ICreditLineMessage } from './messaging/messages/ICreditLineMessage'
import { MessageType } from './messaging/MessageTypes'
import { RequestClient } from './messaging/RequestClient'
import { isAppetiteShared } from './utils/utils'

@injectable()
export abstract class ShareDataServiceBase<
  TData extends IAppetite,
  TSharedData extends IAppetiteSharedType & IBaseSharedData,
  TMessageData extends object,
  TMessagePayload extends object,
  TRequest
> {
  private readonly logger = getLogger('ShareDataServiceBase')

  constructor(
    @inject(TYPES.RequestClient) private readonly requestClient: RequestClient,
    @inject('company-static-id') private readonly companyStaticId: string
  ) {}

  public async process(
    newSharedData: TSharedData,
    existingSharedData: TSharedData,
    newCreditLine: TData,
    existingCreditLine: TData
  ) {
    try {
      const shouldShare = isAppetiteShared(newSharedData)
      const hadDataShared = isAppetiteShared(existingSharedData)

      if (!hadDataShared && !shouldShare) {
        // choose not to dislose data and hasn't shared some before
        this.logger.info('Nothing to share, appetite hasn`t been disclosed', {
          sharedDepositLoanId: (newSharedData || existingSharedData).staticId
        })
        return
      }

      if (hadDataShared && !shouldShare) {
        return this.sendRevokeMessage(existingCreditLine, existingSharedData)
      }

      return this.sendCreditLineMessage(newCreditLine, newSharedData, existingCreditLine, existingSharedData)
    } catch (err) {
      this.logger.error(ErrorCode.UnexpectedError, ErrorName.SharedCLProcessFailed, {
        // counterpartyStaticId: newSharedData.counterpartyStaticId, // TODO:
        sharedWithStaticId: newSharedData.sharedWithStaticId,
        err: err.message,
        errorObject: err
      })
      throw err
    }
  }

  protected abstract buildDataToShare(sharedCreditLine: TSharedData, creditLine: TData): TMessageData

  protected abstract getPendingRequest(creditLine: TData, sharedCreditLineData: TSharedData): Promise<TRequest>

  protected abstract closeRequest(request: TRequest)

  protected abstract getMessageData(
    data: TMessageData,
    creditLine: TData,
    sharedCreditLineData: TSharedData,
    messageType: MessageType
  ): TMessagePayload

  protected abstract getRevokeMessageData(
    creditLine: TData,
    sharedCreditLineData: TSharedData,
    messageType: MessageType
  ): TMessagePayload

  protected abstract getFeatureType(data: TData): FeatureType

  private async sendCreditLineMessage(
    creditLine: TData,
    sharedCreditLineData: TSharedData,
    existingCreditLine: TData,
    existingSharedData: TSharedData
  ) {
    const data = this.buildDataToShare(sharedCreditLineData, creditLine)
    const alreadySharedData = this.buildDataToShare(existingSharedData, existingCreditLine)

    const request = await this.getPendingRequest(creditLine, sharedCreditLineData)

    if (request) {
      // if request is there, always disclose data, even if not changed
      this.logger.info('Pending request exists, sharing data to request')
    } else if (_.isEqual(data, alreadySharedData)) {
      this.logger.info('Share credit line. No new data to share, skipping....') // TODO: , sharedDataContext)
      return
    }

    if (request) {
      await this.closeRequest(request)
    }

    const message = this.getMessage(data, creditLine, sharedCreditLineData, MessageType.ShareCreditLine)

    return this.requestClient.sendCommonRequest(
      MessageType.ShareCreditLine,
      sharedCreditLineData.sharedWithStaticId,
      message
    )
  }

  private async sendRevokeMessage(creditLine: TData, sharedCreditLineData: TSharedData) {
    const request = await this.getPendingRequest(creditLine, sharedCreditLineData)

    if (request) {
      this.logger.info('Closing existing request for information')

      await this.closeRequest(request)
    }

    const message = this.getRevokeMessage(creditLine, sharedCreditLineData, MessageType.RevokeCreditLine)

    return this.requestClient.sendCommonRequest(
      MessageType.RevokeCreditLine,
      sharedCreditLineData.sharedWithStaticId,
      message
    )
  }

  private getMessage(
    data: TMessageData,
    creditLine: TData,
    sharedCreditLineData: TSharedData,
    messageType: MessageType
  ): ICreditLineMessage<TMessagePayload> {
    return {
      ...this.getBaseMessage(creditLine, sharedCreditLineData, messageType),
      payload: this.getMessageData(data, creditLine, sharedCreditLineData, messageType)
    }
  }

  private getRevokeMessage(
    creditLine: TData,
    sharedCreditLineData: TSharedData,
    messageType: MessageType
  ): ICreditLineMessage<TMessagePayload> {
    return {
      ...this.getBaseMessage(creditLine, sharedCreditLineData, messageType),
      payload: this.getRevokeMessageData(creditLine, sharedCreditLineData, messageType)
    }
  }

  private getBaseMessage(
    creditLine: TData,
    sharedCreditLineData: TSharedData,
    messageType: MessageType
  ): ICreditLineBaseMessage {
    return {
      version: 1,
      messageType,
      ownerStaticId: this.companyStaticId,
      recepientStaticId: sharedCreditLineData.sharedWithStaticId,
      staticId: sharedCreditLineData.staticId,
      context: undefined,
      featureType: this.getFeatureType(creditLine)
    }
  }
}
