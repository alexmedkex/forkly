import { isRejectedStandbyLetterOfCredit } from '../../standby-letter-of-credit-legacy/utils/common'
import { ILetterOfCredit } from '../../letter-of-credit-legacy/types/ILetterOfCredit'
import {
  IStandbyLetterOfCredit,
  TradeSource,
  ITrade,
  CreditRequirements,
  RDStatus,
  ICargo,
  ICargoBase,
  ITradeBase
} from '@komgo/types'
import { ITradeEnriched } from '../store/types'
import { isRejectedLetterOfCredit as isRejectedLegacyLetterOfCredit } from '../../letter-of-credit-legacy/utils/status'
import { TradingRole, TRADING_ROLE_OPTIONS, TRADE_STATUS } from '../constants'
import { tradeFinanceManager } from '@komgo/permissions'
import * as H from 'history'
import { ILetterOfCreditWithData } from '../../letter-of-credit/store/types'
import { isRejectedLetterOfCredit } from '../../letter-of-credit/utils/status'

export const getActionPermissions = (action: TradeAction) => {
  switch (action) {
    case TradeAction.ApplyForLC:
    case TradeAction.ReapplyForLC:
      return [tradeFinanceManager.canManageLCRequests]
    case TradeAction.ViewLC:
      return [
        tradeFinanceManager.canReadReviewIssuedLC,
        tradeFinanceManager.canManageLCRequests,
        tradeFinanceManager.canManageCollections,
        tradeFinanceManager.canManagePresentations,
        tradeFinanceManager.canReadReviewPresentation,
        tradeFinanceManager.canReadReviewLCApp
      ]
    case TradeAction.ApplyForSBLC:
    case TradeAction.ReapplyForSBLC:
      return [tradeFinanceManager.canManageSBLCRequests]
    case TradeAction.ViewSBLC:
    case TradeAction.ViewLegacySBLC:
      return [tradeFinanceManager.canReadReviewSBLC]
    default:
      return []
  }
}
export const getTradingRole = (location: H.Location): TradingRole => {
  const urlSearchParams = new URLSearchParams(location.search)
  return urlSearchParams.get('tradingRole') === TradingRole.SELLER ? TradingRole.SELLER : TradingRole.BUYER
}

export const isDisabledFieldForRole = (field: string, role: string) =>
  (field === 'trade.buyer' && role === TRADING_ROLE_OPTIONS.BUYER) ||
  (field === 'trade.seller' && role === TRADING_ROLE_OPTIONS.SELLER)

export const isDisabledFieldForRd = (field: string, rdStatus: RDStatus) =>
  rdStatus === RDStatus.PendingRequest
    ? false
    : rdStatus !== RDStatus.QuoteAccepted || !EDITABLE_FIELDS_AFTER_QUOTE_ACCEPTED.includes(field)

export const EDITABLE_CARGO_FIELDS_AFTER_QUOTE_ACCEPTED: Array<keyof ICargoBase> = [
  'originOfGoods',
  'quality',
  'parcels'
]
export const EDITABLE_TRADE_FIELDS_AFTER_QUOTE_ACCEPTED: Array<keyof ITradeBase> = [
  'buyerEtrmId',
  'contractReference',
  'contractDate',
  'dealDate',
  'generalTermsAndConditions',
  'law',
  'quantity',
  'price',
  'deliveryPeriod',
  'paymentTerms'
]
const EDITABLE_FIELDS_AFTER_QUOTE_ACCEPTED = [
  ...EDITABLE_CARGO_FIELDS_AFTER_QUOTE_ACCEPTED.map((field: keyof ICargoBase) => `cargo.${field}`),
  ...EDITABLE_TRADE_FIELDS_AFTER_QUOTE_ACCEPTED.map((field: keyof ITradeBase) => `trade.${field}`)
]

export const getTradeActionsForFinancialInstruments = (
  trade: ITrade,
  role: TradingRole,
  legacyLetterOfCredit: ILetterOfCredit,
  standbyLetterOfCredit: IStandbyLetterOfCredit,
  letterOfCredit: ILetterOfCreditWithData
): TradeAction[] => {
  let actions: TradeAction[] = []

  if (legacyLetterOfCredit && !isRejectedLegacyLetterOfCredit(legacyLetterOfCredit)) {
    actions.push(TradeAction.ViewLC)
  }

  if (standbyLetterOfCredit && !isRejectedStandbyLetterOfCredit(standbyLetterOfCredit)) {
    actions.push(TradeAction.ViewLegacySBLC)
  }

  if (letterOfCredit && !isRejectedLetterOfCredit(letterOfCredit)) {
    actions.push(TradeAction.ViewSBLC)
  }

  if (role === TradingRole.BUYER) {
    actions = actions.concat(
      getTradeActionsForFinancialInstrumentsForBuyer(legacyLetterOfCredit, standbyLetterOfCredit, letterOfCredit)
    )
  }

  return actions
}

