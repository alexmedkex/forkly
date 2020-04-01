import React from 'react'
import { IReceivablesDiscountingInfo, IQuoteBase } from '@komgo/types'
import { ReceivableDiscountingActionType } from '../../../receivable-discounting-legacy/store/types'
import {
  ErrorMessage,
  WithPermissionsProps,
  withPermissions,
  WithLicenseCheckProps,
  withLicenseCheck,
  Unauthorized,
  LoadingTransition
} from '../../../../components'
import { fetchConnectedCounterpartiesAsync } from '../../../counterparties/store/actions'
import { addBuyerSellerEnrichedData } from '../../../trades/utils/displaySelectors'
import { IMember, MemberActionType } from '../../../members/store/types'
import { SpacedFixedButtonBar } from '../../../receivable-discounting-legacy/components/generics'
import { Button, Tab, TabProps } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { ApplicationState } from '../../../../store/reducers'
import { RouteComponentProps, withRouter } from 'react-router'
import { compose } from 'redux'
import { bankCreateQuote } from '../../../receivable-discounting-legacy/store/actions'
import { getMembersList, getCurrentCompanyStaticId } from '../../../../store/common/selectors/state-selectors'
import { getReceivableDiscountingInfoByRdId } from '../../../receivable-discounting-legacy/utils/state-selectors'
import { withLoaders, WithLoaderProps } from '../../../../components/with-loaders'
import { ReceivableDiscountingApplicationActionType } from '../../../receivable-discounting-legacy/store/application/types'
import { productRD } from '@komgo/products'
import { tradeFinanceManager } from '@komgo/permissions'
import { loadingSelector } from '../../../../store/common/selectors'
import { ServerError } from '../../../../store/common/types'
import { displaySimpleRequestType } from '../../../receivable-discounting-legacy/utils/displaySelectors'
import { SPACES } from '@komgo/ui-components'
import styled from 'styled-components'
import { TemplateLayout } from '../../../templates/components/TemplateLayout'
import { ColumnWrapper, StyledSecondaryPointingTab } from '../../../../components/styled-components'
import { DiscountingRequestInfoPane } from '../../entities/rd/components/DiscountingRequestInfoPane'
import { Dimensions } from '../../../receivable-discounting-legacy/resources/dimensions'
import { SubmitQuoteForm } from './components/SubmitQuoteForm'
import { Strings } from '../../../receivable-discounting-legacy/resources/strings'
import { RDTopbarFactory } from '../../../receivable-discounting-legacy/presentation/RDTopbarFactory'
import { ReceivablesDiscountingRole } from '../../../receivable-discounting-legacy/utils/constants'
import { fetchRDRequesForSubmitQuote } from './store/actions'
import { CreditLineActionType, IExtendedCreditLine } from '../../../credit-line/store/types'
import { getRDExtendedCreditLine } from './utils/state-selectors'
import { CreditAppetiteInformationPanel } from './components/CreditAppetiteInformationPanel'
import { ITradeEnriched } from '../../../trades/store/types'
import { toKebabCase } from '../../../../utils/casings'

export interface ISubmitQuoteContainerProps
  extends WithLicenseCheckProps,
    WithPermissionsProps,
    WithLoaderProps,
    RouteComponentProps<{ rdId: string }> {
  discountingRequest: IReceivablesDiscountingInfo
  creditAppetite: IExtendedCreditLine
  members: IMember[]
  trade: ITradeEnriched
  isSubmitting: boolean
  receivablesDiscountingError?: string | ServerError
  bankCreateQuote: (quote: IQuoteBase, rdId: string) => void
  fetchRDRequesForSubmitQuote: (rdId: string, chainHandler?: () => void) => void
  fetchConnectedCounterpartiesAsync: () => void
}

interface ISubmitQuoteContainerState {
  activeTab: number
}

export class SubmitQuoteContainer extends React.Component<ISubmitQuoteContainerProps, ISubmitQuoteContainerState> {
  constructor(props: ISubmitQuoteContainerProps) {
    super(props)

    this.state = {
      activeTab: 0
    }
  }

  componentDidMount() {
    const { rdId } = this.props.match.params
    this.props.fetchRDRequesForSubmitQuote(rdId)
    this.props.fetchConnectedCounterpartiesAsync()
  }

  componentDidUpdate(prevProps) {
    const { rdId } = this.props.match.params
    if (prevProps.match.params.rdId !== rdId) {
      this.props.fetchRDRequesForSubmitQuote(rdId)
    }
  }

  getTabs = () => {
    const { discountingRequest, creditAppetite: creditAppetite, trade } = this.props
    return {
      RD: {
        name: Strings.RequestTabName,
        index: 0,
        menuItem: Strings.RequestTabName,
        pane: (
          <StyledTabPane
            key={Strings.RequestTabName}
            data-test-id={`tab-content-${toKebabCase(Strings.RequestTabName)}`}
          >
            <DiscountingRequestInfoPane discountingRequest={discountingRequest} />
          </StyledTabPane>
        )
      },
      CreditAppetite: {
        name: Strings.CreditAppetiteTabName,
        index: 1,
        menuItem: Strings.CreditAppetiteTabName,
        pane: (
          <StyledTabPane
            key={Strings.CreditAppetiteTabName}
            data-test-id={`tab-content-${toKebabCase(Strings.CreditAppetiteTabName)}`}
          >
            <CreditAppetiteInformationPanel
              buyerName={trade.buyerName}
              creditLine={creditAppetite}
              sellerName={trade.sellerName}
              sellerStaticId={trade.seller}
            />
          </StyledTabPane>
        )
      }
    }
  }

