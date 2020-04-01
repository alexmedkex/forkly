import * as React from 'react'
import { compose } from 'redux'
import RequestCounterpartyModal from '../components/request-counterparty-modal/RequestCounterpartyModal'
import { TaskStatus, TaskWithUser } from '../../tasks/store/types'
import { ApplicationState } from '../../../store/reducers'
import {
  getCounterpartyRequestAsync as getCounterpartyRequestAsyncAction,
  responseOnCounterpartyRequestAsync as responseOnCounterpartyRequestAsyncAction
} from '../store/actions'
import { CounterpartyRequest, CounterpartiesActionType } from '../store/types'
import { connect } from 'react-redux'
import { LoadingTransition } from '../../../components'
import { coverage } from '@komgo/permissions'
import { PermissionFullId } from '../../role-management/store/types'
import { withPermissions } from '../../../components/with-permissions'
import { loadingSelector } from '../../../store/common/selectors'
export interface Props {
  task: TaskWithUser
  requestResponseActionStatus: boolean
  counterpartyRequestFetching: boolean
  counterpartyRequest: CounterpartyRequest | null
  isAuthorized: (requiredPerm: PermissionFullId) => boolean
  actionCallback(status: boolean): void
  responseOnCounterpartyRequestAsync(companyId: string, accept: boolean): void
  getCounterpartyRequestAsync(requestId: string): void
}

interface State {
  companyId: string
  requestId: string
}

export class RequestCounterpartyContainer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    const task = this.props.task.task
    this.state = {
      companyId: '',
      requestId: task.context.id
    }
  }

  componentDidMount() {
    this.props.getCounterpartyRequestAsync(this.state.requestId)
  }

  componentDidUpdate(prevProps: Props) {
    if (
      this.props.requestResponseActionStatus !== prevProps.requestResponseActionStatus &&
      this.props.requestResponseActionStatus === true
    ) {
      this.props.actionCallback(true)
    }
  }

  render() {
    const { requestId } = this.state
    const {
      counterpartyRequestFetching,
      responseOnCounterpartyRequestAsync,
      actionCallback,
      task,
      isAuthorized
    } = this.props
    return (
      <>
        {counterpartyRequestFetching && <LoadingTransition title="Loading request data" marginTop="45px" />}
        {!counterpartyRequestFetching && (
          <RequestCounterpartyModal
            companyId={this.props.counterpartyRequest ? this.props.counterpartyRequest.staticId : ''}
            companyName={this.props.counterpartyRequest ? this.props.counterpartyRequest.x500Name.O : ''}
            readonly={task.task.status === TaskStatus.Done || !isAuthorized(coverage.canCrudCoverage)}
            handleResponseOnRequest={responseOnCounterpartyRequestAsync}
            actionCallback={actionCallback}
          />
        )}
      </>
    )
  }
}

const mapStateToProps = (state: ApplicationState): any => {
  const counterpartiesState = state.get('counterparties')

  return {
    counterpartyRequestFetching: loadingSelector(state.get('loader').get('requests'), [
      CounterpartiesActionType.FETCH_COUNTERPARTY_REQ_REQUEST
    ]),
    counterpartyRequest: counterpartiesState.get('counterpartyRequest'),
    requestResponseActionStatus: counterpartiesState.get('requestResponseActionStatus')
  }
}

const mapDispatchToProps = {
  getCounterpartyRequestAsync: getCounterpartyRequestAsyncAction,
  responseOnCounterpartyRequestAsync: responseOnCounterpartyRequestAsyncAction
}

export default compose<any>(withPermissions, connect(mapStateToProps, mapDispatchToProps))(RequestCounterpartyContainer)
