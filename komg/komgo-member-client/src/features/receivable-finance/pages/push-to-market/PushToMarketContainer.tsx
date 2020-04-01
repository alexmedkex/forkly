import * as React from 'react'
import { compose } from 'redux'
import { connect, Dispatch } from 'react-redux'
import { Button, Card } from 'semantic-ui-react'
import { withRouter, RouteComponentProps } from 'react-router'
import _ from 'lodash'

import {
  withPermissions,
  WithPermissionsProps,
  withLicenseCheck,
  WithLicenseCheckProps,
  ErrorMessage,
  LoadingTransition
} from '../../../../components'
import { ApplicationState } from '../../../../store/reducers'

import { WithLoaderProps, withLoaders } from '../../../../components/with-loaders'
import { Counterparty, CounterpartiesActionType } from '../../../counterparties/store/types'
import Text from '../../../../components/text'
import MemberMarketSelectionTable from './components/MemberMarketSelectionTable'
import { fetchConnectedCounterpartiesAsync } from '../../../counterparties/store/actions'
import { stringOrNull } from '../../../../utils/types'
import SubmitConfirm from './components/SubmitConfirm'
import { loadingSelector } from '../../../../store/common/selectors'
import {
  setCreateRequestForProposalError,
  createRequestForProposal,
  fetchRDRequesForProposalMembersData
} from '../../../receivable-discounting-legacy/store/actions'
import {
  ICreateRequestForProposal,
  ReceivableDiscountingActionType,
  IMemberMarketSelectionItem
} from '../../../receivable-discounting-legacy/store/types'
import { ReceivableDiscountingApplicationActionType } from '../../../receivable-discounting-legacy/store/application/types'
import { productRD } from '@komgo/products'
import Unauthorized from '../../../../components/unauthorized'
import { tranformToMemberMarketSelectionData } from '../../../receivable-discounting-legacy/selectors/memberMarketSelectionSelectors'
import { TradeActionType, ITradeEnriched } from '../../../trades/store/types'
import { CreditLineType, IDisclosedCreditLine, CreditLineActionType } from '../../../credit-line/store/types'
import { IReceivablesDiscountingInfo, ITrade } from '@komgo/types'
import { getReceivableDiscountingInfoByRdId } from '../../../receivable-discounting-legacy/utils/state-selectors'
import { getTradeBySourceId } from '../../../trades/utils/state-selectors'
import { createRDApplyForDiscountingLink } from '../dashboard/components/ExtraOptionsMenu'
import { getAllDisclosedCreditLinesArray } from '../../../credit-line/utils/state-selectors'
import { TemplateLayout } from '../../../templates/components/TemplateLayout'
import { RDTopbarFactory } from '../../../receivable-discounting-legacy/presentation/RDTopbarFactory'
import { addBuyerSellerEnrichedData } from '../../../trades/utils/displaySelectors'
import { getMembersList, getCurrentCompanyStaticId } from '../../../../store/common/selectors/state-selectors'
import { SpacedFixedButtonBar } from '../../../receivable-discounting-legacy/components/generics'
import { StyledCard } from '../../../../components/styled-components'

export interface IPushToMarketContainerProps
  extends WithPermissionsProps,
    WithLicenseCheckProps,
    WithLoaderProps,
    RouteComponentProps<any> {
  rdId: string
  trade: ITradeEnriched
  tradeTechnicalId: string
  data: IMemberMarketSelectionItem[]
  counterparties: Counterparty[]
  createRequestForProposalLoader: boolean
  confirmError: stringOrNull
  dispatch: Dispatch<any>
  setCreateRequestForProposalError: (payload: stringOrNull) => null
  fetchConnectedCounterpartiesAsync: (params?: {}) => null
  fetchRDRequesForProposalMembersData: (rdId: string) => null
  createRequestForProposal: (request: ICreateRequestForProposal) => null
}

interface IPushToMarketContainerState {
  openConfirm: boolean
  counterpartySelection: Counterparty[]
  toggleAll: boolean
}

export class PushToMarketContainer extends React.Component<IPushToMarketContainerProps, IPushToMarketContainerState> {
  constructor(props: IPushToMarketContainerProps) {
    super(props)
    this.state = {
      openConfirm: false,
      counterpartySelection: [],
      toggleAll: false
    }
  }

  componentDidMount() {
    this.props.fetchConnectedCounterpartiesAsync()
    this.props.fetchRDRequesForProposalMembersData(this.props.rdId)
  }

  canPushToMarket() {
    return this.state.counterpartySelection.length > 0
  }

  handlePushToMarket = () => {
    this.setState({
      openConfirm: true
    })
  }

  handleCancelSubmit = () => {
    this.setState({
      openConfirm: false
    })
    if (this.props.confirmError) {
      this.props.setCreateRequestForProposalError(null)
    }
  }

  handleConfirmSubmit = () => {
    if (this.props.confirmError) {
      this.props.setCreateRequestForProposalError(null)
    }
    const participantStaticIds = this.state.counterpartySelection.map(counterparty => counterparty.staticId)
    this.props.createRequestForProposal({
      rdId: this.props.rdId,
      participantStaticIds
    })
  }

  handleCheckboxClick = (counterparty?: Counterparty): void => {
    const { counterpartySelection, toggleAll } = this.state

    if (!counterparty) {
      // Set all/none and toggle boolean
      this.setState({ toggleAll: !toggleAll }, () => this.setAllOrNoneCounterparties())
      return
    }

    // Counterparty does not exist in list - add it
    if (!counterpartySelection.includes(counterparty)) {
      this.setState({
        counterpartySelection: [...this.state.counterpartySelection, counterparty]
      })
      // Counterparty exists in list - remove it
    } else {
      const filteredArray = this.state.counterpartySelection.filter(cp => counterparty !== cp)
      this.setState({ counterpartySelection: filteredArray })
    }
  }

