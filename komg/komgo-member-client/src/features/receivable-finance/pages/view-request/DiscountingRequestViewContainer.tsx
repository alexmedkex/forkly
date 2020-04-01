import { tradeFinanceManager } from '@komgo/permissions'
import { productRD } from '@komgo/products'
import {
  IParticipantRFPReply,
  IParticipantRFPSummary,
  IReceivablesDiscountingInfo,
  RDStatus,
  ReplyType
} from '@komgo/types'
import React from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router'
import { compose } from 'redux'
import { AccordionTitleProps, Button } from 'semantic-ui-react'
import styled from 'styled-components'
import { ErrorMessage, LoadingTransition } from '../../../../components'
import Unauthorized from '../../../../components/unauthorized'
import { withLicenseCheck, WithLicenseCheckProps } from '../../../../components/with-license-check'
import { WithLoaderProps, withLoaders } from '../../../../components/with-loaders'
import { withPermissions, WithPermissionsProps } from '../../../../components/with-permissions'
import { clearError } from '../../../../store/common/actions'
import { loadingSelector } from '../../../../store/common/selectors'
import {
  getCurrentCompanyStaticId,
  getMembersList,
  isCurrentCompanyFinancialInstitution
} from '../../../../store/common/selectors/state-selectors'
import { ServerError } from '../../../../store/common/types'
import { ApplicationState } from '../../../../store/reducers'
import { paleBlue } from '../../../../styles/colors'
import { stringOrNull } from '../../../../utils/types'
import { fetchConnectedCounterpartiesAsync } from '../../../counterparties/store/actions'
import { IMember, MemberActionType } from '../../../members/store/types'
import { ITradeEnriched } from '../../../trades/store/types'
import { addBuyerSellerEnrichedData, findCommonNameByStaticId } from '../../../trades/utils/displaySelectors'
import BankDeclineRFPModal from '../../../receivable-discounting-legacy/components/receivable-discounting-application/BankDeclineRFPModal'
import SubmittedQuoteSection from '../../../receivable-discounting-legacy/components/SubmittedQuoteSection'
import { bankDeclineRFP, fetchDiscountingRequestPageData } from '../../../receivable-discounting-legacy/store/actions'
import { updateReceivablesDiscountingApplication } from '../../../receivable-discounting-legacy/store/application/actions'
import { IRFPReply, ReceivableDiscountingActionType } from '../../../receivable-discounting-legacy/store/types'
import { ReceivableDiscountingApplicationActionType } from '../../../receivable-discounting-legacy/store/application/types'
import {
  ReceivableDiscountingModal,
  ReceivableDiscountingViewPanels,
  ReceivablesDiscountingRole
} from '../../../receivable-discounting-legacy/utils/constants'
import {
  getQuoteForReplyType,
  getReplyCommentForReplyType,
  roleRd
} from '../../../receivable-discounting-legacy/utils/selectors'
import DiscountingRequestDataContainer from './containers/DiscountingRequestDataContainer'
import DiscountingDocumentsContainer from './containers/DiscountingDocumentsContainer'
import { getReceivableDiscountingInfoByRdId } from '../../../receivable-discounting-legacy/utils/state-selectors'
import TradeViewDataContainer from './containers/TradeViewDataContainer'
import AcceptedQuoteDataContainer from './containers/AcceptedQuoteDataContainer'
import { displaySimpleRequestType } from '../../../receivable-discounting-legacy/utils/displaySelectors'
import { TemplateLayout } from '../../../templates/components/TemplateLayout'
import { RDTopbarFactory } from '../../../receivable-discounting-legacy/presentation/RDTopbarFactory'
import { SpacedFixedButtonBar } from '../../../receivable-discounting-legacy/components/generics'

export interface IDiscountingRequestViewContainerProps
  extends WithPermissionsProps,
    WithLicenseCheckProps,
    WithLoaderProps,
    RouteComponentProps<any> {
  rdId: string
  discountingRequest?: IReceivablesDiscountingInfo
  trade?: ITradeEnriched
  companyStaticId: string
  errors: ServerError[]
  rdError: stringOrNull
  bankSingleRFPSummary?: IParticipantRFPSummary
  traderRFPSummaries?: IParticipantRFPSummary[]
  isFinancialInstitution: boolean
  bankDeclineRFPLoader: boolean
  members: IMember[]
  role: ReceivablesDiscountingRole
  fetchConnectedCounterpartiesAsync: (params?: {}) => null
  fetchDiscountingRequestPageData(rdId: string, participantStaticId: string, isFinancialInstitution: boolean): void
  bankDeclineRFP(values: IRFPReply): void
}

