import React, { ReactElement } from 'react'
import { TopbarStatusIndicator } from '../components/status-indicators'
import { BasicTopbarInfoItem } from '../components/generics/BasicTopbarInfoItem'
import { displayRequestType } from '../utils/displaySelectors'
import { findCommonNameByStaticId, displayTradeStatus } from '../../trades/utils/displaySelectors'
import { ITradeEnriched } from '../../trades/store/types'
import { IReceivablesDiscountingInfo, RDStatus } from '@komgo/types'
import { IMember } from '../../members/store/types'
import { ReceivablesDiscountingRole } from '../utils/constants'
import moment from 'moment'

const ProviderTopbarInfoItem = ({ provider }) => <BasicTopbarInfoItem title={'provider'} value={provider} />
const TradeIdTopbarInfoItem = ({ tradeId }) => <BasicTopbarInfoItem title={'trade Id'} value={tradeId} />
const BuyerTopbarInfoItem = ({ buyer }) => <BasicTopbarInfoItem title={'buyer'} value={buyer} />
const SellerTopbarInfoItem = ({ seller }) => <BasicTopbarInfoItem title={'seller'} value={seller} />
const RequestTypeTopbarInfoItem = ({ rd }) => (
  <BasicTopbarInfoItem title={'type'} value={displayRequestType(rd.requestType, rd.discountingType)} />
)
const RequestSentAtTopbarInfoItem = ({ date }) => (
  <BasicTopbarInfoItem title={'request sent'} value={moment(date).format('DD/MM/YYYY [at] HH:mm z')} />
)

export class RDTopbarFactory {
  public static createTopbarInfoItems(
    trade: ITradeEnriched,
    discountingRequest: IReceivablesDiscountingInfo,
    members: IMember[],
    role: ReceivablesDiscountingRole
  ): ReactElement[] {
    let provider: ReactElement
    let seller: ReactElement
    let type: ReactElement
    let buyer: ReactElement
    let status: ReactElement
    let tradeId: ReactElement
    let sentAt: ReactElement

    if (trade) {
      tradeId = <TradeIdTopbarInfoItem key="tradeId" tradeId={trade.sellerEtrmId} />
      buyer = <BuyerTopbarInfoItem key="buyer" buyer={trade.buyerName} />

      if (role === ReceivablesDiscountingRole.Bank) {
        seller = <SellerTopbarInfoItem key="seller" seller={trade.sellerName} />
      }
    }

    if (discountingRequest) {
      status = <TopbarStatusIndicator key="status" status={discountingRequest.status} />
      type = <RequestTypeTopbarInfoItem key="type" rd={discountingRequest.rd} />

      if (discountingRequest.rfp && discountingRequest.rfp.createdAt) {
        sentAt = <RequestSentAtTopbarInfoItem key="sent-at" date={discountingRequest.rfp.createdAt} />
      }

      if (
        discountingRequest.status === RDStatus.QuoteAccepted &&
        discountingRequest.acceptedParticipantStaticId &&
        role === ReceivablesDiscountingRole.Trader
      ) {
        provider = (
          <ProviderTopbarInfoItem
            provider={findCommonNameByStaticId(members, discountingRequest.acceptedParticipantStaticId)}
          />
        )
      }
    }

    const items = [status, sentAt, tradeId, type, buyer, seller, provider]
    return items.filter(Boolean)
  }

  public static createApplyForDiscountingTopBarInfoItems(trade: ITradeEnriched): ReactElement[] {
    return [
      <TopbarStatusIndicator key="status" status={trade.status} />,
      <TradeIdTopbarInfoItem key="tradeId" tradeId={trade.sellerEtrmId} />,
      <BuyerTopbarInfoItem key="buyer" buyer={trade.buyerName} />
    ]
  }
  private constructor() {}
}
