import { ILetterOfCredit } from '../../letter-of-credit-legacy/types/ILetterOfCredit'
import { ApplicationState } from '../../../store/reducers'
import { get } from 'lodash'
import { IStandbyLetterOfCredit, ITrade, TradeSource, ICargo } from '@komgo/types'
import { ILetterOfCreditWithData } from '../../letter-of-credit/store/types'

export const sortByDate = (a, b) => sortDate(a.updatedAt, b.updatedAt)

export const sortDate = (a, b) =>
  a && b && typeof a === 'string' && typeof b === 'string' ? Date.parse(b) - Date.parse(a) : -1

export const selectNewestLetterOfCreditWithSourceId = (letters: ILetterOfCredit[], sourceId: string) => {
  return letters
    .filter(l => (l.tradeAndCargoSnapshot ? l.tradeAndCargoSnapshot.sourceId === sourceId : false))
    .sort(sortByDate)[0]
}

export const selectNewestStandbyLetterOfCreditWithSourceId = (letters: IStandbyLetterOfCredit[], sourceId: string) => {
  return letters.filter(l => (l.tradeId ? l.tradeId.sourceId === sourceId : false)).sort(sortByDate)[0]
}

export const tradeHasContractData = (trade: ITrade) =>
  trade.contractReference || trade.contractDate || trade.generalTermsAndConditions || trade.law

export const tradeHasDeliveryTermsData = (trade: ITrade, cargo?: ICargo) =>
  (trade.deliveryPeriod && (trade.deliveryPeriod.startDate || trade.deliveryPeriod.endDate)) ||
  trade.deliveryTerms ||
  trade.deliveryLocation ||
  trade.laytime ||
  trade.demurrageTerms ||
  trade.source === TradeSource.Vakt ||
  cargoHasParcels(cargo)

const cargoHasParcels = (cargo?: ICargo) => !!cargo && cargo.parcels && cargo.parcels.length

export const getLatestFinancialInstrumentsForTrade = (state: ApplicationState, trade: ITrade) => {
  if (!trade) {
    return {}
  }
  const letterOfCredit = state
    .get('lettersOfCredit')
    .get('byId')
    .toList()
    .toJS()
    .sort(sortByDate)
    .find(
      (letter: ILetterOfCredit) =>
        get(letter, 'tradeAndCargoSnapshot.trade._id') === trade._id ||
        (trade.sourceId && get(letter, 'tradeAndCargoSnapshot.trade.sourceId') === trade.sourceId)
    )

  const standbyLetterOfCredit = state
    .get('standByLettersOfCredit')
    .get('byId')
    .toList()
    .toJS()
    .sort(sortByDate)
    .find((letter: IStandbyLetterOfCredit) => get(letter, 'tradeId.sourceId') === trade.sourceId)

  const newLetterOfCredit = state
    .get('templatedLettersOfCredit')
    .get('byStaticId')
    .toList()
    .toJS()
    .sort(sortByDate)
    .find((letter: ILetterOfCreditWithData) => get(letter, 'templateInstance.data.trade.sourceId') === trade.sourceId)

  return {
    letterOfCredit,
    standbyLetterOfCredit,
    newLetterOfCredit
  }
}
