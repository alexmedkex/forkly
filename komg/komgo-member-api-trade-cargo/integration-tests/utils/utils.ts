import { members } from '../sampledata/members'

import { tradeMessage } from '../sampledata/trade-message'
import { cargoMessage } from '../sampledata/cargo-messages'
import {
  CreditRequirements,
  buildFakeTradeBase,
  buildFakeTrade,
  buildFakeCargoBase,
  buildFakeCargo,
  Grade,
  TRADE_SCHEMA_VERSION,
  CARGO_SCHEMA_VERSION,
  buildFakeParcel
} from '@komgo/types'

export const integrationTestBuyerStaticId = '49000'
export const integrationTestSellerStaticId = '59000'

export enum TradeType {
  Buyer = 'Buyer',
  Seller = 'Seller'
}

export const getMembers = async reqConfig => {
  let result = members.find(
    member => reqConfig.url.includes(member.vaktStaticId) || reqConfig.url.includes(member.staticId)
  )
  if (!result) {
    result = members[1]
  }
  return [200, [result]]
}

export const generateRandomString = (length: number, prefix: string = '') => {
  let text = ''
  const possible = 'abcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < length; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  return `${prefix}${text}`
}

export const generateMovementData = (
  tradeType: TradeType,
  tradeVersion = TRADE_SCHEMA_VERSION.V1,
  cargoVersion = CARGO_SCHEMA_VERSION.V1
) => {
  return {
    tradeBase:
      tradeType === TradeType.Buyer
        ? buildFakeTradeBase({
            buyerEtrmId: generateRandomString(5, 'b'),
            buyer: integrationTestBuyerStaticId,
            seller: integrationTestSellerStaticId,
            version: tradeVersion
          })
        : buildFakeTradeBase({
            buyerEtrmId: '',
            sellerEtrmId: generateRandomString(5, 's'),
            creditRequirement: CreditRequirements.OpenCredit,
            buyer: integrationTestBuyerStaticId,
            seller: integrationTestSellerStaticId,
            version: tradeVersion
          }),
    trade:
      tradeType === TradeType.Buyer
        ? buildFakeTrade({
            buyerEtrmId: generateRandomString(5, 'b'),
            buyer: integrationTestBuyerStaticId,
            seller: integrationTestSellerStaticId,
            version: tradeVersion
          })
        : buildFakeTrade({
            buyerEtrmId: '',
            sellerEtrmId: generateRandomString(5, 's'),
            creditRequirement: CreditRequirements.OpenCredit,
            buyer: integrationTestBuyerStaticId,
            seller: integrationTestSellerStaticId,
            version: tradeVersion
          }),
    cargoBase: buildFakeCargoBase({
      grade: Grade.Forties,
      parcels: [buildFakeParcel({ deemedBLDate: '2019-11-10' })],
      version: cargoVersion
    }),
    cargo: buildFakeCargo({ grade: Grade.Forties, version: cargoVersion })
  }
}

export const generateVaktMovementAMQPMessages = (tradeType = 'BUYER') => {
  const vaktId = generateRandomString(5, 'V')
  const cargoId = generateRandomString(5, 'F')

  const newTrade = { ...tradeMessage, vaktId }
  const newCargo = { ...cargoMessage, cargoId, vaktId }

  if (tradeType === 'SELLER') {
    newTrade.creditRequirement = CreditRequirements.OpenCredit
    delete newTrade.demurrageTerms
    delete newTrade.laytime
  }

  return { trade: newTrade, cargo: newCargo }
}