const getActionsIfNoInstruments = (
  legacyLetterOfCredit: ILetterOfCredit,
  standbyLetterOfCredit: IStandbyLetterOfCredit,
  letterOfCredit: ILetterOfCreditWithData
) =>
  !legacyLetterOfCredit && !standbyLetterOfCredit && !letterOfCredit
    ? [TradeAction.ApplyForLC, TradeAction.ApplyForSBLC]
    : null

const activeInstrumentExists = (
  legacyLetterOfCredit: ILetterOfCredit,
  standbyLetterOfCredit: IStandbyLetterOfCredit,
  letterOfCredit: ILetterOfCreditWithData
) => {
  const activeLegacyLetterOfCredit = !!legacyLetterOfCredit && !isRejectedLegacyLetterOfCredit(legacyLetterOfCredit)
  const activeStandbyLetterOfCredit = !!standbyLetterOfCredit && !isRejectedStandbyLetterOfCredit(standbyLetterOfCredit)
  const activeLetterOfCredit = !!letterOfCredit && !isRejectedLetterOfCredit(letterOfCredit)

  return activeLegacyLetterOfCredit || activeStandbyLetterOfCredit || activeLetterOfCredit
}

const getTradeActionsForFinancialInstrumentsForBuyer = (
  legacyLetterOfCredit: ILetterOfCredit,
  legacyStandbyLetterOfCredit: IStandbyLetterOfCredit,
  letterOfCredit: ILetterOfCreditWithData
) => {
  const actions: TradeAction[] = []

  const applyActions = getActionsIfNoInstruments(legacyLetterOfCredit, legacyStandbyLetterOfCredit, letterOfCredit)

  if (applyActions) {
    return applyActions
  }

  if (activeInstrumentExists(legacyLetterOfCredit, legacyStandbyLetterOfCredit, letterOfCredit)) {
    return actions
  }

  actions.push(isRejectedLegacyLetterOfCredit(legacyLetterOfCredit) ? TradeAction.ReapplyForLC : TradeAction.ApplyForLC)
  actions.push(
    isRejectedStandbyLetterOfCredit(legacyStandbyLetterOfCredit) || isRejectedLetterOfCredit(letterOfCredit)
      ? TradeAction.ReapplyForSBLC
      : TradeAction.ApplyForSBLC
  )

  return actions
}

const isVaktTrade = (trade: ITradeEnriched) => trade.source === TradeSource.Vakt
const isSellerTrade = (trade: ITradeEnriched) => trade.tradingRole === TradingRole.SELLER
const canEditSellerTrade = (tradeRdStatus: string, rdStatus: RDStatus) =>
  rdStatus
    ? [RDStatus.QuoteAccepted, RDStatus.PendingRequest].includes(rdStatus)
    : tradeRdStatus === TRADE_STATUS.ToBeDiscounted

const canEditNonVaktTrade = (trade: ITradeEnriched, rdStatus?: RDStatus) =>
  !isSellerTrade(trade) || canEditSellerTrade(trade.status, rdStatus)

export const canEditTrade = (trade: ITradeEnriched, rdStatus?: RDStatus) =>
  !isVaktTrade(trade) && canEditNonVaktTrade(trade, rdStatus)

export const canDeleteTrade = (
  trade: ITradeEnriched,
  legacyLetterOfCredit?: ILetterOfCredit,
  standbyLetterOfCredit?: IStandbyLetterOfCredit,
  letterOfCredit?: ILetterOfCreditWithData,
  hideDeleteButton?: boolean
) =>
  !hideDeleteButton &&
  canEditTrade(trade) &&
  tradeDeletableLegacyLCPerspective(legacyLetterOfCredit) &&
  tradeDeletableSBLCPerspective(standbyLetterOfCredit) &&
  tradeDeletableLCPerspective(letterOfCredit)

const tradeDeletableLegacyLCPerspective = (letterOfCredit?: ILetterOfCredit) =>
  letterOfCredit ? isRejectedLegacyLetterOfCredit(letterOfCredit) : true
const tradeDeletableSBLCPerspective = (standbyLetterOfCredit?: IStandbyLetterOfCredit) =>
  standbyLetterOfCredit ? isRejectedStandbyLetterOfCredit(standbyLetterOfCredit) : true
const tradeDeletableLCPerspective = (letterOfCredit?: ILetterOfCreditWithData) =>
  letterOfCredit ? isRejectedLetterOfCredit(letterOfCredit) : true

export enum TradeAction {
  Edit = 'EDIT_TRADE',
  ApplyForLC = 'APPLY_FOR_LC',
  ReapplyForLC = 'REAPPLY_FOR_LC',
  ApplyForSBLC = 'APPLY_FOR_SBLC',
  ReapplyForSBLC = 'REAPPLY_FOR_SBLC',
  ViewLC = 'VIEW_LC',
  ViewLegacySBLC = 'VIEW_LEGACY_SBLC',
  ViewSBLC = 'VIEW_SBLC'
}

export const isCargoDataEntered = (cargo: ICargoBase) => {
  const isEdit = !!(cargo as ICargo)._id
  return isEdit || cargo.grade || cargo.parcels.length > 0 || cargo.quality || cargo.originOfGoods
}
