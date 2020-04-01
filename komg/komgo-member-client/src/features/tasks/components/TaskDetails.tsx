import * as React from 'react'
import styled from 'styled-components'
import moment from 'moment'
import { Grid, Divider, Icon } from 'semantic-ui-react'
import { TaskWithUser, TaskStatus } from '../store/types'

interface TaskDetailsProps {
  task: TaskWithUser
}

export const MutedText = styled.span`
  font-size: 14px !important;
  color: #5d768f; /* blue-grey */
`

export const Summary = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #1c2936; /* dark */
`

export const CounterpartyName = styled.span`
  font-size: 14px;
  color: #1c2936; /* dark */
`

export const OverdueTime = styled.span`
  color: red;
`

export const Done = styled.span`
  font-size: 12px;
  color: grey;
`

export const Created = styled.span`
  color: #5d768f; /* blue-grey */
`
export const CompletedOn = styled.span`
  font-size: 14px !important;
  color: #009ea8;
`

const Description = styled.div`
  margin-top: 15px;
`

export const statusToIconName = {
  'To Do': 'circle outline',
  'In Progress': 'clock outline',
  Done: 'check'
}

export function renderDateColumn(
  updatedAtIso: string,
  status: string,
  dueAtIso: string | null = null
): JSX.Element | null {
  const updatedAt = new Date(updatedAtIso)
  if (status === TaskStatus.Done) {
    return <Done>Completed {formattedDate(updatedAt)}</Done>
  } else if (dueAtIso !== null) {
    const dueAt = new Date(dueAtIso)
    if (dueAt < new Date()) {
      return <OverdueTime>Due {formattedDate(dueAt)}</OverdueTime>
    } else {
      return <Created>Due {formattedDate(dueAt)}</Created>
    }
  }
  return null
}

export function formattedDate(date: Date | string): string {
  return moment(date).format('MMM DD, YYYY')
}

const TaskDetails: React.SFC<TaskDetailsProps> = ({ task: { task, user } }: TaskDetailsProps) => (
  <>
    <Grid>
      <Grid.Row>
        <Grid.Column width={task.dueAt ? 10 : 16}>
          <Summary>{task.summary}</Summary>
          <br />
          <CounterpartyName>{task.counterpartyName}</CounterpartyName>
          <br />
          <Created>Received {formattedDate(task.createdAt)} </Created>
        </Grid.Column>
        <Grid.Column textAlign="right" width={task.dueAt ? 6 : 1}>
          {task.dueAt && <MutedText>Due {formattedDate(task.dueAt)} </MutedText>}
        </Grid.Column>
      </Grid.Row>

      {task.status === TaskStatus.Done && (
        <Grid.Row>
          <Grid.Column width={16}>
            <Done>
              <Icon className="task-completed" name={statusToIconName[task.status] as any} size="small" />
              <CompletedOn>
                Completed on {formattedDate(task.updatedAt)}
                {user && (
                  <>
                    {' '}
                    by {user.firstName} {user.lastName}
                  </>
                )}
              </CompletedOn>
            </Done>
          </Grid.Column>
        </Grid.Row>
      )}

      {task.comment && (
        <Grid.Row>
          <Grid.Column width={16}>
            <Description>
              {task.comment.split('\n').map((item, key) => (
                <React.Fragment key={key}>
                  {item}
                  <br />
                </React.Fragment>
              ))}
            </Description>
          </Grid.Column>
        </Grid.Row>
      )}
    </Grid>
  </>
)

export default TaskDetails
