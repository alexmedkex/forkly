import { displayDate, displayPaymentTerms } from '../../../utils/date'
import { formatPrice, findCommonNameByStaticId } from '../../trades/utils/displaySelectors'
import { IReceivableDiscountingDashboardBank } from '../store/types'
import { sentenceCase, sentenceCaseWithAcronyms } from '../../../utils/casings'
import { DiscountingDateType } from '../utils/constants'
import { IMember } from '../../members/store/types'
import { IReceivablesDiscountingInfo, RDStatus, ITradeSnapshot, PaymentTermsOption } from '@komgo/types'
import { paymentTermsHasValues } from '../../trades/utils/paymentTermsHasValues'

export const tranformToRdBankDashboardData = (
  rdData: IReceivablesDiscountingInfo[],
  members: IMember[] = []
): IReceivableDiscountingDashboardBank[] =>
  rdData.map(({ rd, tradeSnapshot, status }: IReceivablesDiscountingInfo) => ({
    tradeId: tradeSnapshot.trade.sellerEtrmId,
    requestDate: displayDate(rd.createdAt),
    discountingDate: rd.discountingDate ? displayDate(rd.discountingDate) : '-',
    discountingDateType: sentenceCase(rdStatusToDiscountingDateType[status]),
    seller: findCommonNameByStaticId(members, tradeSnapshot.trade.seller),
    buyer: findCommonNameByStaticId(members, tradeSnapshot.trade.buyer),
    paymentTerms: getPaymentTerms(tradeSnapshot),
    invoiceAmount: rd.invoiceAmount && formatPrice(rd.invoiceAmount),
    invoiceType: sentenceCase(rd.invoiceType),
    currency: rd.currency,
    status: sentenceCase(status),
    rd: { status, staticId: rd.staticId }
  }))

function getPaymentTerms(tradeSnapshot: ITradeSnapshot): string {
  if (!tradeSnapshot.trade.paymentTermsOption) {
    return '-'
  }

  if (tradeSnapshot.trade.paymentTermsOption === PaymentTermsOption.Sight) {
    return sentenceCase(PaymentTermsOption.Sight)
  }

  return paymentTermsHasValues(tradeSnapshot.trade.paymentTerms)
    ? sentenceCaseWithAcronyms(displayPaymentTerms(tradeSnapshot.trade.paymentTerms), ['BL'])
    : '-'
}

const rdStatusToDiscountingDateType = {
  [RDStatus.Requested]: DiscountingDateType.Expected
} // other values not yet supported
