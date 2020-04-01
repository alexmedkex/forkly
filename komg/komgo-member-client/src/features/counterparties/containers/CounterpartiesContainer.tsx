import * as React from 'react'
import { compose } from 'redux'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { SearchProps, Dropdown, Modal } from 'semantic-ui-react'
import PageHeader from '../components/page-header/PageHeader'
import { LoadingTransition, ErrorMessage } from '../../../components'
import ConnectedCounterparties from '../components/connected-counterparties/ConnectedCounterparties'
import AddCounterpartyModal from '../components/add-counterparty-modal/AddCounterpartyModal'
import {
  Counterparty,
  NotConnectedCounterparty,
  SearchCounterpartyPayload,
  Sort,
  CouneterpartyStatus,
  CounterpartyProfile
} from '../store/types'
import { findTaskByCounterpartyStaticId } from '../utils/selectors'
import withCounterparties from '../hoc/withCounterparties'
import { withPermissions } from '../../../components/with-permissions'
import { coverage } from '@komgo/permissions'
import { PermissionFullId } from '../../role-management/store/types'
import { stringOrNull } from '../../../utils/types'
import { RouteComponentProps } from 'react-router-dom'
import { getTasks } from '../../tasks/store/actions'
import { TaskWithUser } from '../../tasks/store/types'
import { ApplicationState } from '../../../store/reducers'
import RequestCounterpartyModal from '../components/request-counterparty-modal/RequestCounterpartyModal'
import {
  responseOnCounterpartyRequestAsync as responseOnCounterpartyRequestAsyncAction,
  resendCounterpartyAsync as resendCounterpartyAsyncAction
} from '../store/actions'
import ResendCounterpartyModal from '../components/resend-counterparty-modal/ResendCounterpartyModal'
import { TypeCounterTable } from '../components/connected-counterparties/ConnectedCounterpartiesHeader'

interface Props extends RouteComponentProps<{}> {
  isAddModalOpen: boolean
  counterparties: Counterparty[]
  counterpartiesFiltered: Counterparty[]
  notConnectedCounterpartiesFiltred: NotConnectedCounterparty[]
  addCounterparties: string[]
  counterpartiesSort: Sort
  counterpartiesSearch: string
  requestResponseActionStatus: boolean
  fetchingConnectedCounterparties: boolean
  fetchingConnectedCounterpartiesError: stringOrNull
  fetchingNotConnectedCounterparties: boolean
  fetchingNotConnectedCounterpartiesError: stringOrNull
  tasks: TaskWithUser[]
  notConnectedCounterpartySearch: string
  counterpartyProfiles: Map<string, CounterpartyProfile>
  getTasks: (params?: {}) => null
  isAuthorized(requiredPerm: PermissionFullId): boolean
  setAddCounterpartyModal(isAddModalOpen: boolean): void
  getConnectedCounterpartiesWithRequestsAsync(): void
  fetchNotConnectedCompaniesAsync(): void
  searchCounterparty(search: SearchCounterpartyPayload): void
  sortConnectedCounterparties(sort: Sort): void
  addCounterpartyAsync(id: string[]): void
  setAddCounterparties(ids: string[]): void
  actionCallback(status: boolean): void
  resendCounterpartyAsync(companyId: string): void
  responseOnCounterpartyRequestAsync(companyId: string, accept: boolean): void
}

enum DropdownMenuActionType {
  NONE,
  ACCEPT_DENY,
  RESEND
}

interface State {
  counterparty?: Counterparty
  actionType: DropdownMenuActionType
}

