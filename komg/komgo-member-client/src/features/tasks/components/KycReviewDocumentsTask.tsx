import * as React from 'react'
import { Table } from 'semantic-ui-react'
import { TaskComponent } from '../../tasks'

const KycReviewDocumentsTask: React.SFC<TaskComponent> = (props: TaskComponent): any => (
  <>
    <h1>Task Component Example</h1>

    <h3>props</h3>
    <Table celled={true}>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Key</Table.HeaderCell>
          <Table.HeaderCell>Value</Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        <Table.Row>
          <Table.Cell>
            <pre>task</pre>
          </Table.Cell>
          <Table.Cell>
            <pre>{JSON.stringify(props.task, null, 2)}</pre>
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            <pre>assignedUser</pre>
          </Table.Cell>
          <Table.Cell>
            <pre>{JSON.stringify(props.assignedUser, null, 2)}</pre>
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  </>
)

export default KycReviewDocumentsTask
