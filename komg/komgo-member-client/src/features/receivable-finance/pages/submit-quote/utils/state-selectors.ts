import { CreditLineType, IExtendedCreditLine } from '../../../../credit-line/store/types'
import { getExtendedCreditLineArray } from '../../../../credit-line/utils/state-selectors'
import { IReceivablesDiscountingInfo, ITrade } from '@komgo/types'
import { getReceivableDiscountingInfoByRdId } from '../../../../receivable-discounting-legacy/utils/state-selectors'

export const getRDExtendedCreditLine = (state, rdId: string): IExtendedCreditLine => {
  const extendedCreditLines: IExtendedCreditLine[] = getExtendedCreditLineArray(state, CreditLineType.RiskCover)
  const rdInfo: IReceivablesDiscountingInfo = getReceivableDiscountingInfoByRdId(state, rdId)
  if (rdInfo && extendedCreditLines && extendedCreditLines.length > 0) {
    const filteredArray = extendedCreditLines.filter(
      (line: IExtendedCreditLine) => line.counterpartyStaticId === rdInfo.tradeSnapshot.trade.buyer
    )
    return filteredArray.length > 0 ? filteredArray[0] : undefined
  }
  return undefined
}
