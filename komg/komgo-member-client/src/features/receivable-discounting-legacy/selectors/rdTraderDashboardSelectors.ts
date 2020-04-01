import { ITradeEnriched } from '../../trades/store/types'
import { displayDate } from '../../../utils/date'
import { formatPrice, findCommonNameByStaticId, displayCommodity } from '../../trades/utils/displaySelectors'
import { sentenceCase } from '../../../utils/casings'
import { IReceivableDiscountingDashboardTrader } from '../store/types'
import { selectSellerTrades } from './common'
import { IReceivablesDiscountingInfo } from '@komgo/types'
import { IMember } from '../../members/store/types'
import { Strings } from '../resources/strings'

export const DEFAULT_TEXT_BANK_NOT_ACCEPTED = 'N/A'

export const tranformToRdTraderDashboardData = (
  members: IMember[],
  allTrades: ITradeEnriched[],
  rdDataArray: IReceivablesDiscountingInfo[]
): IReceivableDiscountingDashboardTrader[] => {
  const trades = selectSellerTrades(allTrades)

  const mapSourceIdToRDData: Map<string, IReceivablesDiscountingInfo> = new Map(
    rdDataArray.map(
      (rdData: IReceivablesDiscountingInfo) =>
        [rdData.rd.tradeReference.sourceId, rdData] as [string, IReceivablesDiscountingInfo]
    )
  )

  const result: IReceivableDiscountingDashboardTrader[] = trades.map(trade => {
    let rdId
    let invoiceType
    let invoiceAmount
    let rdStatus
    let currency = trade.currency
    let acceptedBank = DEFAULT_TEXT_BANK_NOT_ACCEPTED

    if (mapSourceIdToRDData.has(trade.sourceId!)) {
      const rdInfo: IReceivablesDiscountingInfo = mapSourceIdToRDData.get(trade.sourceId!)
      rdId = rdInfo.rd.staticId
      rdStatus = rdInfo.status
      invoiceType = rdInfo.rd.invoiceType
      invoiceAmount = rdInfo.rd.invoiceAmount
      currency = rdInfo.rd.currency
      if (rdInfo.acceptedParticipantStaticId) {
        acceptedBank = findCommonNameByStaticId(members, rdInfo.acceptedParticipantStaticId)
      }
    }

    const dashboardRow: IReceivableDiscountingDashboardTrader = {
      tradeId: trade.sellerEtrmId,
      tradeTechnicalId: trade._id,
      rdId,
      tradeDate: displayDate(trade.dealDate),
      counterparty: trade.buyerName ? trade.buyerName : trade.buyer,
      bank: acceptedBank,
      commodity: displayCommodity(trade.commodity),
      invoiceAmount: invoiceAmount ? formatPrice(invoiceAmount) : undefined,
      currency,
      invoiceType: invoiceType ? sentenceCase(invoiceType) : undefined,
      status: rdStatus ? sentenceCase(rdStatus) : Strings.SellerTradeStatusDefault,
      rdStatus
    }
    return dashboardRow
  })
  return result
}
