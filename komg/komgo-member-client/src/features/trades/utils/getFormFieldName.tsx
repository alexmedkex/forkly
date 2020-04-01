import { findFieldFromTradeSchema } from './displaySelectors'
import { TRADE_SCHEMA } from '@komgo/types'

export function addMandatoryFieldNameForBuyer(name: string, isBuyerTrade: boolean, schema: any = TRADE_SCHEMA) {
  return isBuyerTrade
    ? `${findFieldFromTradeSchema('title', name, schema)} *`
    : findFieldFromTradeSchema('title', name, schema)
}

export function addMandatoryFieldNameForSeller(name: string, isBuyerTrade: boolean, schema: any = TRADE_SCHEMA) {
  return isBuyerTrade
    ? findFieldFromTradeSchema('title', name, schema)
    : `${findFieldFromTradeSchema('title', name, schema)} *`
}
