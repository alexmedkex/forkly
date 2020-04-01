import React from 'react'
import { canEditTrade } from '../../../../trades/utils/tradeActionUtils'
import { IReceivablesDiscountingInfo, RDStatus, ITradeSnapshot, IHistory } from '@komgo/types'
import { addBuyerSellerEnrichedData } from '../../../../trades/utils/displaySelectors'
import {
  ReceivablesDiscountingRole,
  ReceivableDiscountingViewPanels,
  ReturnContext
} from '../../../../receivable-discounting-legacy/utils/constants'
import { getMembersList, getCurrentCompanyStaticId } from '../../../../../store/common/selectors/state-selectors'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { fetchHistoryForTrade } from '../../../../receivable-discounting-legacy/store/actions'
import { ApplicationState } from '../../../../../store/reducers'
import { ITradeEnriched } from '../../../../trades/store/types'
import { ReceivableDiscountingTradeView } from '../../../../receivable-discounting-legacy/components/receivable-discounting-application/ReceivableDiscountingTradeView'
import { RouteComponentProps, withRouter } from 'react-router'
import { AccordionTitleProps } from 'semantic-ui-react'
import { CachedDataProvider, ICachedData } from '../../../../../components/cached-data-provider'
import { isLaterThan } from '../../../../../utils/date'

interface ITradeViewDataContainerOwnProps {
  discountingRequest: IReceivablesDiscountingInfo
  role: ReceivablesDiscountingRole
}

interface IProps {
  companyStaticId: string
  trade?: ITradeEnriched
  fetchHistoryForTrade: (sourceId: string) => void
  tradeCargoHistory?: IHistory<ITradeSnapshot>
}

export type ITradeViewDataContainerProps = ITradeViewDataContainerOwnProps & IProps & RouteComponentProps<any>

interface ITradeViewDataContainerState {
  active: boolean
}

export class TradeViewDataContainer extends React.Component<
  ITradeViewDataContainerProps,
  ITradeViewDataContainerState
> {
  state = {
    active: this.shouldExpandTradeSummary()
  }

  componentDidMount() {
    if (this.props.discountingRequest.status === RDStatus.QuoteAccepted) {
      this.props.fetchHistoryForTrade(this.props.trade.sourceId)
    }
  }

  shouldExpandTradeSummary(): boolean {
    const { role, discountingRequest } = this.props

    const traderRule =
      role === ReceivablesDiscountingRole.Trader &&
      discountingRequest &&
      (discountingRequest.status === RDStatus.Requested || discountingRequest.status === RDStatus.QuoteSubmitted)

    const bankRule =
      role === ReceivablesDiscountingRole.Bank && discountingRequest && discountingRequest.status === RDStatus.Requested
    return traderRule || bankRule
  }

  handleAccordionClick = (e: React.SyntheticEvent, titleProps: AccordionTitleProps) => {
    this.setState({
      active: !this.state.active
    })
  }

  handleEditClicked = (): void => {
    const { trade, discountingRequest } = this.props

    this.props.history.push({
      pathname: `/trades/${trade._id}/edit`,
      search: `?returnContext=${ReturnContext.RDViewRequest}&returnId=${discountingRequest.rd.staticId}`
    })
  }

  render() {
    const { discountingRequest, trade, role, companyStaticId, tradeCargoHistory } = this.props
    const { active } = this.state
    const sectionId = id => `${id}-trade-summary`
    const editable = role === ReceivablesDiscountingRole.Trader && canEditTrade(trade, discountingRequest.status)

    return (
      discountingRequest &&
      trade && (
        <CachedDataProvider
          id={sectionId(discountingRequest.rd.staticId)}
          data={active ? discountingRequest.tradeSnapshot.createdAt : null}
        >
          {({ cached: lastCreatedAt }: ICachedData<string>) => (
            <ReceivableDiscountingTradeView
              tradeMovements={discountingRequest ? discountingRequest.tradeSnapshot.movements : []}
              company={companyStaticId}
              trade={trade}
              index={ReceivableDiscountingViewPanels.TradeSummary}
              open={active}
              changed={lastCreatedAt ? isLaterThan(discountingRequest.tradeSnapshot.createdAt, lastCreatedAt) : false}
              tradeCargoHistory={tradeCargoHistory}
              handleClick={this.handleAccordionClick}
              handleEditClicked={editable ? this.handleEditClicked : undefined}
            />
          )}
        </CachedDataProvider>
      )
    )
  }
}

export const mapStateToProps = (state: ApplicationState, ownProps: ITradeViewDataContainerOwnProps) => {
  const [trade] = addBuyerSellerEnrichedData(
    getCurrentCompanyStaticId(state),
    ownProps.discountingRequest ? [ownProps.discountingRequest.tradeSnapshot!.trade] : [],
    getMembersList(state)
  )
  let tradeCargoHistory
  if (trade) {
    tradeCargoHistory =
      state
        .get('receivableDiscounting')
        .get('tradeSnapshotHistoryById')
        .toJS()[trade.sourceId] || undefined
  }
  return {
    companyStaticId: getCurrentCompanyStaticId(state),
    trade,
    tradeCargoHistory
  }
}

export default compose<any>(
  withRouter,
  connect<any, any, ITradeViewDataContainerOwnProps>(mapStateToProps, { fetchHistoryForTrade })
)(TradeViewDataContainer)
