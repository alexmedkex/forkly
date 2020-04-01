import { IDepositLoan, ISharedDepositLoan, IDepositLoanRequest } from '@komgo/types'
import { inject } from 'inversify'

import { TYPES } from '../../inversify/types'
import { FeatureType, getDepositLoanFeatureType } from '../enums/feature'
import { ISharedDepositLoanData, IShareDepositLoanPayload } from '../messaging/messages/IShareDepositLoanMessage'
import { MessageType } from '../messaging/MessageTypes'
import { RequestClient } from '../messaging/RequestClient'
import { ShareDataServiceBase } from '../ShareDataServiceBase'

import { IDepositLoanRequestService } from './DepositLoanRequestService'

export class ShareDepositLoanService extends ShareDataServiceBase<
  IDepositLoan,
  ISharedDepositLoan,
  ISharedDepositLoanData,
  IShareDepositLoanPayload,
  IDepositLoanRequest
> {
  constructor(
    @inject(TYPES.DepositLoanRequestService) private readonly requestService: IDepositLoanRequestService,
    @inject(TYPES.RequestClient) requestClient: RequestClient,
    @inject('company-static-id') companyStaticId: string
  ) {
    super(requestClient, companyStaticId)
  }

  protected getFeatureType(data: IDepositLoan): FeatureType {
    return getDepositLoanFeatureType(data.type)
  }

  protected async getPendingRequest(
    depositLoan: IDepositLoan,
    sharedDepositLoan: ISharedDepositLoan
  ): Promise<IDepositLoanRequest> {
    return this.requestService.getPendingRequest(
      depositLoan.type,
      sharedDepositLoan.sharedWithStaticId,
      depositLoan.currency,
      depositLoan.period,
      depositLoan.periodDuration
    )
  }

  protected async closeRequest(request: IDepositLoanRequest) {
    await this.requestService.markCompleted(request)
  }

  protected buildDataToShare(sharedDepositLoan: ISharedDepositLoan, depositLoan: IDepositLoan): ISharedDepositLoanData {
    if (!sharedDepositLoan || !depositLoan) {
      return null
    }

    const hasAppetiteShared = !!sharedDepositLoan && sharedDepositLoan.appetite.shared
    const hasAppetite = depositLoan && depositLoan.appetite
    const shouldShareData = hasAppetiteShared && hasAppetite

    const message: ISharedDepositLoanData = {
      appetite: hasAppetiteShared ? depositLoan.appetite : undefined
    }

    return {
      ...message,
      pricing: shouldShareData ? this.getPricing(sharedDepositLoan, depositLoan) : undefined
    }
  }

  protected getMessageData(
    data: ISharedDepositLoanData,
    depositLoan: IDepositLoan,
    sharedDepositLoanData: ISharedDepositLoan,
    messageType: MessageType
  ): IShareDepositLoanPayload {
    return {
      type: depositLoan.type,
      ...this.resolveDepositLoanKeyData(depositLoan),
      data
    }
  }

  protected getRevokeMessageData(
    depositLoan: IDepositLoan,
    sharedDepositLoanData: ISharedDepositLoan,
    messageType: MessageType
  ): IShareDepositLoanPayload {
    return {
      type: depositLoan.type,
      ...this.resolveDepositLoanKeyData(depositLoan)
    }
  }

  private getPricing(sharedDepositLoan: ISharedDepositLoan, depositLoan: IDepositLoan): number {
    return sharedDepositLoan.pricing && sharedDepositLoan.pricing.shared ? sharedDepositLoan.pricing.pricing : undefined
  }

  private resolveDepositLoanKeyData(depositLoan: IDepositLoan) {
    return {
      currency: depositLoan.currency,
      period: depositLoan.period,
      periodDuration: depositLoan.periodDuration !== null ? depositLoan.periodDuration : undefined
    }
  }
}
