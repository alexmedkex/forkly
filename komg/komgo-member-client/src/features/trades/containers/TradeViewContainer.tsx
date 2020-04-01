import * as React from 'react'
import { Component } from 'react'
import { compose } from 'redux'
import styled from 'styled-components'

import {
  ErrorMessage,
  withPermissions,
  WithPermissionsProps,
  LoadingTransition,
  withLicenseCheck,
  WithLicenseCheckProps
} from '../../../components'

import { connect } from 'react-redux'
import { Loader } from 'semantic-ui-react'
import { ApplicationState } from '../../../store/reducers'
import { fetchMovements, fetchTradeWithDocuments, deleteTrade } from '../../trades/store/actions'
import { fetchTradesDashboardData } from '../store/actions'

import { RouteComponentProps, withRouter } from 'react-router-dom'
import { stringOrNull } from '../../../utils/types'
import { ITradeEnriched, TradeActionType } from '../../trades/store/types'
import { ICargo } from '@komgo/types'
import { Document } from '../../document-management'
import { addBuyerSellerEnrichedData, displayTradeStatus } from '../../trades/utils/displaySelectors'
import { tradeFinanceManager } from '@komgo/permissions'
import Unauthorized from '../../../components/unauthorized'
import { ILetterOfCredit } from '../../letter-of-credit-legacy/types/ILetterOfCredit'

import { loadingSelector } from '../../../store/common/selectors'
import { TradingRole, TRADE_STATUS } from '../constants'
import { LetterOfCreditActionType } from '../../letter-of-credit-legacy/store/types'
import { withLoaders, WithLoaderProps } from '../../../components/with-loaders'
import { isApplicantOnTrade } from '../utils/isApplicant'
import { IStandbyLetterOfCredit, IReceivablesDiscountingInfo } from '@komgo/types'
import { TradeAction } from '../utils/tradeActionUtils'
import { createRDApplyForDiscountingLink } from '../../receivable-finance/pages/dashboard/components/ExtraOptionsMenu'
import { getLatestFinancialInstrumentsForTrade } from '../utils/selectors'
import { ReceivableDiscountingApplicationActionType } from '../../receivable-discounting-legacy/store/application/types'
import { StandbyLetterOfCreditActionType } from '../../standby-letter-of-credit-legacy/store/types'
import { findErrors } from '../../../store/common/selectors/errorSelector'
import { ServerError } from '../../../store/common/types'
import { getCreateNewSBLCRoute } from '../components/ExtraOptionsMenu'
import { TradeView } from '../components/TradeView'
import Helmet from 'react-helmet'
import { TradeViewContentBar } from '../components/TradeViewContentBar'
import DeleteTradeConfirm from '../components/trade-form-fields/DeleteTradeConfirm'
import { sentenceCase } from '../../../utils/casings'
import { ILetterOfCreditWithData } from '../../letter-of-credit/store/types'
import { getCurrentCompanyStaticId } from '../../../store/common/selectors/state-selectors'

interface TradeViewProps {
  trade?: ITradeEnriched
  letterOfCredit?: ILetterOfCredit
  standbyLetterOfCredit?: IStandbyLetterOfCredit
  newLetterOfCredit?: ILetterOfCreditWithData
  rdInfo?: IReceivablesDiscountingInfo
  company: string
  error: stringOrNull
  tradeMovements: ICargo[]
  uploadedDocuments: Document[]
  isStatusFetching: boolean
  deleteTradeError: ServerError
  isDeleting: boolean
}

const Italic = styled.p`
  font-style: italic;
`

interface TradeViewActions {
  fetchMovements: (id: string) => any
  fetchTradesDashboardData: (params?: {}) => any
  fetchTradeWithDocuments: (id: string) => any
  deleteTrade(id: string): void
}

export interface IProps
  extends WithPermissionsProps,
    WithLicenseCheckProps,
    WithLoaderProps,
    RouteComponentProps<any>,
    TradeViewProps,
    TradeViewActions {}

interface TradeViewState {
  confirmDeleteTradeOpen: boolean
}

export class TradeViewContainer extends Component<IProps, TradeViewState> {
  constructor(props) {
    super(props)
    this.state = {
      confirmDeleteTradeOpen: false
    }
  }

  getTradeRole() {
    const { trade, company } = this.props
    return isApplicantOnTrade(trade, company) ? TradingRole.BUYER : TradingRole.SELLER
  }

  onButtonClick = (action?: TradeAction) => {
    const role = this.getTradeRole()

    if (role === TradingRole.BUYER) {
      this.handleBuyerAction(action)
    } else if (role === TradingRole.SELLER && this.props.isAuthorized(tradeFinanceManager.canCrudRD)) {
      const link: string = createRDApplyForDiscountingLink(this.props.trade!._id)
      this.props.history.push(link)
    }
  }

  handleBuyerAction = (action: TradeAction) => {
    if (action === TradeAction.ApplyForLC || action === TradeAction.ReapplyForLC) {
      this.props.history.push(`/financial-instruments/letters-of-credit/new?tradeId=${this.props.trade!._id}`)
    }

    if (action === TradeAction.ViewLC) {
      this.props.history.push(`/financial-instruments/letters-of-credit/${this.props.letterOfCredit!._id}`)
    }

    if (action === TradeAction.ApplyForSBLC || action === TradeAction.ReapplyForSBLC) {
      this.props.history.push(getCreateNewSBLCRoute(this.props.trade))
    }

    if (action === TradeAction.ViewLegacySBLC) {
      this.props.history.push(
        `/financial-instruments/standby-letters-of-credit/${this.props.standbyLetterOfCredit!.staticId}`
      )
    }

    if (action === TradeAction.ViewSBLC) {
      this.props.history.push(`/letters-of-credit/${this.props.newLetterOfCredit!.staticId}`)
    }
  }

