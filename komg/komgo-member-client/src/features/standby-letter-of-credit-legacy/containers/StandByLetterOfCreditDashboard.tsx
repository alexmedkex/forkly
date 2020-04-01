import * as React from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { Table, Image } from 'semantic-ui-react'
import Numeral from 'numeral'
import { IStandbyLetterOfCredit } from '@komgo/types'

import { Task, TaskWithUser, TaskManagementActionType, TaskStatus } from '../../tasks/store/types'
import { PollingService } from '../../../utils/PollingService'
import { getTasks } from '../../tasks/store/actions'
import { WithLoaderProps, withLoaders } from '../../../components/with-loaders'
import { ApplicationState } from '../../../store/reducers'
import { StandbyLetterOfCreditActionType, FetchStandByLettersOfCredit } from '../store/types'
import { Order, OrderMongoValue } from '../../../store/common/types'
import { fetchStandByLettersOfCredit } from '../store/actions'
import { IMember } from '../../members/store/types'
import { findRole, findParticipantCommonNames } from '../../financial-instruments/utils/selectors'
import { findTasksByStandByLetterOfCreditAndStatuses } from '../utils/selectors'
import { Link } from 'react-router-dom'
import { displayDate } from '../../../utils/date'
import RoleInfo from '../../financial-instruments/components/RoleInfo'
import { Roles } from '../../letter-of-credit-legacy/constants/roles'
import { sentenceCaseWithLC } from '../../letter-of-credit-legacy/utils/casings'
import { ActionStatus } from '../../letter-of-credit-legacy/components/ActionStatus'
import ActionMenu from '../components/action-menu/ActionMenu'
import { LoadingTransition, ErrorMessage } from '../../../components'

export interface IStandByLetterOfCreditEnriched extends IStandbyLetterOfCredit {
  issuingBank: string
  applicant: string
  beneficiary: string
  beneficiaryBank: string
  tasks: Task[]
  actionStatus: TaskStatus
  role: Roles
}
interface IProps extends WithLoaderProps {
  isActive: boolean
  tasks: Task[]
  standByLettersOfCredit: IStandByLetterOfCreditEnriched[]
  getTasks: (params?: {}) => any
  fetchStandByLettersOfCredit: (params?: FetchStandByLettersOfCredit) => any
}

interface IState {
  column: string
  direction: Order
}

export class StandByLetterOfCreditDashboard extends React.Component<IProps, IState> {
  private pollingService: PollingService
  constructor(props: IProps) {
    super(props)
    this.state = {
      column: 'updatedAt',
      direction: Order.Desc
    }
    this.refresh = this.refresh.bind(this)
    this.pollingService = new PollingService(5000, [this.refresh])
  }

  componentDidMount() {
    this.props.fetchStandByLettersOfCredit({
      filter: {
        options: { sort: { updatedAt: OrderMongoValue[Order.Desc] }, skip: 0, limit: 200 }
      }
    })
    this.props.getTasks()
    if (this.props.isActive) {
      this.pollingService.start()
    }
  }

  componentDidUpdate(oldProps: IProps) {
    const { isActive } = this.props
    if (oldProps.isActive !== isActive) {
      isActive ? this.pollingService.start() : this.pollingService.stop()
    }
  }

  componentWillUnmount() {
    this.pollingService.stop()
  }

  async refresh() {
    const { column, direction } = this.state
    const options = this.getSortReferenceOptions(OrderMongoValue[direction], column)
    this.props.fetchStandByLettersOfCredit({
      filter: {
        options
      },
      polling: true
    })
  }

  getSortReferenceOptions(direction: number, column: string) {
    return column === 'reference'
      ? {
          sort: {
            'referenceObject.trigram': direction,
            'referenceObject.value': direction,
            'referenceObject.year': direction
          },
          skip: 0,
          limit: 200
        }
      : { sort: { [column]: direction }, skip: 0, limit: 200 }
  }

  handleSort = (newColumn: string) => {
    const { column, direction } = this.state
    let newDirection = Order.Desc
    if (column === newColumn) {
      newDirection = direction === Order.Desc ? Order.Asc : Order.Desc
    }
    this.props.fetchStandByLettersOfCredit({
      filter: {
        options: this.getSortReferenceOptions(OrderMongoValue[newDirection], newColumn)
      }
    })
    this.setState({
      column: newColumn,
      direction: newDirection
    })
  }

  isSortActive = (currentColumn: string) => {
    return currentColumn === this.state.column ? this.state.direction : null
  }

