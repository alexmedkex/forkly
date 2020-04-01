import * as React from 'react'
import { Table, Dropdown } from 'semantic-ui-react'
import styled from 'styled-components'
import { TaskWithUser, TaskStatus, Task } from '../../tasks/store/types'

import { MutedText, Summary, Created, renderDateColumn, formattedDate } from './TaskDetails'
import { ActionStatus } from '../../letter-of-credit-legacy/components/ActionStatus'

interface TaskRowProps {
  tasks: TaskWithUser[]
  onViewDetailsClick(task: TaskWithUser): void
  onOpenTaskClick(task: TaskWithUser): void
  onAssigneeToMe(task: Task): void
  onAssigneeTo(task: Task): void
}

const RowDiv = styled.div`
  display: flex;
  flex-direction: column;
`

const TaskRow: React.SFC<TaskRowProps> = (props: TaskRowProps): any => {
  const { tasks, onViewDetailsClick, onAssigneeToMe, onAssigneeTo, onOpenTaskClick } = props

  return (
    <>
      {tasks.map(({ task, user }: TaskWithUser) => (
        <Table.Row key={task._id} data-test-id={task._id}>
          <Table.Cell width={7}>
            <RowDiv>
              <Summary data-test-id="task-summary">{task.summary}</Summary>
              <span data-test-id="task-counterparty">{task.counterpartyName}</span>
              <Created data-test-id="task-date">{formattedDate(task.createdAt)} </Created>
            </RowDiv>
          </Table.Cell>
          <Table.Cell>
            {task.assignee ? (
              (user && (
                <span className="userName" data-test-id="task-assigned">
                  {user.firstName} {user.lastName}
                </span>
              )) ||
              '-'
            ) : (
              <MutedText>Unassigned</MutedText>
            )}
          </Table.Cell>
          <Table.Cell>
            <ActionStatus actionStatus={task.status} data-test-id="task-status" />
          </Table.Cell>
          <Table.Cell>{renderDateColumn(task.updatedAt, task.status, task.dueAt)}</Table.Cell>
          <Table.Cell>
            <StyledDropdown direction="left" icon="ellipsis horizontal">
              <Dropdown.Menu>
                {task.status === TaskStatus.Done ? (
                  <Dropdown.Item onClick={() => onViewDetailsClick({ task, user })}>View details</Dropdown.Item>
                ) : (
                  <>
                    <Dropdown.Item onClick={() => onOpenTaskClick({ task, user })}>Go to task</Dropdown.Item>
                    {!task.assignee && <Dropdown.Item onClick={() => onAssigneeToMe(task)}>Assign to me</Dropdown.Item>}
                    <Dropdown.Item onClick={() => onAssigneeTo(task)}>Assign to...</Dropdown.Item>
                  </>
                )}
              </Dropdown.Menu>
            </StyledDropdown>
          </Table.Cell>
        </Table.Row>
      ))}
    </>
  )
}

const StyledDropdown = styled(Dropdown)`
  float: right;
`

export default TaskRow
