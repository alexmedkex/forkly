import * as React from 'react'

import { Template } from '../../store'
import { Table } from 'semantic-ui-react'

interface RowProps {
  template: Template
  active: boolean
  rowId: any
  onClick(arg1: any, arg2: any): void
}

class SelectableRow extends React.Component<RowProps> {
  constructor(props: RowProps) {
    super(props)
  }

  onClick = (e: any) => {
    const { onClick, rowId } = this.props
    onClick(rowId, e)
  }

  render() {
    const { template, active } = this.props
    return (
      <Table.Row onClick={this.onClick} active={active}>
        {/* TODO: Find value for template type */}
        <Table.Cell>{template.name}</Table.Cell>
        <Table.Cell>{template.predefined ? 'System' : 'Custom'}</Table.Cell>
        <Table.Cell>
          {template.types.length} document{template.types.length > 1 ? 's' : ''}
        </Table.Cell>
      </Table.Row>
    )
  }
}

export default SelectableRow