interface IDiscountingRequestContainerState {
  isDeclineRequestModalVisible: boolean
  actives: Partial<{ [key in ReceivableDiscountingViewPanels]: boolean }>
}

const getInitialActives = () => ({
  [ReceivableDiscountingViewPanels.SubmittedQuote]: false,
  [ReceivableDiscountingViewPanels.AcceptedQuote]: false
})

export class DiscountingRequestViewContainer extends React.Component<
  IDiscountingRequestViewContainerProps,
  IDiscountingRequestContainerState
> {
  constructor(props) {
    super(props)
    this.state = {
      isDeclineRequestModalVisible: false,
      actives: getInitialActives()
    }
  }

  componentDidMount() {
    const { rdId, companyStaticId, isFinancialInstitution } = this.props
    this.props.fetchDiscountingRequestPageData(rdId, companyStaticId, isFinancialInstitution)
    this.props.fetchConnectedCounterpartiesAsync()
  }

  componentDidUpdate(prevProps) {
    const { discountingRequest, rdId, companyStaticId, isFinancialInstitution } = this.props
    if (prevProps.rdId !== rdId) {
      this.props.fetchDiscountingRequestPageData(rdId, companyStaticId, isFinancialInstitution)
    }
    if (discountingRequest !== prevProps.discountingRequest) {
      this.updateExpandedPanels()
    }
  }

  updateExpandedPanels() {
    this.setState({
      actives: {
        ...getInitialActives(),
        [ReceivableDiscountingViewPanels.SubmittedQuote]: this.shouldExpandSubmittedQuote()
      }
    })
  }

  shouldExpandSubmittedQuote(): boolean {
    const { discountingRequest } = this.props

    return (
      this.shouldShowElementForReplyType(ReplyType.Submitted) && discountingRequest.status === RDStatus.QuoteSubmitted
    )
  }

  shouldShowElementForReplyType(replyType: ReplyType): boolean {
    const { isFinancialInstitution, bankSingleRFPSummary, discountingRequest } = this.props

    if (!isFinancialInstitution) {
      return false
    }

    if (discountingRequest && discountingRequest.status === RDStatus.Requested) {
      return false
    }

    // check if at least one is of the type
    return bankSingleRFPSummary && bankSingleRFPSummary.replies.some(reply => reply.type === replyType)
  }

  getQuoteCommentForReplyType(bankSingleRFPSummary: IParticipantRFPSummary, replyType: ReplyType): string {
    return this.shouldShowElementForReplyType(replyType)
      ? getReplyCommentForReplyType(bankSingleRFPSummary, replyType)
      : null
  }

  authorized(): boolean {
    const { isLicenseEnabled, isAuthorized } = this.props

    return (
      isLicenseEnabled(productRD) &&
      (isAuthorized(tradeFinanceManager.canReadRD) || isAuthorized(tradeFinanceManager.canReadRDRequests))
    )
  }

  canDeclineAndSubmitQuote(): boolean {
    const { isFinancialInstitution, discountingRequest, isAuthorized } = this.props

    return (
      isFinancialInstitution &&
      isAuthorized(tradeFinanceManager.canCrudRDRequests) &&
      discountingRequest &&
      discountingRequest.status === RDStatus.Requested
    )
  }

  handleAccordionClick(titleProps: AccordionTitleProps): void {
    const { actives } = this.state
    const { index } = titleProps

    this.setState({
      actives: {
        ...actives,
        [index as string]: !actives[index as ReceivableDiscountingViewPanels]
      }
    })
  }

  toggleModalState(modal: string) {
    this.setState(prevState => ({
      ...prevState,
      isDeclineRequestModalVisible:
        ReceivableDiscountingModal.Decline === modal
          ? !prevState.isDeclineRequestModalVisible
          : prevState.isDeclineRequestModalVisible
    }))
  }

  SubmitQuoteOrRejectRequestButtons() {
    return this.canDeclineAndSubmitQuote() ? (
      <SpacedFixedButtonBar>
        <Button
          primary={true}
          floated="right"
          type="submit"
          data-test-id="button-provide-quote"
          onClick={() => this.props.history.push(`/receivable-discounting/${this.props.rdId}/provide-quote`)}
        >
          Submit quote
        </Button>
        <Button
          floated="right"
          type="submit"
          data-test-id="button-decline-quote"
          onClick={() => this.toggleModalState(ReceivableDiscountingModal.Decline)}
        >
          Decline request
        </Button>
      </SpacedFixedButtonBar>
    ) : null
  }

  quoteAndProviderIfAccepted(): {
    quoteAcceptedReply: IParticipantRFPReply
    provider: string
  } {
    const { traderRFPSummaries, members, bankSingleRFPSummary } = this.props
    if (bankSingleRFPSummary) {
      const quoteAcceptedReply = bankSingleRFPSummary.replies.find(reply => reply.type === ReplyType.Accepted)
      if (quoteAcceptedReply) {
        return { quoteAcceptedReply, provider: undefined }
      }
    }
    for (const summary of traderRFPSummaries || []) {
      const quoteAcceptedReply = summary && summary.replies.find(reply => reply.type === ReplyType.Accepted)
      if (quoteAcceptedReply) {
        const provider = quoteAcceptedReply && findCommonNameByStaticId(members, summary.participantStaticId)
        return { quoteAcceptedReply, provider }
      }
    }
    return { quoteAcceptedReply: undefined, provider: undefined }
  }

  render() {
    const {
      isFetching,
      errors,
      rdError,
      trade,
      discountingRequest,
      rdId,
      bankDeclineRFPLoader,
      bankDeclineRFP,
      bankSingleRFPSummary,
      role,
      members
    } = this.props
    const { isDeclineRequestModalVisible, actives } = this.state

    if (!this.authorized()) {
      return <Unauthorized />
    }

    if (isFetching || !trade) {
      return <LoadingTransition title="Loading Request for Discounting" />
    }

    if (errors.length > 0) {
      return <ErrorMessage title="Something went wrong" error={errors[0]} />
    }
    const declinedQuoteComment = this.getQuoteCommentForReplyType(bankSingleRFPSummary, ReplyType.Declined)
    const { quoteAcceptedReply, provider } = this.quoteAndProviderIfAccepted()

    return (
      <TemplateLayout
        title={`${displaySimpleRequestType(discountingRequest.rd.requestType)} request`}
        infos={RDTopbarFactory.createTopbarInfoItems(trade, discountingRequest, members, role)}
        withPadding={true}
      >
        {declinedQuoteComment && (
          <DeclinedQuoteCommentWrapper>
            <p className="comment-heading" data-test-id="comment-heading">
              Comment from{' '}
              <span className="company-name" data-test-id="company-name">
                {trade.sellerName}
              </span>
            </p>
            <p className="declined-quote-comment" data-test-id="declined-quote-comment">
              {declinedQuoteComment}
            </p>
          </DeclinedQuoteCommentWrapper>
        )}
        <TradeViewDataContainer discountingRequest={discountingRequest} role={role} />
        <DiscountingRequestDataContainer discountingRequest={discountingRequest} role={role} />
        {this.shouldShowElementForReplyType(ReplyType.Submitted) &&
          getQuoteForReplyType(bankSingleRFPSummary, ReplyType.Submitted) && (
            <SubmittedQuoteSection
              discountingRequest={discountingRequest}
              isSubmittedQuoteAccordionOpen={actives[ReceivableDiscountingViewPanels.SubmittedQuote]}
              handleClick={(e, titleProps) => this.handleAccordionClick(titleProps)}
              submittedQuote={getQuoteForReplyType(bankSingleRFPSummary, ReplyType.Submitted)}
              comment={getReplyCommentForReplyType(bankSingleRFPSummary, ReplyType.Submitted)}
              index={ReceivableDiscountingViewPanels.SubmittedQuote}
            />
          )}
        {quoteAcceptedReply && (
          <AcceptedQuoteDataContainer
            discountingRequest={discountingRequest}
            quoteId={quoteAcceptedReply.quote.staticId}
            comment={quoteAcceptedReply.comment}
            replyDate={quoteAcceptedReply.createdAt}
            provider={provider}
            role={role}
            isAuthorized={() => true}
          />
        )}
        <DiscountingDocumentsContainer
          role={this.props.isFinancialInstitution ? ReceivablesDiscountingRole.Bank : ReceivablesDiscountingRole.Trader}
          discountingRequest={discountingRequest}
          history={this.props.history}
        />
        <BankDeclineRFPModal
          bankDeclineRFP={bankDeclineRFP}
          rdId={rdId}
          tradeId={trade.sellerEtrmId}
          discountingRequest={discountingRequest}
          sellerName={trade.sellerName}
          buyerName={trade.buyerName}
          visible={isDeclineRequestModalVisible}
          toggleVisible={modal => this.toggleModalState(modal)}
          rdError={rdError}
          bankDeclineRFPLoader={bankDeclineRFPLoader}
        />
        {this.SubmitQuoteOrRejectRequestButtons()}
      </TemplateLayout>
    )
  }
}

