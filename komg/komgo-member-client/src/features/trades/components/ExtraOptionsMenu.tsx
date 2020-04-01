import * as React from 'react'
import { ITrade } from '@komgo/types'

import { WithPermissionsProps, withPermissions } from '../../../components'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { tradeFinanceManager, Permission } from '@komgo/permissions'
import { productRD } from '@komgo/products'
import { Dimmer, Loader, Dropdown } from 'semantic-ui-react'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { ApplicationState } from '../../../store/reducers'
import { ILetterOfCredit } from '../../letter-of-credit-legacy/types/ILetterOfCredit'
import { WithLicenseCheckProps, withLicenseCheck } from '../../../components/with-license-check'
import { loadingSelector } from '../../../store/common/selectors'
import { LetterOfCreditActionType as LegacyLetterOfCreditActionType } from '../../letter-of-credit-legacy/store/types'
import { IStandbyLetterOfCredit, IReceivablesDiscountingInfo } from '@komgo/types'
import { TradingRole } from '../constants'
import { getLatestFinancialInstrumentsForTrade } from '../utils/selectors'
import { getTradeActionsForFinancialInstruments, TradeAction, canEditTrade } from '../utils/tradeActionUtils'
import {
  ExtraOptionsMenuForRDProps,
  createRDApplyForDiscountingLink,
  isRDApplyForDiscountingValid
} from '../../receivable-finance/pages/dashboard/components/ExtraOptionsMenu'
import { StandbyLetterOfCreditActionType } from '../../standby-letter-of-credit-legacy/store/types'
import { ReceivableDiscountingApplicationActionType } from '../../receivable-discounting-legacy/store/application/types'
import { Strings } from '../../receivable-discounting-legacy/resources/strings'
import { stringify } from 'qs'
import { ILetterOfCreditWithData, LetterOfCreditActionType } from '../../letter-of-credit/store/types'
import { ITradeEnriched } from '../store/types'

export interface ExtraOptionsMenuOwnProps {
  tradeId: string
  sourceId: string
  role: TradingRole
}

export interface ExtraOptionsMenuAllProps
  extends WithPermissionsProps,
    ExtraOptionsMenuOwnProps,
    WithLicenseCheckProps,
    RouteComponentProps<any> {
  trade: ITradeEnriched
  letterOfCredit?: ILetterOfCredit
  standbyLetterOfCredit?: IStandbyLetterOfCredit
  newLetterOfCredit?: ILetterOfCreditWithData
  rdMenuProps?: ExtraOptionsMenuForRDProps
  isFetching: boolean
}

export const DISABLED: any = {
  color: 'currentColor',
  cursor: 'not-allowed',
  pointerEvents: 'none',
  opacity: 0.5,
  textDecoration: 'none'
}

interface IOption {
  label: string
  name: string
  buildLink: (props: ExtraOptionsMenuAllProps) => string
  permission: Permission
  isValid: (props: ExtraOptionsMenuAllProps) => boolean
}

const VIEW_OPTION: IOption = {
  label: 'View Trade Details',
  name: 'details',
  buildLink: (props: ExtraOptionsMenuAllProps) => `/trades/${props.trade!._id}`,
  permission: tradeFinanceManager.canReadTrades,
  isValid: () => true
}
const EDIT_OPTION: IOption = {
  label: 'Edit Trade',
  name: 'editTrade',
  buildLink: (props: ExtraOptionsMenuAllProps) => `/trades/${props.trade._id}/edit`,
  permission: tradeFinanceManager.canCrudTrades,
  isValid: (props: ExtraOptionsMenuAllProps) =>
    canEditTrade(props.trade, props.rdMenuProps && props.rdMenuProps.rdStatus)
}

const TRADE_OPTIONS = [VIEW_OPTION, EDIT_OPTION]

const getCreateLCRoute = (trade: ITrade) => {
  return `/financial-instruments/letters-of-credit/new?tradeId=${trade!._id}`
}

const getCreateSBLCRoute = (trade: ITrade) => {
  return `/financial-instruments/standby-letters-of-credit/new?source=${trade!.source}&sourceId=${trade!.sourceId}`
}

