import * as React from 'react'
import { Tab, Table } from 'semantic-ui-react'
import { Task, TaskWithUser } from '../store/types'
import TaskRow from './TaskRow'

interface TabPaneProps {
  tasks: TaskWithUser[]
  onViewDetailsClick(task: TaskWithUser): void
  onOpenTaskClick(task: TaskWithUser): void
  onAssigneeToMe(task: Task): void
  onAssigneeTo(task: Task): void
}

export const TabPane: React.SFC<TabPaneProps> = (props: TabPaneProps) => {
  return (
    <Tab.Pane>
      {props.tasks.length ? (
        <Table basic="very">
          <Table.Body>
            <TaskRow
              onViewDetailsClick={props.onViewDetailsClick}
              onAssigneeToMe={props.onAssigneeToMe}
              onAssigneeTo={props.onAssigneeTo}
              onOpenTaskClick={props.onOpenTaskClick}
              tasks={props.tasks}
            />
          </Table.Body>
        </Table>
      ) : (
        'No Tasks'
      )}
    </Tab.Pane>
  )
}

export default TabPane
