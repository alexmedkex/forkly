import * as React from 'react'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { Grid } from 'semantic-ui-react'
import styled from 'styled-components'

import FullSizePage from '../../../components/full-size-page/FullSizePage'
import { fetchRequestbyIdAsync } from '../store/requests/actions'
import { ProductId, RequestActionType, Request } from '../store'
import { Products } from '../constants/Products'
import {
  withPermissions,
  LoadingTransition,
  ErrorMessage,
  WithPermissionsProps,
  Unauthorized
} from '../../../components'
import { withRouter, RouteComponentProps } from 'react-router'
import { ApplicationState } from '../../../store/reducers'
import { withLoaders, WithLoaderProps } from '../../../components/with-loaders'
import { withDocuments } from '../hoc'
import { kyc } from '@komgo/permissions'
import RequestOverview, { RequestSide } from '../components/request-documents/RequestOverview'
import { withCounterparties } from '../../counterparties/hoc'
import { Counterparty, CounterpartiesActionType } from '../../counterparties/store/types'
import RequestDocumentsHeader from '../components/documents/RequestDocumentsHeader'
import { getCompanyName } from '../../counterparties/utils/selectors'
import HeaderWrapper from '../components/request-documents/HeaderWrapper'

interface IRequestDocumentReviewContainerActions {
  fetchRequestbyIdAsync(requestId: string, productId: ProductId)
}

interface IRequestDocumentReviewContainerProps {
  request: Request
  id: string
}

interface IProps
  extends IRequestDocumentReviewContainerActions,
    IRequestDocumentReviewContainerProps,
    WithLoaderProps,
    RouteComponentProps<{ id: string }>,
    WithPermissionsProps {
  counterparty: Counterparty
  fetchDocumentsAsync(productId: ProductId, optionParams?: string): void
  fetchConnectedCounterpartiesAsync(): void
}

export class RequestDocumentReviewContainer extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props)

    this.handleClosePage = this.handleClosePage.bind(this)
  }

  componentDidMount() {
    this.props.fetchRequestbyIdAsync(this.props.id, Products.KYC)
    this.props.fetchDocumentsAsync(Products.KYC)
    this.props.fetchConnectedCounterpartiesAsync()
  }

  isAuthorized() {
    const { isAuthorized } = this.props
    return (
      isAuthorized(kyc.canReadRequestedDocs) ||
      isAuthorized(kyc.canReadAndRequestDocs) ||
      isAuthorized(kyc.canReviewDocs) ||
      isAuthorized(kyc.canManageDocReqTemplate)
    )
  }

  handleClosePage() {
    const { history } = this.props
    if (history.length) {
      history.goBack()
    } else {
      history.push('/')
    }
  }

  render() {
    const { isFetching, errors, request, counterparty } = this.props
    const [error] = errors

    if (!this.isAuthorized()) {
      return <Unauthorized />
    }

    if (isFetching) {
      return <LoadingTransition title="Loading request" />
    }

    if (error) {
      return <ErrorMessage title="Loading request" error={error} />
    }

    return (
      <FullSizePage>
        <HeaderWrapper>
          <RequestDocumentsHeader
            counterpartyName={getCompanyName(counterparty)}
            title="Request documents"
            subtitlePrefix="From"
            onToggleCloseModal={this.handleClosePage}
          />
        </HeaderWrapper>
        <Grid>
          <Grid.Column computer={9} tablet={16} mobile={16}>
            <RequestOverview request={request} counterparty={counterparty} requestSide={RequestSide.Sender} />
          </Grid.Column>
          <Grid.Column computer={16} tablet={16} mobile={16}>
            {/* Tab here */}
          </Grid.Column>
        </Grid>
      </FullSizePage>
    )
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: IProps) => {
  const { id } = ownProps.match.params
  const request = state
    .get('requests')
    .get('outgoingRequests')
    .find(request => request.id === id)
  const counterparties = state.get('counterparties').get('counterparties')
  return {
    counterparty: request
      ? counterparties.find(counterparty => counterparty.staticId === request.companyId)
      : undefined,
    id,
    request
  }
}

export default compose<any>(
  withPermissions,
  withRouter,
  withDocuments,
  withCounterparties,
  withLoaders({
    actions: [
      RequestActionType.FETCH_REQUEST_BY_ID_REQUEST,
      CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_REQUEST
    ]
  }),
  connect<IRequestDocumentReviewContainerProps, IRequestDocumentReviewContainerActions>(mapStateToProps, {
    fetchRequestbyIdAsync
  })
)(RequestDocumentReviewContainer)