  render() {
    const { standByLettersOfCredit, isFetching, errors } = this.props
    const [error] = errors
    if (isFetching) {
      return <LoadingTransition title="Loading Stand By Letters Of Credit" />
    } else if (error) {
      return <ErrorMessage title="Stand By Letter Of Credit" error={error} />
    }
    return (
      <Table basic="very" sortable={true} data-test-id="standby-letters-of-credit-table">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell
              data-test-id="reference"
              onClick={() => this.handleSort('reference')}
              sorted={this.isSortActive('reference')}
              textAlign="left"
            >
              Reference
            </Table.HeaderCell>
            <Table.HeaderCell
              data-test-id="issuingBankReference"
              onClick={() => this.handleSort('issuingBankReference')}
              sorted={this.isSortActive('issuingBankReference')}
            >
              Issuing Bank Reference
            </Table.HeaderCell>
            <Table.HeaderCell
              data-test-id="expiryDate"
              onClick={() => this.handleSort('expiryDate')}
              sorted={this.isSortActive('expiryDate')}
            >
              Expiry
            </Table.HeaderCell>
            <Table.HeaderCell
              data-test-id="latestShipment"
              onClick={() => this.handleSort('latestShipment')}
              sorted={this.isSortActive('latestShipment')}
            >
              Latest Shipment / Delivery
            </Table.HeaderCell>
            <Table.HeaderCell
              data-test-id="role"
              onClick={() => this.handleSort('role')}
              sorted={this.isSortActive('role')}
            >
              Role
            </Table.HeaderCell>
            <Table.HeaderCell
              data-test-id="amount"
              onClick={() => this.handleSort('amount')}
              sorted={this.isSortActive('amount')}
              textAlign="right"
            >
              Amount
            </Table.HeaderCell>
            <Table.HeaderCell
              data-test-id="status"
              onClick={() => this.handleSort('status')}
              sorted={this.isSortActive('status')}
            >
              Status
            </Table.HeaderCell>
            <Table.HeaderCell
              data-test-id="action"
              onClick={() => this.handleSort('action')}
              sorted={this.isSortActive('action')}
            >
              Action
            </Table.HeaderCell>
            <Table.HeaderCell />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {standByLettersOfCredit.map((letter, idx) => (
            <Table.Row key={idx} id={letter.contractReference}>
              <Table.Cell textAlign="left">
                <Link to={`/financial-instruments/standby-letters-of-credit/${letter.staticId}`}>
                  <Image src="/images/file.svg" inline={true} spaced="right" />
                  {letter.reference}
                </Link>
              </Table.Cell>
              <Table.Cell>{letter.issuingBankReference}</Table.Cell>
              <Table.Cell>{displayDate(letter.expiryDate)}</Table.Cell>
              <Table.Cell>{/* TODO: add this one trade snapshot is saved in db */}</Table.Cell>
              <Table.Cell>
                <RoleInfo letter={letter} />
              </Table.Cell>
              <Table.Cell textAlign="right">{`${letter.currency} ${Numeral(letter.amount).format('0,0')}`}</Table.Cell>
              <Table.Cell>{sentenceCaseWithLC(letter.status)}</Table.Cell>
              <Table.Cell>
                <ActionStatus actionStatus={letter.actionStatus} />
              </Table.Cell>
              <Table.Cell>
                <ActionMenu letter={letter} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    )
  }
}

const mapStateToProps = (state: ApplicationState) => {
  const members: IMember[] = Object.values(
    state
      .get('members')
      .get('byId')
      .toJS()
  )

  const tasks: Task[] = state
    .get('tasks')
    .get('tasks')
    .map((t: TaskWithUser) => t.task)

  const companyStaticId = (state.get('uiState').get('profile') || { company: undefined }).company

  const standByLettersOfCredit: IStandByLetterOfCreditEnriched[] = state
    .get('standByLettersOfCredit')
    .get('ids')
    .map(id =>
      state
        .get('standByLettersOfCredit')
        .get('byId')
        .get(id!)
    )
    .toJS()
    .map((letter: IStandbyLetterOfCredit) => {
      const tasksBySBLC = findTasksByStandByLetterOfCreditAndStatuses(letter.staticId, tasks, [
        TaskStatus.ToDo,
        TaskStatus.InProgress
      ])
      return {
        ...letter,
        tasks: tasksBySBLC,
        actionStatus: tasksBySBLC.length > 0 ? TaskStatus.ToDo : TaskStatus.Done,
        role: findRole(letter, companyStaticId),
        ...findParticipantCommonNames(letter, members)
      }
    })

  return {
    tasks,
    standByLettersOfCredit
  }
}

export default compose<any>(
  withLoaders({
    actions: [
      StandbyLetterOfCreditActionType.FETCH_STANDBY_LETTERS_OF_CREDIT_REQUEST,
      TaskManagementActionType.TASKS_REQUEST
    ]
  }),
  connect(mapStateToProps, {
    getTasks,
    fetchStandByLettersOfCredit
  })
)(StandByLetterOfCreditDashboard)
