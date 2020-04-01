import { connect } from 'react-redux'
import { RequestActions } from '../store'
import { ApplicationState } from '../../../store/reducers'

const mapStateToProps = (state: ApplicationState) => {
  const requestsState = state.get('requests')
  return {
    requests: requestsState.get('requests'),
    requestById: requestsState.get('requestById'),
    outgoingRequests: requestsState.get('outgoingRequests'),
    sentDocumentRequestTypes: requestsState.get('sentDocumentRequestTypes'),
    error: requestsState.get('error')
  }
}

const withRequests = (Wrapped: React.ComponentType) =>
  connect(mapStateToProps, {
    createRequestAsync: RequestActions.createRequestAsync,
    fetchRequestsAsync: RequestActions.fetchRequestsAsync,
    fetchRequestbyIdAsync: RequestActions.fetchRequestbyIdAsync,
    fetchIncomingRequestAsync: RequestActions.fetchIncomingRequestAsync,
    fetchIncomingRequestbyIdAsync: RequestActions.fetchIncomingRequestbyIdAsync
  })(Wrapped)

export default withRequests