// TEMP HACK

export const getCreateNewSBLCRoute = (trade: ITrade) => {
  const params = stringify({
    select: true,
    redirectTo: `/letters-of-credit/new?source=${trade!.source}&sourceId=${trade!.sourceId}`,
    type: 'SBLC'
  })
  return `/templates?${params}`
}

// END HACK

const isFinancialInstrumentActionAllowed = (props: ExtraOptionsMenuAllProps, action: TradeAction) => {
  return getTradeActionsForFinancialInstruments(
    props.trade,
    props.role,
    props.letterOfCredit,
    props.standbyLetterOfCredit,
    props.newLetterOfCredit
  ).includes(action)
}

const FINANCIAL_INSTRUMENT_OPTIONS: IOption[] = [
  {
    label: 'Apply for LC',
    name: 'applyforLc',
    buildLink: (props: ExtraOptionsMenuAllProps) => getCreateLCRoute(props.trade),
    permission: tradeFinanceManager.canManageLCRequests,
    isValid: (props: ExtraOptionsMenuAllProps) => isFinancialInstrumentActionAllowed(props, TradeAction.ApplyForLC)
  },
  {
    label: 'Reapply for LC',
    name: 'reapplyforLc',
    buildLink: (props: ExtraOptionsMenuAllProps) => getCreateLCRoute(props.trade),
    permission: tradeFinanceManager.canManageLCRequests,
    isValid: (props: ExtraOptionsMenuAllProps) => isFinancialInstrumentActionAllowed(props, TradeAction.ReapplyForLC)
  },
  {
    label: 'View LC Details',
    name: 'viewLc',
    buildLink: (props: ExtraOptionsMenuAllProps) =>
      props.letterOfCredit ? `/financial-instruments/letters-of-credit/${props.letterOfCredit._id}` : '#',
    permission: tradeFinanceManager.canManageLCRequests,
    isValid: (props: ExtraOptionsMenuAllProps) => isFinancialInstrumentActionAllowed(props, TradeAction.ViewLC)
  },
  {
    label: 'View Legacy SBLC Details',
    name: 'viewSBLC',
    buildLink: (props: ExtraOptionsMenuAllProps) =>
      props.standbyLetterOfCredit
        ? `/financial-instruments/standby-letters-of-credit/${props.standbyLetterOfCredit.staticId}`
        : '#',
    permission: tradeFinanceManager.canManageLCRequests,
    isValid: (props: ExtraOptionsMenuAllProps) => isFinancialInstrumentActionAllowed(props, TradeAction.ViewLegacySBLC)
  },
  {
    label: 'Apply for SBLC',
    name: 'applyfornewSBLC',
    buildLink: (props: ExtraOptionsMenuAllProps) => getCreateNewSBLCRoute(props.trade),
    permission: tradeFinanceManager.canManageLCRequests,
    isValid: (props: ExtraOptionsMenuAllProps) => isFinancialInstrumentActionAllowed(props, TradeAction.ApplyForSBLC)
  },
  {
    label: 'Reapply for SBLC',
    name: 'reapplyfornewSBLC',
    buildLink: (props: ExtraOptionsMenuAllProps) => getCreateNewSBLCRoute(props.trade),
    permission: tradeFinanceManager.canManageLCRequests,
    isValid: (props: ExtraOptionsMenuAllProps) => isFinancialInstrumentActionAllowed(props, TradeAction.ReapplyForSBLC)
  },
  {
    label: 'View SBLC Details',
    name: 'viewNewSBLC',
    buildLink: (props: ExtraOptionsMenuAllProps) =>
      props.newLetterOfCredit ? `/letters-of-credit/${props.newLetterOfCredit.staticId}` : '#',
    permission: tradeFinanceManager.canManageLCRequests,
    isValid: (props: ExtraOptionsMenuAllProps) => isFinancialInstrumentActionAllowed(props, TradeAction.ViewSBLC)
  }
]

const BUYER_OPTIONS = [...TRADE_OPTIONS, ...FINANCIAL_INSTRUMENT_OPTIONS]

