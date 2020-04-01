import * as React from 'react'
import { Button, Header, GridColumn } from 'semantic-ui-react'
import styled from 'styled-components'

import { DocumentType } from '../../store'

interface Props {
  title: string
  subtitlePrefix: string
  counterpartyName: string
  onToggleCloseModal(): void
}

const FlexHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding: 9px;
  margin-left: 30px;
  margin-right: 30px;
  font-family: LotaGrotesque;
`

const RequestDocumentsHeader: React.SFC<Props> = (props: Props) => {
  return (
    <FlexHeader>
      <GridColumn style={{ flexGrow: 2 }}>
        <MainTitle title={props.title} />
        <Subtitle subtitlePrefix={props.subtitlePrefix} counterpartyName={props.counterpartyName} />
      </GridColumn>
      <Button
        data-test-id="close-request-button"
        content="Close"
        onClick={() => props.onToggleCloseModal()}
        style={{ justifySelf: 'flex-end' }}
      />
    </FlexHeader>
  )
}

const MainTitle = ({ title }) => <Header content={title} style={{ margin: 0, fontSize: '21px' }} />
const Subtitle = ({ subtitlePrefix, counterpartyName }) => (
  <Header as="h3" style={{ margin: 0, fontSize: '14px' }}>
    {subtitlePrefix} <b data-test-id="name-counterparty-requested">{counterpartyName}</b>
  </Header>
)

export default RequestDocumentsHeader
