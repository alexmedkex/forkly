import {
  ICreditLine,
  ISharedCreditLine,
  IInformationShared,
  ICreditLineRequest,
  IRiskCoverSharedData
} from '@komgo/types'
import { inject } from 'inversify'

import { CONFIG } from '../inversify/config'
import { TYPES } from '../inversify/types'

import { ICreditLineRequestService } from './CreditLineRequestService'
import { FeatureType, getFeatureForProduct } from './enums/feature'
import { IRiskCoverShareData } from './messaging/messages/IRiskCoverShareData'
import { ISharedCreditLineData, ISharedCreditLinePayload } from './messaging/messages/IShareCreditLineMessage'
import { MessageType } from './messaging/MessageTypes'
import { RequestClient } from './messaging/RequestClient'
import { ShareDataServiceBase } from './ShareDataServiceBase'
import { getValueToShare } from './utils/utils'

export class ShareCreditLineService extends ShareDataServiceBase<
  ICreditLine,
  ISharedCreditLine<IInformationShared>,
  ISharedCreditLineData,
  ISharedCreditLinePayload,
  ICreditLineRequest
> {
  constructor(
    @inject(TYPES.CreditLineRequestService) private readonly creditLineRequestService: ICreditLineRequestService,
    @inject(TYPES.RequestClient) requestClient: RequestClient,
    @inject(CONFIG.CompanyStaticId) companyStaticId: string
  ) {
    super(requestClient, companyStaticId)
  }

  protected getFeatureType(data: ICreditLine): FeatureType {
    return getFeatureForProduct(data.context.productId, data.context.subProductId)
  }

  protected async getPendingRequest(
    creditLine: ICreditLine,
    sharedCreditLineData: ISharedCreditLine<IInformationShared>
  ): Promise<ICreditLineRequest> {
    const sharedDataContext = {
      sharedWithStaticId: sharedCreditLineData.sharedWithStaticId,
      counterpartyStaticId: sharedCreditLineData.counterpartyStaticId,
      context: creditLine.context
    }
    return this.creditLineRequestService.getPendingRequest(
      sharedDataContext.sharedWithStaticId,
      sharedDataContext.counterpartyStaticId,
      sharedDataContext.context
    )
  }

  protected async closeRequest(request: ICreditLineRequest) {
    await this.creditLineRequestService.markCompleted(request)
  }

  protected buildDataToShare(
    sharedCreditLine: ISharedCreditLine<IInformationShared>,
    creditLine: ICreditLine
  ): ISharedCreditLineData {
    if (!sharedCreditLine || !creditLine) {
      return null
    }

    const hasAppetiteShared = !!sharedCreditLine && sharedCreditLine.data.appetite.shared
    const hasAppetite = creditLine && creditLine.appetite
    const shouldShareData = hasAppetiteShared && hasAppetite

    let message: ISharedCreditLineData = {
      appetite: hasAppetiteShared ? creditLine.appetite : undefined
    }

    if (!shouldShareData) {
      message = {
        ...message,
        availability: null,
        availabilityAmount: null,
        creditLimit: null,
        currency: null
      }
    } else {
      message = {
        ...message,
        availability: this.getAvailability(sharedCreditLine, creditLine),
        availabilityAmount: this.getAvailabilityAmount(sharedCreditLine, creditLine),
        creditLimit: this.getCreditLimit(sharedCreditLine, creditLine),
        currency: creditLine.currency
      }
    }

    const additionlDataToShare = this.getAdditionalCreditLineData(creditLine, sharedCreditLine, hasAppetiteShared)

    message = {
      ...message,
      ...additionlDataToShare
    }

    return message
  }

  protected getMessageData(
    data: ISharedCreditLineData,
    creditLine: ICreditLine,
    sharedCreditLineData: ISharedCreditLine<IInformationShared>,
    messageType: MessageType
  ): ISharedCreditLinePayload {
    return {
      context: creditLine.context,
      counterpartyStaticId: sharedCreditLineData.counterpartyStaticId,
      data
    }
  }

  protected getRevokeMessageData(
    creditLine: ICreditLine,
    sharedCreditLineData: ISharedCreditLine<IInformationShared>,
    messageType: MessageType
  ): ISharedCreditLinePayload {
    return {
      context: creditLine.context,
      counterpartyStaticId: sharedCreditLineData.counterpartyStaticId
    }
  }

  private getAvailability(sharedCreditLine: ISharedCreditLine<IInformationShared>, creditLine: ICreditLine) {
    return sharedCreditLine.data.availability && sharedCreditLine.data.availability.shared
      ? creditLine.availability
      : undefined
  }

  private getAvailabilityAmount(sharedCreditLine: ISharedCreditLine<IInformationShared>, creditLine: ICreditLine) {
    return sharedCreditLine.data.availabilityAmount && sharedCreditLine.data.availabilityAmount.shared
      ? creditLine.availabilityAmount
      : undefined
  }

  private getCreditLimit(sharedCreditLine: ISharedCreditLine<IInformationShared>, creditLine: ICreditLine) {
    return sharedCreditLine.data.creditLimit && sharedCreditLine.data.creditLimit.shared
      ? creditLine.creditLimit
      : undefined
  }

  private getAdditionalCreditLineData(
    creditLine: ICreditLine,
    sharedCreditLine: ISharedCreditLine<IInformationShared>,
    hasAppetiteShared: boolean
  ): IRiskCoverShareData {
    if (!sharedCreditLine || !hasAppetiteShared || !creditLine || !creditLine.appetite) {
      return null
    }

    const data = sharedCreditLine.data

    return {
      fee: getValueToShare(data.fee, fee => fee.fee),
      margin: getValueToShare(data.margin, margin => margin.margin),
      maximumTenor: getValueToShare(data.maximumTenor, maximumTenor => maximumTenor.maximumTenor)
    }
  }
}