const RD_APPLY_FOR_DISCOUNTING_OPTION: IOption = {
  label: Strings.ApplyForDiscountingRiskCoverActionText,
  name: 'applyforDiscounting',
  permission: tradeFinanceManager.canReadRD,
  buildLink: (props: ExtraOptionsMenuAllProps) => createRDApplyForDiscountingLink(props.tradeId),
  isValid: (props: ExtraOptionsMenuAllProps) =>
    isSeller(props.role) && isRDApplyForDiscountingValid(props.rdMenuProps) && props.isLicenseEnabled(productRD)
}

const TRADE_DASHBOARD_RD_OPTIONS: IOption[] = [VIEW_OPTION, EDIT_OPTION, RD_APPLY_FOR_DISCOUNTING_OPTION]

const isSeller = (role: TradingRole) => role === TradingRole.SELLER
const isBuyer = (role: TradingRole) => role === TradingRole.BUYER

export const ExtraOptionsMenuFactory = (props: ExtraOptionsMenuAllProps): JSX.Element[] => {
  const { isFetching, isAuthorized, role, history } = props
  const options = role === TradingRole.BUYER ? BUYER_OPTIONS.filter(o => o.isValid(props)) : TRADE_DASHBOARD_RD_OPTIONS

  const usedOptions = options.map((option: IOption) => ({
    ...option,
    disabled: !isAuthorized(option.permission) || !option.isValid(props)
  }))
  const availableOptions = usedOptions.map(({ disabled, name, buildLink, label }, idx) => (
    <Dropdown.Item
      key={`${name}-${idx}`}
      data-test-id={name}
      disabled={disabled}
      name={name}
      onClick={() => history.push(buildLink(props))}
    >
      {label}
    </Dropdown.Item>
  ))

  return isFetching
    ? [
        <Dimmer active={true} inverted={true} key={'dimmer'}>
          <Loader inverted={true} size="mini" />
        </Dimmer>
      ]
    : availableOptions
}

const mapStateToProps = (
  state: ApplicationState,
  ownProps: ExtraOptionsMenuOwnProps
): Partial<ExtraOptionsMenuAllProps> => {
  let letterOfCredit: ILetterOfCredit
  let standbyLetterOfCredit: IStandbyLetterOfCredit
  let newLetterOfCredit: ILetterOfCreditWithData
  let rdMenuProps: ExtraOptionsMenuForRDProps
  let isFetching

  const trade = state
    .get('trades')
    .get('trades')
    .toJS()[ownProps.tradeId]

  if (ownProps.role === TradingRole.BUYER) {
    ;({ letterOfCredit, standbyLetterOfCredit, newLetterOfCredit } = getLatestFinancialInstrumentsForTrade(
      state,
      trade
    ))
    isFetching = loadingSelector(state.get('loader').get('requests'), [
      LegacyLetterOfCreditActionType.LETTERS_OF_CREDIT_REQUEST,
      StandbyLetterOfCreditActionType.FETCH_STANDBY_LETTERS_OF_CREDIT_REQUEST,
      LetterOfCreditActionType.FETCH_LETTERS_OF_CREDIT_REQUEST
    ])
  } else if (ownProps.role === TradingRole.SELLER) {
    const rdInfo: IReceivablesDiscountingInfo = state
      .get('receivableDiscountingApplication')
      .get('byId')
      .toList()
      .toJS()
      .find((rdInfo: IReceivablesDiscountingInfo) => rdInfo.rd.tradeReference.sourceId === ownProps.sourceId)
    if (rdInfo) {
      rdMenuProps = {
        rdId: rdInfo.rd.staticId,
        rdStatus: rdInfo.status
      }
    }
    isFetching = loadingSelector(state.get('loader').get('requests'), [
      ReceivableDiscountingApplicationActionType.FETCH_MULTIPLE_APPLICATION_REQUEST
    ])
  }

  return {
    letterOfCredit,
    standbyLetterOfCredit,
    newLetterOfCredit,
    trade,
    rdMenuProps,
    isFetching
  }
}

export default compose<any>(withPermissions, withLicenseCheck, withRouter, connect(mapStateToProps))(
  ExtraOptionsMenuFactory
)