const DeclinedQuoteCommentWrapper = styled.div`
  .comment-heading {
    font-weight: bold;
    margin-top: 1.25rem;
    margin-bottom: 0;
  }
  .declined-quote-comment {
    margin-bottom: 0.75rem;
  }
`

export const StyledPage = styled.section`
  padding-bottom: 30px;
`

export const FixedButtonBar = styled.div`
  &&& {
    position: fixed;
    left: 0px;
    bottom: 0px;
    height: 68px;
    justify-content: flex-end;
    padding-top: calc((68px - 32px) / 2);
    padding-bottom: calc((68px - 32px) / 2);
    width: 100%;
    padding-right: 38px;
    border-top: 1px solid ${paleBlue};
    background: white;
  }
`

export const mapStateToProps = (state: ApplicationState, ownProps: IDiscountingRequestViewContainerProps) => {
  const rdId = ownProps.match.params.rdId.split('?')[0]
  const members: IMember[] = getMembersList(state)

  const discountingRequest: IReceivablesDiscountingInfo = getReceivableDiscountingInfoByRdId(state, rdId)

  const [trade] = addBuyerSellerEnrichedData(
    getCurrentCompanyStaticId(state),
    discountingRequest ? [discountingRequest.tradeSnapshot!.trade] : [],
    members
  )

  const isFinancialInstitution = isCurrentCompanyFinancialInstitution(state)
  const role = roleRd(isFinancialInstitution)
  const companyStaticId = getCurrentCompanyStaticId(state)

  const error = state.get('trades').get('error')
  const rdError = state.get('receivableDiscounting').get('error')

  let traderRFPSummaries: IParticipantRFPSummary[] = []
  let bankSingleRFPSummary: IParticipantRFPSummary

  if (isFinancialInstitution) {
    const bankSingleRFPSummaries = state
      .getIn(['receivableDiscounting', 'rfpSummariesByRdIdByParticipantStaticId'])
      .toJS()[rdId]
    bankSingleRFPSummary = bankSingleRFPSummaries && bankSingleRFPSummaries[companyStaticId]
  } else {
    traderRFPSummaries = state.getIn(['receivableDiscounting', 'rfpSummariesByRdId']).toJS()[rdId]
  }

  const shouldFetchSummaries = discountingRequest && discountingRequest.status !== RDStatus.Requested
  const isFetchingBankSingleRFPSummary = loadingSelector(state.get('loader').get('requests'), [
    ReceivableDiscountingActionType.FETCH_PARTICIPANT_RFP_SUMMARY_REQUEST
  ])

  const isFetchingTraderRFPSummaries = loadingSelector(state.get('loader').get('requests'), [
    ReceivableDiscountingActionType.FETCH_RFP_SUMMARY_REQUEST
  ])

  /**
   * Explanation of: (isFetchingTraderRFPSummaries &&
   * isFetchingBankSingleRFPSummary), see loadingSelector last arg ->
   * noMatchMeansFetching defaults to true We only care if one of these
   * selectors finishes fetching So if either is false, one has finished
   * fetching If both are true, then the one we care about is still fetching
   */
  return {
    rdId,
    role,
    isFinancialInstitution,
    discountingRequest,
    trade,
    companyStaticId,
    error,
    rdError,
    bankSingleRFPSummary,
    traderRFPSummaries,
    isFetching:
      ownProps.isFetching || (shouldFetchSummaries && isFetchingTraderRFPSummaries && isFetchingBankSingleRFPSummary), // see explanation comment above
    members,
    bankDeclineRFPLoader: loadingSelector(
      state.get('loader').get('requests'),
      [ReceivableDiscountingActionType.REJECT_RFP_REQUEST],
      false
    )
  }
}

export default compose<any>(
  withLoaders({
    actions: [
      ReceivableDiscountingApplicationActionType.FETCH_APPLICATION_REQUEST,
      MemberActionType.FetchMembersRequest
    ]
  }),
  withPermissions,
  withLicenseCheck,
  withRouter,
  connect(mapStateToProps, {
    fetchDiscountingRequestPageData,
    updateReceivablesDiscountingApplication,
    bankDeclineRFP,
    fetchConnectedCounterpartiesAsync,
    clearError
  })
)(DiscountingRequestViewContainer)