  getPanes = () => {
    const tabs = Object.values(this.getTabs()).filter(tab => this.canViewTab(tab.name))
    return tabs.map(tab => ({ menuItem: tab.menuItem, pane: tab.pane }))
  }

  canViewTab = (tabName: string) => {
    switch (tabName) {
      case Strings.RequestTabName:
        return this.canViewRD()
      case Strings.CreditAppetiteTabName:
        return this.canViewCreditAppetite()
      default:
        return false
    }
  }

  canViewRD = () => this.props.isAuthorized(tradeFinanceManager.canReadRDRequests)
  canViewCreditAppetite = () => this.props.isAuthorized(tradeFinanceManager.canReadRDRequests)

  handleTabChanges = (_: React.MouseEvent<HTMLDivElement>, data: TabProps) => {
    const [active] = Object.values(this.getTabs()).filter(t => t.index === data.activeIndex)
    this.setState({ activeTab: active.index })
  }

  render() {
    const {
      discountingRequest,
      members,
      isAuthorized,
      isLicenseEnabled,
      isFetching,
      isSubmitting,
      trade,
      errors,
      receivablesDiscountingError
    } = this.props

    if (!isLicenseEnabled(productRD) || !isAuthorized(tradeFinanceManager.canCrudRDRequests)) {
      return <Unauthorized />
    }

    if (isFetching) {
      return <LoadingTransition title="Loading Request for Discounting" />
    }

    if (errors.length > 0) {
      return <ErrorMessage title="Something went wrong" error={errors[0]} />
    }

    const title = `Submit quote for ${displaySimpleRequestType(
      discountingRequest.rd.requestType
    ).toLocaleLowerCase()} request`

    return (
      discountingRequest && (
        <TemplateLayout
          title={title}
          infos={RDTopbarFactory.createTopbarInfoItems(
            trade,
            discountingRequest,
            members,
            ReceivablesDiscountingRole.Bank
          )}
          withPadding={false}
        >
          <ColumnWrapper>
            <ColumnSection>
              <SubmitQuoteForm
                bankCreateQuote={this.props.bankCreateQuote}
                rdId={this.props.match.params.rdId}
                discountingRequest={discountingRequest}
                sellerName={trade.sellerName}
                isSubmitting={isSubmitting}
                receivablesDiscountingError={receivablesDiscountingError}
              />
            </ColumnSection>

            <ColumnSectionFixed>
              <StyledSecondaryPointingTab
                panes={this.getPanes()}
                onTabChange={this.handleTabChanges}
                activeIndex={this.state.activeTab}
                renderActiveOnly={false}
                data-test-id="rd-details-tab"
                menu={{ secondary: true, pointing: true }}
              />
            </ColumnSectionFixed>
          </ColumnWrapper>

          <SpacedFixedButtonBar>
            <Button
              role="button"
              onClick={() => this.props.history.push(`/receivable-discounting/${this.props.match.params.rdId}`)}
              data-test-id="bank-submit-quote-cancel-btn"
            >
              Cancel
            </Button>
            <Button
              primary={true}
              content="Submit quote"
              form="bank-submit-quote-form"
              type="submit"
              data-test-id="bank-submit-quote-submit-btn"
            />
          </SpacedFixedButtonBar>
        </TemplateLayout>
      )
    )
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: ISubmitQuoteContainerProps) => {
  const members = getMembersList(state)
  const discountingRequest: IReceivablesDiscountingInfo = getReceivableDiscountingInfoByRdId(
    state,
    ownProps.match.params.rdId
  )

  let trade: ITradeEnriched
  if (discountingRequest) {
    const companyStaticId = getCurrentCompanyStaticId(state)
    trade = addBuyerSellerEnrichedData(
      companyStaticId,
      discountingRequest ? [discountingRequest.tradeSnapshot!.trade] : [],
      members
    )[0]
  }

  return {
    members,
    discountingRequest,
    trade,
    creditAppetite: getRDExtendedCreditLine(state, ownProps.match.params.rdId),
    receivablesDiscountingError: state.get('receivableDiscounting').get('error'),
    isSubmitting: loadingSelector(
      state.get('loader').get('requests'),
      [ReceivableDiscountingActionType.CREATE_QUOTE_REQUEST, ReceivableDiscountingActionType.SUBMIT_QUOTE_REQUEST],
      false
    )
  }
}

export default compose<any>(
  withRouter,
  withPermissions,
  withLicenseCheck,
  withLoaders({
    actions: [
      ReceivableDiscountingApplicationActionType.FETCH_APPLICATION_REQUEST,
      CreditLineActionType.FetchCreditLinesRequest,
      MemberActionType.FetchMembersRequest
    ]
  }),
  connect<any>(mapStateToProps, {
    fetchRDRequesForSubmitQuote,
    bankCreateQuote,
    fetchConnectedCounterpartiesAsync
  })
)(SubmitQuoteContainer)

const ColumnSection = styled.div`
  flex: 1;
  background-color: white;
  padding: ${SPACES.SMALL} ${SPACES.DEFAULT} ${SPACES.DEFAULT} ${SPACES.DEFAULT};
`

const ColumnSectionFixed = styled.div`
  flex: 0 0 ${Dimensions.SidePanelFixedWidth};
  background-color: white;
  border-left: 1px solid #e0e6ed;
  box-shadow: -2px 0 4px 0 rgba(192, 207, 222, 0.5);
`

const StyledTabPane = styled(Tab.Pane)`
  &&&& {
    padding-left: 0;
    padding-right: 0;
  }
`