export class CounterpartiesContainer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      actionType: DropdownMenuActionType.NONE
    }
  }

  componentDidMount() {
    // clearing counterparty search box + search results
    this.props.searchCounterparty({ search: '', typeCounterparty: 'counterpartiesSearch' })
    this.props.getConnectedCounterpartiesWithRequestsAsync()
    this.props.getTasks()
  }

  componentDidUpdate(prevProps: Props) {
    if (
      this.props.requestResponseActionStatus !== prevProps.requestResponseActionStatus &&
      this.props.requestResponseActionStatus === true
    ) {
      this.actionCallback(true)
    }
  }

  handleChangeStateAddModal = (addModalOpen: boolean) => {
    if (addModalOpen) {
      this.props.fetchNotConnectedCompaniesAsync()
    } else {
      this.props.setAddCounterparties([])
      this.props.searchCounterparty({ search: '', typeCounterparty: 'notConnectedCounterpartySearch' })
    }
    this.props.setAddCounterpartyModal(addModalOpen)
  }

  handleOnSearchConnectedCounterparties = (event: React.MouseEvent<HTMLElement>, data: SearchProps) => {
    const search = data.value === undefined ? '' : data.value
    this.props.searchCounterparty({ search, typeCounterparty: 'counterpartiesSearch' })
  }

  handleOnSearchNotConnectedCounterparties = (event: React.MouseEvent<HTMLElement>, data: SearchProps) => {
    const search = data.value === undefined ? '' : data.value
    this.props.searchCounterparty({ search, typeCounterparty: 'notConnectedCounterpartySearch' })
  }

  handleConnectedCounterpartiesSort = (column: string, order: 'ascending' | 'descending') => {
    this.props.sortConnectedCounterparties({ column, order })
  }

  handleAddNewCounterparties = (checkedCounterparties: string[]) => {
    this.props.addCounterpartyAsync(checkedCounterparties)
  }

  dropdownMenuRuleBuilder(counterparty: Counterparty, task?: TaskWithUser) {
    return [
      {
        action: DropdownMenuActionType.ACCEPT_DENY,
        condition: task && counterparty && counterparty.status === CouneterpartyStatus.WAITING,
        text: 'Accept / Deny',
        state: {
          counterparty,
          actionType: DropdownMenuActionType.ACCEPT_DENY
        }
      },
      {
        action: DropdownMenuActionType.RESEND,
        condition: counterparty && counterparty.status === CouneterpartyStatus.PENDING,
        text: 'Resend',
        state: {
          counterparty,
          actionType: DropdownMenuActionType.RESEND
        }
      }
    ]
  }

  dropdownMenuBuilder = (id: string, counterparty: Counterparty): any[] => {
    const items: any[] = []
    const task = findTaskByCounterpartyStaticId(this.props.tasks, id)
    const dropdownMenuActionTypes = this.dropdownMenuRuleBuilder(counterparty, task)
    dropdownMenuActionTypes.forEach(item => {
      if (item.condition) {
        items.push(item)
      }
    })
    return items
  }

  onDropdownMenuItemClick = (state: any) => {
    this.setState(state)
  }

  renderMenu = (id: string, counterparty?: Counterparty) => {
    if (!counterparty) {
      return undefined
    }
    const dropdownMenuItems = this.dropdownMenuBuilder(id, counterparty)
    return dropdownMenuItems.length ? (
      <Dropdown inline={true} icon={'ellipsis horizontal'} direction={'left'}>
        <Dropdown.Menu>
          {dropdownMenuItems.map(item => (
            <Dropdown.Item key={item.text} onClick={() => this.onDropdownMenuItemClick(item.state)}>
              {item.text}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    ) : (
      undefined
    )
  }

  renderModals = (): React.ReactNode => {
    const { counterparty, actionType } = this.state
    return (
      <React.Fragment>
        <AddCounterpartyModal
          handleModalOpen={this.handleChangeStateAddModal}
          fetching={this.props.fetchingNotConnectedCounterparties}
          open={this.props.isAddModalOpen}
          addCounterparties={this.props.addCounterparties}
          handleSearch={this.handleOnSearchNotConnectedCounterparties}
          counterparties={this.props.notConnectedCounterpartiesFiltred}
          handleAddNewCounterparties={this.handleAddNewCounterparties}
          setAddCounterparties={this.props.setAddCounterparties}
          error={this.props.fetchingNotConnectedCounterpartiesError}
          value={this.props.notConnectedCounterpartySearch}
        />
        <Modal open={actionType === DropdownMenuActionType.ACCEPT_DENY} size="small">
          <RequestCounterpartyModal
            companyId={counterparty ? counterparty.staticId : ''}
            companyName={counterparty ? counterparty.x500Name.O : ''}
            readonly={!this.props.isAuthorized(coverage.canCrudCoverage)}
            handleResponseOnRequest={this.props.responseOnCounterpartyRequestAsync}
            actionCallback={this.actionCallback}
          />
        </Modal>
        <Modal open={actionType === DropdownMenuActionType.RESEND} size="small">
          <ResendCounterpartyModal
            companyId={counterparty ? counterparty.staticId : ''}
            companyName={counterparty ? counterparty.x500Name.O : ''}
            readonly={!this.props.isAuthorized(coverage.canCrudCoverage)}
            handleResponseOnRequest={this.props.resendCounterpartyAsync}
            actionCallback={this.actionCallback}
          />
        </Modal>
      </React.Fragment>
    )
  }

  actionCallback = (status: boolean): void => {
    if (status) {
      this.props.getConnectedCounterpartiesWithRequestsAsync()
    }
    this.setState({ counterparty: undefined, actionType: DropdownMenuActionType.NONE })
  }

  printErrorOrCounterparties() {
    if (this.props.fetchingConnectedCounterpartiesError !== null) {
      return (
        <ErrorMessage title="Unable to load counterparties" error={this.props.fetchingConnectedCounterpartiesError} />
      )
    }
    return (
      <ConnectedCounterparties
        counterparties={this.props.counterpartiesFiltered}
        counterpartyProfiles={this.props.counterpartyProfiles}
        handleSort={this.handleConnectedCounterpartiesSort}
        counterpartiesSort={this.props.counterpartiesSort}
        renderMenu={this.renderMenu}
        typeCounterTable={TypeCounterTable.MANAGEMENT}
      />
    )
  }

  render() {
    return (
      <React.Fragment>
        <Helmet>
          <title>Counterparty management</title>
        </Helmet>
        <PageHeader
          pageName="Counterparty management"
          handleButtonClick={this.handleChangeStateAddModal}
          buttonContent="Add new"
          shouldRenderButton={this.props.isAuthorized(coverage.canCrudCoverage)}
          handleSearch={this.handleOnSearchConnectedCounterparties}
          searchValue={this.props.counterpartiesSearch}
        />
        {this.props.fetchingConnectedCounterparties && <LoadingTransition title="Loading counterparties" />}
        {!this.props.fetchingConnectedCounterparties && this.printErrorOrCounterparties()}
        {this.renderModals()}
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state: ApplicationState) => {
  const tasks = state.get('tasks').get('tasks')
  return {
    tasks
  }
}

export default compose<any>(
  withPermissions,
  withCounterparties,
  connect(mapStateToProps, {
    getTasks,
    responseOnCounterpartyRequestAsync: responseOnCounterpartyRequestAsyncAction,
    resendCounterpartyAsync: resendCounterpartyAsyncAction
  })
)(CounterpartiesContainer)
