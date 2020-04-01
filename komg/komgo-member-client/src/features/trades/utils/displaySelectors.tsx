import { CreditRequirements, TRADE_SCHEMA, ITrade, Commodity, Status } from '@komgo/types'
import { List, Map } from 'immutable'
import { get } from 'lodash'
import Numeral from 'numeral'
import * as React from 'react'
import { Label as SemanticUILabel, Popup, SemanticCOLORS } from 'semantic-ui-react'
import { capitalize, sentenceCase } from '../../../utils/casings'
import { displayDate, isDate } from '../../../utils/date'
import { Counterparty } from '../../counterparties/store/types'
import { Roles } from '../../letter-of-credit-legacy/constants/roles'
import { ILetterOfCredit } from '../../letter-of-credit-legacy/types/ILetterOfCredit'
import { IMember } from '../../members/store/types'
import {
  CREDIT_REQUIREMENT_DISPLAY_VALUES,
  LOC_CATEGORY_COLOURS,
  NOTENOUGHINFO,
  READABLE_LOC_STATUS,
  TradingRole,
  UNRECOGNISED_STATUS,
  TRADE_STATUS
} from '../constants'
import { ITradeEnriched } from '../store/types'
import { findFieldFromSchema } from '../../../store/common/selectors/displaySelectors'
import { Strings } from '../../receivable-discounting-legacy/resources/strings'

export const displayYesOrNo = (trueOrFalse: boolean): string => (trueOrFalse ? 'Yes' : 'No')

export const displayPercentage = (percent: number = 0): string => {
  return Numeral(percent / 100).format('% 0.00')
}

export const displayQuantity = (quantity?: number, priceUnit?: string, nullValueDisplay = NOTENOUGHINFO): string => {
  if (!quantity || !priceUnit) {
    return nullValueDisplay
  }
  return `${formatQuantity(quantity)} ${priceUnit}`
}

export const formatQuantity = (quantity: number): string => {
  return `${Numeral(quantity).format('0,0')}`
}

export const displayTolerance = displayPercentage

export const displayCommodity = (commodity: string): string => {
  if (commodity === undefined) {
    // TODO: Remove check once properly implemented from VAKT (MM)
    return 'BFOET'
  }
  return Object.values(Commodity).includes(commodity) ? sentenceCase(commodity) : commodity
}

export const displayPrice = (
  price?: number,
  currency?: string,
  priceUnit?: string,
  nullValueDisplay = NOTENOUGHINFO
): string => {
  if (!price || !currency || !priceUnit) {
    return nullValueDisplay
  }
  return `${formatPrice(price)} ${currency}/${priceUnit}`
}

export const formatPrice = (price: number): string => {
  return `${Numeral(price).format('0,0.00')}`
}

export const displayEtrmId = (trade: ITradeEnriched, companyStaticId?: string, role?: string): string => {
  if (trade.buyer === companyStaticId || role === Roles.ISSUING_BANK) {
    return `${trade.buyerEtrmId}`
  } else if (trade.seller === companyStaticId || role === Roles.ADVISING_BANK) {
    return `${trade.sellerEtrmId}`
  }
  return NOTENOUGHINFO
}

export const getHumanReadableLCStatus = (status: string): string => {
  return (
    Object.keys(READABLE_LOC_STATUS).find(
      readableStatus =>
        (READABLE_LOC_STATUS as any)[readableStatus].find((matchingStatus: string) => matchingStatus === status) !==
        undefined
    ) || UNRECOGNISED_STATUS
  )
}

export const displayTradeStatus = (tradeStatus: string): string =>
  tradeStatus === TRADE_STATUS.ToBeDiscounted ? Strings.SellerTradeStatusDefault : sentenceCase(tradeStatus)

export const displayLCStatus = (status?: string): JSX.Element | undefined => {
  if (!status) {
    return
  }

  const humanReadableLCStatus = getHumanReadableLCStatus(status)
  return makeLCStatusPopup(humanReadableLCStatus, (LOC_CATEGORY_COLOURS as any)[
    humanReadableLCStatus
  ] as SemanticCOLORS)
}