  setAllOrNoneCounterparties = () => {
    const { toggleAll } = this.state
    const { counterparties, isLicenseEnabledForCompany } = this.props
    toggleAll
      ? this.setState({
          counterpartySelection: counterparties.filter(c => isLicenseEnabledForCompany(productRD, c.staticId))
        })
      : this.setState({ counterpartySelection: [] })
  }

  render() {
    const {
      errors,
      counterparties,
      data,
      confirmError,
      createRequestForProposalLoader,
      isFetching,
      isLicenseEnabled,
      isLicenseEnabledForCompany,
      history,
      tradeTechnicalId,
      trade
    } = this.props
    const { counterpartySelection } = this.state
    const [error] = errors

    if (!isLicenseEnabled(productRD)) {
      return <Unauthorized />
    }

    if (error) {
      return <ErrorMessage title="Request for Proposals error" error={error} />
    }

    if (isFetching || !data) {
      return <LoadingTransition title="Loading counterparties and credit appetite" />
    }

    if (!isFetching && counterparties.length === 0) {
      return (
        <ErrorMessage
          title="Missing counterparties"
          error="You need at least one financial institution as a counterparty to apply for discounting."
        />
      )
    }

    return (
      trade && (
        <TemplateLayout
          title={'Submit request for proposal'}
          infos={RDTopbarFactory.createApplyForDiscountingTopBarInfoItems(trade)}
          withPadding={true}
        >
          <StyledCard>
            <Card.Content>
              <Text>At least one finance provider needs to be selected</Text>

              <MemberMarketSelectionTable
                data={data}
                isLicenseEnabled={isLicenseEnabled}
                isLicenseEnabledForCompany={isLicenseEnabledForCompany}
                handleCheckboxClick={this.handleCheckboxClick}
                selectedData={counterpartySelection}
              />
            </Card.Content>
          </StyledCard>

          <SpacedFixedButtonBar>
            <Button
              type="button"
              data-test-id="button-previous"
              floated="right"
              onClick={() => history.push(createRDApplyForDiscountingLink(tradeTechnicalId))}
            >
              Previous
            </Button>
            <Button
              primary={true}
              floated="right"
              disabled={!this.canPushToMarket()}
              type="submit"
              data-test-id="button-push-to-market"
              onClick={() => {
                this.handlePushToMarket()
                window.scrollTo(0, 0)
              }}
            >
              Push to market
            </Button>

            <SubmitConfirm
              isSubmitting={createRequestForProposalLoader}
              open={this.state.openConfirm}
              counterparties={this.state.counterpartySelection}
              cancelSubmit={this.handleCancelSubmit}
              submit={this.handleConfirmSubmit}
              error={confirmError}
            />
          </SpacedFixedButtonBar>
        </TemplateLayout>
      )
    )
  }
}

export const mapStateToProps = (state: ApplicationState, ownProps: IPushToMarketContainerProps) => {
  const rdId = ownProps.match.params.rdId

  const filteredCounterparties = state
    .get('counterparties')
    .get('counterparties')
    .filter(counterparty => counterparty.isFinancialInstitution && counterparty.isMember)

  const createRequestForProposalLoader = loadingSelector(
    state.get('loader').get('requests'),
    [ReceivableDiscountingActionType.CREATE_REQUEST_FOR_PROPOSAL_REQUEST],
    false
  )

  const allDisclosedCreditLines: IDisclosedCreditLine[] = getAllDisclosedCreditLinesArray(
    state,
    CreditLineType.RiskCover
  )

  let data: IMemberMarketSelectionItem[]
  let tradeTechnicalId: string
  let tradeEnriched: ITradeEnriched[]
  if (!ownProps.isFetching) {
    const rdInfo: IReceivablesDiscountingInfo = getReceivableDiscountingInfoByRdId(state, rdId)
    if (rdInfo) {
      const trade: ITrade = getTradeBySourceId(
        state,
        rdInfo.rd.tradeReference.source,
        rdInfo.rd.tradeReference.sourceId
      )
      data = tranformToMemberMarketSelectionData(
        filteredCounterparties,
        allDisclosedCreditLines.filter((line: IDisclosedCreditLine) => line.counterpartyStaticId === trade.buyer)
      )

      tradeTechnicalId = trade._id
      tradeEnriched = addBuyerSellerEnrichedData(
        getCurrentCompanyStaticId(state),
        trade ? [trade] : [],
        getMembersList(state)
      )
    }
  }

  return {
    rdId,
    trade: tradeEnriched ? tradeEnriched[0] : undefined,
    tradeTechnicalId,
    data,
    counterparties: filteredCounterparties,
    confirmError: state.get('receivableDiscounting').get('error'),
    createRequestForProposalLoader
  }
}

export default compose<any>(
  withLoaders({
    actions: [
      CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_REQUEST,
      ReceivableDiscountingApplicationActionType.FETCH_APPLICATION_REQUEST,
      TradeActionType.TRADES_REQUEST,
      CreditLineActionType.FetchDisclosedCreditLinesForCounterpartyRequest
    ]
  }),
  withPermissions,
  withLicenseCheck,
  withRouter,
  connect(mapStateToProps, {
    fetchConnectedCounterpartiesAsync,
    fetchRDRequesForProposalMembersData,
    createRequestForProposal,
    setCreateRequestForProposalError
  })
)(PushToMarketContainer)
