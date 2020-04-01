import * as React from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { Link, RouteComponentProps, withRouter } from 'react-router-dom'
import Numeral from 'numeral'
import { Fragment } from 'react'
import { Table, Image } from 'semantic-ui-react'

import { ApplicationState } from '../../../store/reducers'
import { ErrorMessage, LoadingTransition } from '../../../components'
import { fetchLettersOfCredit, sortBy } from '../store/actions'
import { getTasks } from '../../tasks/store/actions'
import { IMember } from '../../members/store/types'
import { ILetterOfCredit, ILetterOfCreditStatus } from '../types/ILetterOfCredit'
import { displayDate } from '../../../utils/date'
import { ActionStatus } from '../components/ActionStatus'
import RoleInfo from '../../financial-instruments/components/RoleInfo'
import { ActionsMenu } from '../components/actions-menu'
import { sentenceCaseWithLC } from '../utils/casings'
import {
  findTaskStatusByLetterOfCreditId,
  findTasksByLetterOfCreditId,
  findLatestShipment,
  hasPresentationTasks,
  getTimer,
  timerExists
} from '../utils/selectors'
import { findRole, findParticipantCommonNames } from '../../financial-instruments/utils/selectors'
import { LetterOfCreditActionType, TableSortParams } from '../store/types'
import Timer from '../../../components/timer/Timer'
import LCTimer from '../components/timer/LCTimer'
import { Roles } from '../constants/roles'
import { Task, TaskManagementActionType, TaskWithUser } from '../../tasks/store/types'
import { DESC, ASC } from '../../trades/constants'
import { PollingService } from '../../../utils/PollingService'
import { WithLoaderProps, withLoaders } from '../../../components/with-loaders'
import { setTaskInModal } from '../../tasks/store/actions'
import { Order, OrderMongoValue } from '../../../store/common/types'

export interface ILetterOfCreditEnriched extends ILetterOfCredit {
  issuingBank: string
  applicant: string
  beneficiary: string
  beneficiaryBank: string
  role: string
  actionStatus: string
  tasks: Task[]
  latestShipment: Date | string | number
  updatedAt?: Date | string | number
  hasPresentationTask?: boolean
}

export interface ILetterOfCreditDashboardProps extends WithLoaderProps {
  lettersOfCredit: ILetterOfCreditEnriched[]
  tasks: Task[]
  companyStaticId: string
  isActive: boolean
  getTasks: (params?: {}) => any
  fetchLettersOfCredit: (params?: {}) => any
  setTaskInModal(task: Task): void
}

export interface IState {
  column: string
  direction: Order
}

export class LetterOfCreditDashboard extends React.Component<ILetterOfCreditDashboardProps, IState> {
  private pollingService: PollingService
  constructor(props: ILetterOfCreditDashboardProps) {
    super(props)
    this.handleSort = this.handleSort.bind(this)
    this.refresh = this.refresh.bind(this)
    this.state = {
      column: 'updatedAt',
      direction: Order.Desc
    }
    this.pollingService = new PollingService(5000, [this.refresh])
  }

  componentDidMount() {
    this.props.fetchLettersOfCredit({
      filter: {
        options: { sort: { updatedAt: DESC } }
      }
    })
    this.props.getTasks()
    if (this.props.isActive) {
      this.pollingService.start()
    }
  }

  componentDidUpdate(oldProps: ILetterOfCreditDashboardProps) {
    const { isActive } = this.props
    if (oldProps.isActive !== isActive) {
      isActive ? this.pollingService.start() : this.pollingService.stop()
    }
  }

  componentWillUnmount() {
    this.pollingService.stop()
  }

  handleSort(currentColumn: keyof ILetterOfCreditEnriched) {
    return () => {
      const { column, direction } = this.state
      const update: any = {
        column: currentColumn,
        direction: currentColumn === column && direction === Order.Desc ? Order.Asc : Order.Desc,
        showConfirmationModal: false
      }
      const sort = update.direction === Order.Asc ? ASC : DESC
      const options = this.getSortReferenceOptions(sort, currentColumn)
      this.props.fetchLettersOfCredit({
        filter: {
          options
        }
      })
      this.setState(update)
    }
  }

