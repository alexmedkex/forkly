import * as React from 'react'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'
import { bindActionCreators } from 'redux'

import { ApplicationState } from '../../../store/reducers'
import { Task } from '../store/types'
import { setTaskInModal } from '../store/actions'
import { LetterOfCreditTaskType } from '../../letter-of-credit-legacy/constants/taskType'
import ReviewRequestedDiscrepancies from '../../letter-of-credit-legacy/containers/presentation/ReviewRequestedDiscrepancies'

interface IProps {
  task: Task | null
  setTask(task: Task | null): any
}

export class GlobalTaskModal extends React.Component<IProps> {
  mapTaskTypeToComponent = new Map<string, any>([
    [
      LetterOfCreditTaskType.REVIEW_PRESENTATION_DISCREPANCIES,
      { component: <ReviewRequestedDiscrepancies />, modalSize: 'large' }
    ]
  ])

  componentWillUnmount() {
    if (this.props.task) {
      this.close()
    }
  }

  close = () => {
    this.props.setTask(null)
  }

  render() {
    const { task } = this.props
    const settings = task ? this.mapTaskTypeToComponent.get(task.taskType) : null
    if (task && settings) {
      return (
        <Modal
          open={true}
          onClose={this.close}
          size={settings.modalSize || 'small'}
          closeOnDimmerClick={false}
          style={{ minHeight: '200px' }}
        >
          {settings.component}
        </Modal>
      )
    }
    return null
  }
}

const mapStateToProps = (state: ApplicationState) => ({
  task: state.get('tasks').get('taskInModal')
})

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators({ setTask: setTaskInModal }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(GlobalTaskModal)
