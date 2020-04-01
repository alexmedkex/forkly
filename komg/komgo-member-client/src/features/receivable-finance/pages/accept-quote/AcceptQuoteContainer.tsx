import { tradeFinanceManager } from '@komgo/permissions'
import { productRD } from '@komgo/products'
import { IParticipantRFPSummary, IQuote, IReceivablesDiscountingInfo, ParticipantRFPStatus } from '@komgo/types'
import * as React from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router'
import { compose } from 'redux'
import {
  ErrorMessage,
  LoadingTransition,
  withLicenseCheck,
  WithLicenseCheckProps,
  withPermissions,
  WithPermissionsProps
} from '../../../../components'
import Unauthorized from '../../../../components/unauthorized'
import { WithLoaderProps, withLoaders } from '../../../../components/with-loaders'
import { loadingSelector } from '../../../../store/common/selectors'
import { ServerError } from '../../../../store/common/types'
import { ApplicationState } from '../../../../store/reducers'
import { stringOrNull } from '../../../../utils/types'
import { ITradeEnriched } from '../../../trades/store/types'
import { addBuyerSellerEnrichedData, findCommonNameByStaticId } from '../../../trades/utils/displaySelectors'
import TraderAcceptQuoteForm from '../../../receivable-discounting-legacy/components/receivable-discounting-application/TraderAcceptQuoteForm'
import { getLatestReply } from '../../../receivable-discounting-legacy/selectors/quotesTableSelectors'
import {
  fetchDiscountingRequestForAcceptQuote,
  traderCreateQuote
} from '../../../receivable-discounting-legacy/store/actions'
import {
  ISubmitQuoteFormDetails,
  ReceivableDiscountingActionType
} from '../../../receivable-discounting-legacy/store/types'
import { ReceivableDiscountingApplicationActionType } from '../../../receivable-discounting-legacy/store/application/types'
import { TemplateLayout } from '../../../templates/components/TemplateLayout'
import { RDTopbarFactory } from '../../../receivable-discounting-legacy/presentation/RDTopbarFactory'
import { ReceivablesDiscountingRole } from '../../../receivable-discounting-legacy/utils/constants'
import { ColumnWrapper } from '../../../../components/styled-components'
import { SPACES } from '@komgo/ui-components'
import styled from 'styled-components'
import { Dimensions } from '../../../receivable-discounting-legacy/resources/dimensions'
import { Tab, Button } from 'semantic-ui-react'
import { SpacedFixedButtonBar } from '../../../receivable-discounting-legacy/components/generics'
import { getCurrentCompanyStaticId } from '../../../../store/common/selectors/state-selectors'

export interface IAcceptQuoteContainerProps
  extends WithPermissionsProps,
    WithLicenseCheckProps,
    WithLoaderProps,
    RouteComponentProps<any> {
  rdId: stringOrNull
  errors: ServerError[]
  rdError: stringOrNull
  quoteStaticId: stringOrNull
  participantStaticId: stringOrNull
  quote: IQuote
  bankName: string
  discountingRequest: IReceivablesDiscountingInfo
  trade?: ITradeEnriched
  history: any
  status: string
  traderSubmitQuoteLoader: boolean
  fetchDiscountingRequestForAcceptQuote: (rdId: string, participantStaticId: string) => void
  fetchDiscountingRequest: (rdId: string) => void
  traderCreateQuote(values: ISubmitQuoteFormDetails, rdId: string): void
}

export class AcceptQuoteContainer extends React.Component<IAcceptQuoteContainerProps> {
  componentDidMount() {
    this.props.fetchDiscountingRequestForAcceptQuote(this.props.rdId, this.props.participantStaticId)
  }

