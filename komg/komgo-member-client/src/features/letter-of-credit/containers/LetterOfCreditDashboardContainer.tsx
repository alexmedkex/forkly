import * as React from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'

import { ApplicationState } from '../../../store/reducers'
import { ErrorMessage, LoadingTransition, Unauthorized, withPermissions } from '../../../components'
import { fetchLettersOfCreditByType } from '../store/actions'
import { getTasks, setTaskInModal } from '../../tasks/store/actions'
import { LetterOfCreditType } from '@komgo/types'

import { ILetterOfCreditEnriched, LetterOfCreditActionType } from '../store/types'
import { Task, TaskManagementActionType } from '../../tasks/store/types'
import { DESC } from '../../trades/constants'
import { PollingService } from '../../../utils/PollingService'
import { WithLoaderProps, withLoaders } from '../../../components/with-loaders'
import { Order } from '../../../store/common/types'
import { LetterOfCreditDashboard } from '../components/LetterOfCreditDashboard'
import { WithPermissionsProps } from '../../../components/with-permissions'
import { RouteComponentProps } from 'react-router'
import { buildLetterOfCreditEnriched } from '../utils/buildLetterOfCreditEnriched'
import { tradeFinanceManager } from '@komgo/permissions'
import { Spacer } from '../../../components/spacer/Spacer'
import { SPACES } from '@komgo/ui-components'
import { hasSomeLetterOfCreditPermissions } from '../utils/permissions'

interface ILetterOfCreditDashboardContainerProps {
  lettersOfCredit: ILetterOfCreditEnriched[]
  standbyLetters: number
  documentaryLetters: number
  tasks: Task[]
  companyStaticId: string
}

interface ILetterOfCreditDashboardActions extends WithLoaderProps, WithPermissionsProps, RouteComponentProps<any> {
  getTasks: (params?: {}) => any
  fetchLettersOfCreditByType: (params?: {}) => any
}

export interface IProps
  extends WithLoaderProps,
    WithPermissionsProps,
    RouteComponentProps<any>,
    ILetterOfCreditDashboardContainerProps,
    ILetterOfCreditDashboardActions {}

export interface IState {
  column: string
  direction: Order
}

export class LetterOfCreditDashboardContainer extends React.Component<IProps, IState> {
  private pollingService: PollingService
  constructor(props) {
    super(props)
    this.refresh = this.refresh.bind(this)
    this.pollingService = new PollingService(5000, [this.refresh])
  }

  componentDidMount() {
    this.props.fetchLettersOfCreditByType({
      filter: {
        options: { sort: { updatedAt: DESC } }
      }
    })
    this.props.getTasks()
    this.pollingService.start()
  }

  componentDidUpdate(oldProps: IProps) {
    if (oldProps.match.params.type !== this.props.match.params.type) {
      this.props.fetchLettersOfCreditByType({
        filter: {
          options: { sort: { updatedAt: DESC } }
        },
        polling: true
      })
    }
  }

  componentWillUnmount() {
    this.pollingService.stop()
  }

  render() {
    const {
      errors,
      isFetching,
      lettersOfCredit,
      location,
      match,
      staticContext,
      history,
      documentaryLetters,
      standbyLetters,
      tasks,
      isAuthorized
    } = this.props

    if (!hasSomeLetterOfCreditPermissions(isAuthorized)) {
      return (
        <Spacer padding={SPACES.DEFAULT}>
          <Unauthorized />
        </Spacer>
      )
    }

    const [error] = errors
    if (error) {
      return (
        <Spacer padding={SPACES.DEFAULT}>
          <ErrorMessage title="Letter Of Credit" error={error} />
        </Spacer>
      )
    }

    return isFetching ? (
      <LoadingTransition title="Loading Letters Of Credit" />
    ) : (
      <LetterOfCreditDashboard
        tasks={tasks}
        standbyLetters={standbyLetters}
        documentaryLetters={documentaryLetters}
        lettersOfCredit={lettersOfCredit}
        history={history}
        location={location}
        match={match}
        staticContext={staticContext}
      />
    )
  }

  private async refresh() {
    this.props.fetchLettersOfCreditByType({
      polling: true
    })
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: IProps): ILetterOfCreditDashboardContainerProps => {
  const { type } = ownProps.match.params

  const tasks: Task[] = state
    .get('tasks')
    .get('tasks')
    .map(task => task.task)

  const companyStaticId = state.get('uiState').get('profile').company

  const letters = state
    .get('templatedLettersOfCredit')
    .get('byStaticId')
    .toList()

  const lettersOfCredit: ILetterOfCreditEnriched[] = letters
    .filter(letter => letter.get('type') === type.toUpperCase())
    .toJS()
    .map(letter => buildLetterOfCreditEnriched(letter, tasks, companyStaticId))

  const standbyLetters = letters.filter(letter => letter.get('type') === LetterOfCreditType.Standby).size

  const documentaryLetters = letters.filter(letter => letter.get('type') === LetterOfCreditType.Documentary).size

  return {
    companyStaticId,
    tasks,
    lettersOfCredit,
    standbyLetters,
    documentaryLetters
  }
}

export default compose<any>(
  withPermissions,
  withLoaders({
    actions: [LetterOfCreditActionType.FETCH_LETTERS_OF_CREDIT_REQUEST, TaskManagementActionType.TASKS_REQUEST]
  }),
  connect(mapStateToProps, {
    fetchLettersOfCreditByType,
    getTasks,
    setTaskInModal
  })
)(LetterOfCreditDashboardContainer)