  render() {
    const arrowDirection = (columnName: keyof ILetterOfCreditEnriched) => {
      const { column, direction } = this.state
      return column === columnName ? direction : undefined
    }

    const [error] = this.props.errors
    if (error) {
      return <ErrorMessage title="Letter Of Credit" error={error} />
    }

    return this.props.isFetching ? (
      <LoadingTransition title="Loading Letters Of Credit" />
    ) : (
      <Fragment>
        <Table basic="very" sortable={true} data-test-id="letters-of-credit-table">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell
                id="reference"
                onClick={this.handleSort('reference')}
                sorted={arrowDirection('reference')}
                textAlign="left"
              >
                Reference
              </Table.HeaderCell>
              <Table.HeaderCell
                id="issuingBankReference"
                onClick={this.handleSort('issuingBankReference')}
                sorted={arrowDirection('issuingBankReference')}
              >
                Issuing Bank Reference
              </Table.HeaderCell>
              <Table.HeaderCell
                id="expiryDate"
                onClick={this.handleSort('expiryDate')}
                sorted={arrowDirection('expiryDate')}
              >
                Expiry
              </Table.HeaderCell>
              <Table.HeaderCell
                id="latestShipment"
                onClick={this.handleSort('latestShipment')}
                sorted={arrowDirection('latestShipment')}
              >
                Latest Shipment / Delivery
              </Table.HeaderCell>
              <Table.HeaderCell id="role" onClick={this.handleSort('role')} sorted={arrowDirection('role')}>
                Role
              </Table.HeaderCell>
              <Table.HeaderCell
                id="amount"
                onClick={this.handleSort('amount')}
                sorted={arrowDirection('amount')}
                textAlign="right"
              >
                Amount
              </Table.HeaderCell>
              <Table.HeaderCell id="status" onClick={this.handleSort('status')} sorted={arrowDirection('status')}>
                Status
              </Table.HeaderCell>
              <Table.HeaderCell
                id="actionStatus"
                onClick={this.handleSort('actionStatus')}
                sorted={arrowDirection('actionStatus')}
              >
                Action
              </Table.HeaderCell>
              <Table.HeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {this.props.lettersOfCredit.map((letter, idx) => (
              <Table.Row key={idx} id={letter.reference}>
                <Table.Cell textAlign="left">
                  <Link to={`/financial-instruments/letters-of-credit/${letter._id}`}>
                    <Image src="/images/file.svg" inline={true} spaced="right" />
                    {letter.reference}
                  </Link>
                </Table.Cell>
                <Table.Cell>{letter.issuingBankReference}</Table.Cell>
                <Table.Cell>{displayDate(letter.expiryDate)}</Table.Cell>
                <Table.Cell>{displayDate(letter.latestShipment)}</Table.Cell>
                <Table.Cell>
                  <RoleInfo letter={letter} />
                </Table.Cell>
                <Table.Cell textAlign="right">{`${letter.currency} ${Numeral(letter.amount).format(
                  '0,0'
                )}`}</Table.Cell>
                <Table.Cell>
                  {sentenceCaseWithLC(letter.status)}
                  {timerExists(letter) && letter.status === ILetterOfCreditStatus.REQUESTED ? (
                    <div>
                      <Timer
                        dueDate={getTimer(letter)}
                        render={(dueDateMoment, leftMinutes) => (
                          <LCTimer dueDateMoment={dueDateMoment} leftMinutes={leftMinutes} />
                        )}
                      />
                    </div>
                  ) : null}
                </Table.Cell>
                <Table.Cell>
                  <ActionStatus actionStatus={letter.actionStatus} />
                </Table.Cell>
                <Table.Cell>
                  <ActionsMenu letter={letter} openTaskModal={this.props.setTaskInModal} />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Fragment>
    )
  }

  private async refresh() {
    const sort = this.state.direction === Order.Asc ? ASC : DESC
    const options = this.getSortReferenceOptions(sort, this.state.column)
    this.props.fetchLettersOfCredit({
      filter: {
        options
      },
      polling: true
    })
  }

  private getSortReferenceOptions(direction: number, column: string) {
    return column === 'reference'
      ? {
          sort: {
            'referenceObject.trigram': direction,
            'referenceObject.value': direction,
            'referenceObject.year': direction
          }
        }
      : { sort: { [column]: direction } }
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

  const lettersOfCredit: ILetterOfCreditEnriched[] = state
    .get('lettersOfCredit')
    .get('ids')
    .map(id =>
      state
        .get('lettersOfCredit')
        .get('byId')
        .get(id!)
    )
    .toJS()
    .map((letter: ILetterOfCredit) => {
      const role = findRole(letter, companyStaticId!)
      return {
        ...letter,
        role,
        ...findParticipantCommonNames(letter, members),
        ...findLatestShipment(letter),
        actionStatus: findTaskStatusByLetterOfCreditId(tasks, letter._id),
        tasks: findTasksByLetterOfCreditId(tasks, letter._id),
        hasPresentationTask: hasPresentationTasks(tasks, letter._id)
      }
    })
  return {
    companyStaticId,
    tasks,
    lettersOfCredit
  }
}

export default compose<any>(
  withLoaders({
    actions: [LetterOfCreditActionType.LETTERS_OF_CREDIT_REQUEST, TaskManagementActionType.TASKS_REQUEST]
  }),
  connect(mapStateToProps, {
    fetchLettersOfCredit,
    sortBy,
    getTasks,
    setTaskInModal
  })
)(LetterOfCreditDashboard)
