import { TradingRole } from '@komgo/types'
import { TradingRoleError } from '../errors'

export function getTradingRole(buyerStaticId: string, sellerStaticId: string, companyStaticId: string) {
  if (buyerStaticId === companyStaticId) {
    return TradingRole.Purchase
  } else if (sellerStaticId === companyStaticId) {
    return TradingRole.Sale
  }

  throw new TradingRoleError('Environment StaticId does not match trade StaticId ')
}
