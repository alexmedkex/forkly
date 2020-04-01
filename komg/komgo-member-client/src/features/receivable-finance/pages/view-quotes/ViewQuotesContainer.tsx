import { tradeFinanceManager } from '@komgo/permissions'
import { IParticipantRFPSummary, IReceivablesDiscountingInfo, ParticipantRFPStatus } from '@komgo/types'
import * as React from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router'
import { compose } from 'redux'
import {
  ErrorMessage,
  LoadingTransition,
  Unauthorized,
  withPermissions,
  WithPermissionsProps,
  Text
} from '../../../../components'
import { WithLoaderProps, withLoaders } from '../../../../components/with-loaders'
import { ApplicationState } from '../../../../store/reducers'
import { enumToDropdownOptions } from '../../../letter-of-credit-legacy/components'
import { IMember } from '../../../members/store/types'
import { ITradeEnriched } from '../../../trades/store/types'
import { addBuyerSellerEnrichedData } from '../../../trades/utils/displaySelectors'
import FilterRequestsDropdown, {
  IFilterReceivablesDiscountingRequestOption
} from '../../../receivable-discounting-legacy/components/quotes/FilterRequestsDropdown'
import RFPSummaryList from '../../../receivable-discounting-legacy/components/quotes/RFPSummaryList'
import {
  ALL_STATUSES,
  getLatestReply,
  mapAndFilterToDropdown,
  transformToRFPRequestSummaryProps
} from '../../../receivable-discounting-legacy/selectors/quotesTableSelectors'
import { fetchDiscountRequestRFPSummaries } from '../../../receivable-discounting-legacy/store/actions'
import { ReceivableDiscountingActionType } from '../../../receivable-discounting-legacy/store/types'
import { ReceivableDiscountingApplicationActionType } from '../../../receivable-discounting-legacy/store/application/types'
import { RDTopbarFactory } from '../../../receivable-discounting-legacy/presentation/RDTopbarFactory'
import { ReceivablesDiscountingRole } from '../../../receivable-discounting-legacy/utils/constants'
import { TemplateLayout } from '../../../templates/components/TemplateLayout'
import { OverlaySidePanel } from '@komgo/ui-components'
import { DiscountingRequestInfoPane } from '../../entities/rd/components'
import { getCurrentCompanyStaticId } from '../../../../store/common/selectors/state-selectors'

export interface IViewQuotesContainerProps extends WithPermissionsProps, WithLoaderProps, RouteComponentProps<any> {
  rdId: string
  rdInfo: IReceivablesDiscountingInfo
  rfpSummaries: IParticipantRFPSummary[]
  members: IMember[]
  trade: ITradeEnriched

  fetchDiscountRequestRFPSummaries: (rdId: string) => void
}

interface IStatusCount {
  [status: string]: number
}

interface IViewQuotesContainerState {
  selectedStatus: ParticipantRFPStatus | string
  numberOfRDRequestsWithStatus: IStatusCount
  modalParticipantStaticId: string
  sidebarVisible: boolean
}

const createInitialRDRequestStatusCounts = () =>
  Object.values(ParticipantRFPStatus).reduce(
    (memo: any, status: ParticipantRFPStatus) => ({
      ...memo,
      [status as string]: 0
    }),
    {}
  )

export class ViewQuotesContainer extends React.Component<IViewQuotesContainerProps, IViewQuotesContainerState> {
  constructor(props: IViewQuotesContainerProps) {
    super(props)

    this.state = {
      selectedStatus: ALL_STATUSES,
      numberOfRDRequestsWithStatus: createInitialRDRequestStatusCounts(),
      modalParticipantStaticId: '',
      sidebarVisible: false
    }
  }

  componentDidMount() {
    this.props.fetchDiscountRequestRFPSummaries(this.props.rdId)
  }

  componentWillReceiveProps(nextProps: IViewQuotesContainerProps) {
    if (!nextProps.rfpSummaries) {
      return
    }

    const rfpSummaries = nextProps.rfpSummaries
    const numberOfRDRequestsWithStatus = {
      ...createInitialRDRequestStatusCounts(),
      [ALL_STATUSES]: rfpSummaries.length
    }

    for (const summary of rfpSummaries) {
      numberOfRDRequestsWithStatus[summary.status] += 1
    }
    this.setState({ numberOfRDRequestsWithStatus })
  }

  selectStatus(selectedStatus: ParticipantRFPStatus | string) {
    this.setState({ selectedStatus })
  }

