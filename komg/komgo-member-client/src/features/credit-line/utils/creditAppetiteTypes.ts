import { CreditLineType } from '../store/types'
import { Products } from '../../document-management/constants/Products'
import { SubProducts } from '../../document-management/constants/SubProducts'

export const findFeature = (data: any): CreditLineType | null => {
  const checkingObj = data.context || data
  if (
    checkingObj.productId === Products.TradeFinance &&
    checkingObj.subProductId === SubProducts.ReceivableDiscounting
  ) {
    return CreditLineType.RiskCover
  }
  if (checkingObj.productId === Products.TradeFinance && checkingObj.subProductId === SubProducts.LetterOfCredit) {
    return CreditLineType.BankLine
  }
  return null
}