const makeLCStatusPopup = (text: string, color?: SemanticCOLORS): JSX.Element => {
  return (
    <Popup color={color} trigger={<SemanticUILabel circular={true} color={color} basic={!color && true} />}>
      {capitalize(text.toLocaleLowerCase().replace(/_/g, ' '))}
    </Popup>
  )
}

export const selectVisibleTrades = (trades: Map<string, any>, tradeIds: List<string>): ITrade[] => {
  return tradeIds.toJS().map((id: string) => {
    const trade = trades.get(id)
    if (!trade) {
      throw new Error(`Unexpected trade: ${id}`)
    }
    return trade.toJS()
  })
}

export const findCommonNameByStaticId = (parties: Array<Counterparty | IMember>, staticId?: string) => {
  const member = parties.find((c: Counterparty | IMember) => c.staticId === staticId)
  return member ? get(member, 'x500Name.CN') : `${staticId} not found`
}

export const addBuyerSellerEnrichedData = (
  currentCompanyStaticId: string,
  trades: ITrade[],
  members: Counterparty[] | IMember[]
): ITradeEnriched[] => {
  return trades.map((trade: ITradeEnriched) => ({
    ...trade,
    sellerName: findCommonNameByStaticId(members, trade.seller),
    buyerName: findCommonNameByStaticId(members, trade.buyer),
    tradingRole: currentCompanyStaticId === trade.seller ? TradingRole.SELLER : TradingRole.BUYER
  }))
}

export const selectCounterparty = (trade: ITradeEnriched, tradingRole: TradingRole) => {
  return tradingRole === TradingRole.BUYER ? trade.sellerName : trade.buyerName
}

export const displayCreditRequirement = (creditRequirement?: string): string => {
  const creditRequirementHumanReadableValue =
    CREDIT_REQUIREMENT_DISPLAY_VALUES[creditRequirement ? creditRequirement : '']
  return creditRequirementHumanReadableValue ? creditRequirementHumanReadableValue[0] : UNRECOGNISED_STATUS
}

export const selectNewestLetterOfCreditWithTradeId = (letters: ILetterOfCredit[], tradeId?: string) => {
  return letters
    .filter(l => (l.tradeAndCargoSnapshot ? l.tradeAndCargoSnapshot.trade._id === tradeId : false))
    .sort(
      (a, b) =>
        a.updatedAt && b.updatedAt && typeof a.updatedAt === 'string' && typeof b.updatedAt === 'string'
          ? Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
          : -1
    )[0]
}

export const findFieldFromTradeSchema = (field: string, name: string, schema: any = TRADE_SCHEMA) => {
  return findFieldFromSchema(field, name, schema)
}

export const displayObject = (obj, property, options): string => {
  return JSON.stringify(
    obj,
    (key, value) => {
      if (key) {
        return displayValue(value, key)
      }
      return value
    },
    2
  )
    .replace(/{|}|,|"/g, '')
    .replace(/\\n/g, '\n  ')
    .replace('  \n', '')

  /* output example
    _id: 5c3f0a4d6d25550e4d744bc9
    id: idparcel2
    laycanPeriod:
      startDate: 2018/09/01
      endDate: 2018/09/30
    vesselIMO: 1
    vesselName: Andrej
    loadingPort: Banja luka
    dischargeArea: Sarajevo
    inspector: Boom
    deemedBLDate: 2018/09/01
    quantity: 10
  */
}

export const displayValue = (value, property, options = {}): string => {
  switch (property) {
    case 'maxTolerance':
    case 'minTolerance':
      return displayTolerance(value)
    case 'commodity':
      return displayCommodity(value)
    case 'price':
    case 'amount':
      return formatPrice(value)
    case 'quantity':
      return formatQuantity(value)
    default:
      return handleDefault(value, property, options)
  }
}

const handleDefault = (value, property, options) => {
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }
  if (isDate(value)) {
    return displayDate(value)
  }
  if (value && typeof value === 'object') {
    return displayObject(value, property, options)
  }
  return value ? value : '-'
}