  sortAndFilterBySelectedStatus(summaries: IParticipantRFPSummary[]) {
    const shouldFilter = this.state.selectedStatus !== ALL_STATUSES
    const filteredSummaries = shouldFilter
      ? summaries.filter(request => request.status === this.state.selectedStatus)
      : summaries

    const byLatestReplyCreatedAt = (summaryA, summaryB) => {
      if (summaryA.replies.length === 0) {
        return 1
      }
      if (summaryB.replies.length === 0) {
        return -1
      }
      const latestReplyA = getLatestReply(summaryB).createdAt
      const latestReplyB = getLatestReply(summaryA).createdAt

      return new Date(latestReplyA) > new Date(latestReplyB) ? 1 : -1
    }

    return filteredSummaries.sort(byLatestReplyCreatedAt)
  }

  dropdownOptions() {
    const options = mapAndFilterToDropdown(enumToDropdownOptions(ParticipantRFPStatus))
    const counts = this.state.numberOfRDRequestsWithStatus

    return options.map((opt: IFilterReceivablesDiscountingRequestOption) => ({
      ...opt,
      content: `${opt.content} (${counts[opt.value] || 0})`,
      text: `${opt.text} (${counts[opt.value] || 0})`
    }))
  }

  selectBankViewQuote(participantStaticId: string, rdId: string) {
    this.props.history.push(`/receivable-discounting/${rdId}/accept/${participantStaticId}`)
  }

  setSidebarVisible(isOpen: boolean) {
    this.setState({ sidebarVisible: isOpen })
  }

  render() {
    const { isAuthorized, errors, isFetching, rdInfo, rfpSummaries, trade, members } = this.props
    const [error] = errors

    if (!isAuthorized(tradeFinanceManager.canReadRD)) {
      return <Unauthorized />
    }

    if (error) {
      return <ErrorMessage title="Receivable discounting view quotes error" error={error} />
    }

    if (isFetching || !rdInfo) {
      return <LoadingTransition title="Loading quotes" />
    } else {
      return (
        <TemplateLayout
          title="View quotes"
          infos={RDTopbarFactory.createTopbarInfoItems(trade, rdInfo, members, ReceivablesDiscountingRole.Trader)}
          withPadding={true}
          sidePanelButtonProps={{ title: 'View request', onClick: () => this.setSidebarVisible(true) }}
        >
          <OverlaySidePanel
            title="Request details"
            onClose={() => this.setSidebarVisible(false)}
            open={this.state.sidebarVisible}
          >
            <DiscountingRequestInfoPane discountingRequest={rdInfo} />
          </OverlaySidePanel>
          <FilterRequestsDropdown
            onChange={(data: IFilterReceivablesDiscountingRequestOption) => this.selectStatus(data.value)}
            options={this.dropdownOptions()}
          />
          <RFPSummaryList
            summaries={transformToRFPRequestSummaryProps(
              this.sortAndFilterBySelectedStatus(rfpSummaries),
              members,
              rdInfo.rd,
              (id: string, rdId: string) => this.selectBankViewQuote(id, rdId)
            )}
          />
        </TemplateLayout>
      )
    }
  }
}

export const mapStateToProps = (state: ApplicationState, ownProps: IViewQuotesContainerProps) => {
  const rdId = ownProps.match.params.rdId
  const members = state
    .get('members')
    .get('byId')
    .toList()
    .toJS()

  const rds = state
    .get('receivableDiscountingApplication')
    .get('byId')
    .toJS()

  const rfpSummariesByRdId = state
    .get('receivableDiscounting')
    .get('rfpSummariesByRdId')
    .toJS()

  const rdInfo = rds[rdId]
  const trade =
    rdInfo && addBuyerSellerEnrichedData(getCurrentCompanyStaticId(state), [rdInfo.tradeSnapshot.trade], members)[0]
  const rfpSummaries = rfpSummariesByRdId[rdId] || []

  return {
    members,
    rdInfo,
    rfpSummaries,
    trade,
    rdId
  }
}

export default compose<any>(
  withLoaders({
    actions: [
      ReceivableDiscountingApplicationActionType.FETCH_APPLICATION_REQUEST,
      ReceivableDiscountingActionType.FETCH_RFP_SUMMARY_REQUEST
    ]
  }),
  withPermissions,
  withRouter,
  connect(mapStateToProps, {
    fetchDiscountRequestRFPSummaries
  })
)(ViewQuotesContainer)
