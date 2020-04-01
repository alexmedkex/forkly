import * as React from 'react'

import { SharedWithFull } from '../../store/types'
import { List, Header, Table, Container } from 'semantic-ui-react'
import * as CounterpartyHelper from '../../utils/counterpartyHelper'
import moment from 'moment'
import styled from 'styled-components'

interface Props {
  sharedWith: SharedWithFull[]
}

const SharedDocumentInfo: React.SFC<Props> = (props: Props) => {
  const { sharedWith } = props
  return sharedWith.length ? SharedWithFullToListItem(sharedWith) : unsharedPlaceholder()
}

const SharedWithFullToListItem = (sharedWith: SharedWithFull[]) => {
  return (
    <SharedDocumentInfoStyle>
      <Table fixed={false}>
        <Table.Body>
          {sharedWith.map((elem, index) => {
            return (
              <Table.Row key={index}>
                <Table.Cell>{CounterpartyHelper.counterpartyName(elem.counterparty)}</Table.Cell>
                <Table.Cell>{elem.lastSharedDate ? moment(elem.lastSharedDate).format('YYYY-MM-DD') : '-'}</Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table>
    </SharedDocumentInfoStyle>
  )
}

const unsharedPlaceholder = () => {
  return (
    <div style={{ textAlign: 'center' }}>
      <Header icon={true}>Document has not been shared.</Header>
    </div>
  )
}

const SharedDocumentInfoStyle = styled(Container)`
  margin-top: 2em;
  .ui.table tr td {
    border-top: 0px !important;
  }
  .ui.table {
    border: 0px !important;
  }
`

export default SharedDocumentInfo
