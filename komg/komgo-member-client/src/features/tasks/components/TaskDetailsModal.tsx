import * as React from 'react'
import { Modal, Button } from 'semantic-ui-react'
import { TaskDetails } from '../components'
import { TaskWithUser, TaskStatus } from '../store/types'

interface Props {
  taskDetails?: TaskWithUser
  onViewDetailsClose: () => void
}

const TaskDetailsModal: React.SFC<Props> = (props: Props) => {
  return (
    <Modal open={props.taskDetails !== undefined} onClose={props.onViewDetailsClose} size="small">
      {props.taskDetails && (
        <>
          <Modal.Header as="h2">{getTitleModal(props.taskDetails.task.status)}</Modal.Header>
          <Modal.Content>
            <TaskDetails task={props.taskDetails} />
          </Modal.Content>
          <Modal.Actions>
            <Button primary={true} onClick={props.onViewDetailsClose}>
              Close
            </Button>
          </Modal.Actions>
        </>
      )}
    </Modal>
  )
}

const getTitleModal = (status: TaskStatus) => {
  if (status === TaskStatus.Done) {
    return 'Task complete'
  }
  return status
}

export default TaskDetailsModal