  render() {
    const {
      isLicenseEnabled,
      isAuthorized,
      isFetching,
      rdId,
      rdError,
      traderSubmitQuoteLoader,
      trade,
      quote,
      bankName,
      traderCreateQuote,
      participantStaticId,
      status,
      discountingRequest
    } = this.props

    const authorized =
      isLicenseEnabled(productRD) &&
      (isAuthorized(tradeFinanceManager.canReadRD) || isAuthorized(tradeFinanceManager.canReadRDRequests))

    if (!authorized) {
      return <Unauthorized />
    }

    if (isFetching) {
      return <LoadingTransition title="Loading Request for Discounting" />
    }

    if (!isFetching && status === ParticipantRFPStatus.QuoteAccepted) {
      return (
        <ErrorMessage
          title="Invalid Quote"
          error={`This quote has already been accepted. Please go back to your dashboard and select another.`}
        />
      )
    }

    const title = 'Review quote and submit agreed terms'

    return (
      discountingRequest && (
        <TemplateLayout
          title={title}
          infos={RDTopbarFactory.createTopbarInfoItems(
            trade,
            discountingRequest,
            undefined,
            ReceivablesDiscountingRole.Trader
          )}
          withPadding={false}
        >
          <ColumnWrapper>
            <ColumnSection>
              <TraderAcceptQuoteForm
                rdId={rdId}
                participantStaticId={participantStaticId}
                tradeId={trade.sellerEtrmId}
                quote={quote}
                bankName={bankName}
                rdError={rdError}
                traderSubmitQuoteLoader={traderSubmitQuoteLoader}
                traderCreateQuote={traderCreateQuote}
                rd={discountingRequest.rd}
              />
            </ColumnSection>
          </ColumnWrapper>

          <SpacedFixedButtonBar>
            <Button
              role="button"
              onClick={() => this.props.history.push(`/receivable-discounting/${this.props.match.params.rdId}/quotes`)}
              data-test-id="trader-accept-quote-cancel-btn"
            >
              Cancel
            </Button>
            <Button
              primary={true}
              content="Accept quote and submit final agreed terms"
              form="trader-accept-quote-form"
              type="submit"
              data-test-id="trader-accept-quote-submit-btn"
            />
          </SpacedFixedButtonBar>
        </TemplateLayout>
      )
    )
  }
}

export const mapStateToProps = (state: ApplicationState, ownProps: IAcceptQuoteContainerProps) => {
  const rdId = ownProps.match.params.rdId
  const participantStaticId = ownProps.match.params.participantStaticId
  const discountingRequest =
    state
      .get('receivableDiscountingApplication')
      .get('byId')
      .toJS()[rdId] || undefined

  const members = state
    .get('members')
    .get('byId')
    .toList()
    .toJS()

  const [trade] = addBuyerSellerEnrichedData(
    getCurrentCompanyStaticId(state),
    discountingRequest ? [discountingRequest.tradeSnapshot!.trade] : [],
    members
  )

  const bankName = findCommonNameByStaticId(members, participantStaticId)

  const error = state.get('trades').get('error')
  const rdError = state.get('receivableDiscounting').get('error')

  let rfpSummary: IParticipantRFPSummary
  if (state.getIn(['receivableDiscounting', 'rfpSummariesByRdIdByParticipantStaticId', rdId])) {
    rfpSummary = state.getIn(['receivableDiscounting', 'rfpSummariesByRdIdByParticipantStaticId', rdId]).toJS()[
      participantStaticId
    ]
  }

  let quote: IQuote
  let status: ParticipantRFPStatus
  if (rfpSummary && rfpSummary.replies) {
    const latestReply = getLatestReply(rfpSummary)
    quote = latestReply.quote
    status = rfpSummary.status
  }

  return {
    rdId,
    participantStaticId,
    discountingRequest,
    status,
    quote,
    trade,
    error,
    rdError,
    bankName,
    traderSubmitQuoteLoader: loadingSelector(
      state.get('loader').get('requests'),
      [ReceivableDiscountingActionType.ACCEPT_QUOTE_REQUEST],
      false
    )
  }
}

export default compose<any>(
  withLoaders({
    actions: [
      ReceivableDiscountingApplicationActionType.FETCH_APPLICATION_REQUEST,
      ReceivableDiscountingActionType.FETCH_PARTICIPANT_RFP_SUMMARY_REQUEST
    ]
  }),
  withPermissions,
  withLicenseCheck,
  withRouter,
  connect(mapStateToProps, { fetchDiscountingRequestForAcceptQuote, traderCreateQuote })
)(AcceptQuoteContainer)

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