  deleteTrade = () => {
    this.props.deleteTrade(this.props.match.params.id)
  }

  componentDidMount() {
    const { id } = this.props.match.params
    this.props.fetchMovements(id)
    this.props.fetchTradeWithDocuments(id)
    this.props.fetchTradesDashboardData({
      filter: {
        query: { ['_id']: id }
      }
    })
  }

  render() {
    const {
      isAuthorized,
      isLicenseEnabled,
      isLicenseEnabledForCompany,
      error,
      trade,
      company,
      tradeMovements,
      uploadedDocuments,
      isStatusFetching,
      letterOfCredit,
      standbyLetterOfCredit,
      newLetterOfCredit,
      deleteTradeError,
      isDeleting,
      isFetching,
      location: { search }
    } = this.props

    const urlSearchParams = new URLSearchParams(search)

    if (!isAuthorized(tradeFinanceManager.canReadTrades)) {
      return <Unauthorized />
    }

    if (error) {
      return <ErrorMessage title="Something went wrong" error={error} />
    }

    if (isFetching || !trade) {
      return <LoadingTransition title="Loading Trade" />
    }

    const tradeStatus = trade && trade.status ? trade.status : TRADE_STATUS.ToBeFinanced

    return (
      <>
        <Helmet>
          <title>Trade details</title>
        </Helmet>
        <TradeViewContentBar
          trade={trade}
          role={this.getTradeRole()}
          legacyLetterOfCredit={letterOfCredit}
          standbyLetterOfCredit={standbyLetterOfCredit}
          letterOfCredit={newLetterOfCredit}
          isStatusFetching={isStatusFetching}
          rdInfo={this.props.rdInfo}
          isAuthorized={isAuthorized}
          isLicenseEnabled={isLicenseEnabled}
          isLicenseEnabledForCompany={isLicenseEnabledForCompany}
          onButtonClick={this.onButtonClick}
          onDelete={() => this.setState({ confirmDeleteTradeOpen: true })}
          hideDeleteButton={urlSearchParams.get('hideDeleteButton') === 'true'}
          hideApplyButtons={urlSearchParams.get('hideApplyButtons') === 'true'}
        />
        <DeleteTradeConfirm
          cancel={() => this.setState({ confirmDeleteTradeOpen: false })}
          confirm={this.deleteTrade}
          open={this.state.confirmDeleteTradeOpen}
          tradeId={trade._id}
          error={deleteTradeError && deleteTradeError.message}
          isDeleting={isDeleting}
        />

        {isStatusFetching ? (
          <Loader active={true} inline={true} size="mini" />
        ) : (
          <Italic>{displayTradeStatus(tradeStatus)}</Italic>
        )}
        <TradeView
          trade={trade}
          tradeMovements={tradeMovements}
          company={company}
          uploadedDocuments={uploadedDocuments}
        />
      </>
    )
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: IProps): TradeViewProps => {
  const { id } = ownProps.match.params

  const trade = state
    .get('trades')
    .get('trades')
    .toJS()[id]
  const [tradeEnriched] = addBuyerSellerEnrichedData(
    getCurrentCompanyStaticId(state),
    trade ? [trade] : [],
    state
      .get('members')
      .get('byId')
      .toList()
      .toJS()
  )

  let letterOfCredit
  let standbyLetterOfCredit
  let newLetterOfCredit

  if (trade) {
    ;({ letterOfCredit, standbyLetterOfCredit, newLetterOfCredit } = getLatestFinancialInstrumentsForTrade(
      state,
      trade
    ))
  }

  const [deleteTradeError] = findErrors(state.get('errors').get('byAction'), [TradeActionType.DELETE_TRADE_REQUEST])

  return {
    trade: tradeEnriched,
    error: state.get('trades').get('error'),
    company: state.get('uiState').get('profile')!.company,
    tradeMovements: state
      .get('trades')
      .get('tradeMovements')
      .toJS(),
    uploadedDocuments: state
      .get('trades')
      .get('tradeDocuments')
      .toJS(),
    isStatusFetching: loadingSelector(state.get('loader').get('requests'), [
      LetterOfCreditActionType.LETTERS_OF_CREDIT_REQUEST,
      ReceivableDiscountingApplicationActionType.FETCH_MULTIPLE_APPLICATION_REQUEST
    ]),
    letterOfCredit,
    standbyLetterOfCredit,
    newLetterOfCredit,
    deleteTradeError,
    isDeleting: loadingSelector(state.get('loader').get('requests'), [TradeActionType.DELETE_TRADE_REQUEST], false),
    rdInfo: state
      .get('receivableDiscountingApplication')
      .get('byId')
      .toList()
      .toJS()
      .find((rdInfo: IReceivablesDiscountingInfo) => rdInfo.rd.tradeReference.sourceId === trade.sourceId)
  }
}

export default compose<any>(
  withLoaders({
    actions: [
      TradeActionType.TRADE_REQUEST,
      TradeActionType.TRADE_MOVEMENTS_REQUEST,
      TradeActionType.TRADE_DOCUMENTS_REQUEST,
      LetterOfCreditActionType.LETTERS_OF_CREDIT_REQUEST,
      StandbyLetterOfCreditActionType.FETCH_STANDBY_LETTERS_OF_CREDIT_REQUEST,
      ReceivableDiscountingApplicationActionType.FETCH_MULTIPLE_APPLICATION_REQUEST
    ]
  }),
  withPermissions,
  withLicenseCheck,
  withRouter,
  connect<TradeViewProps, TradeViewActions>(mapStateToProps, {
    fetchTradesDashboardData,
    fetchMovements,
    fetchTradeWithDocuments,
    deleteTrade
  })
)(TradeViewContainer)
