import * as React from 'react'
import { Header, Icon, Container, Button } from 'semantic-ui-react'
import { CustomEmptyDocumentsIcon } from '../../../../components/custom-icon'

interface Props {
  toggleDocumentRequestModal(): void
}

const EmptyCounterpartyLibrary: React.SFC<Props> = (props: Props) => {
  return (
    <Container text={true}>
      <div style={{ textAlign: 'center', marginBottom: 0, marginTop: '25%' }}>
        <Header icon={true} style={{ fontSize: '2.4em' }}>
          <CustomEmptyDocumentsIcon />
          <h3>No documents available</h3>
        </Header>
        <h4 style={{ color: '#5d768f', marginTop: 0 }}>Request documents from your counterparty</h4>
        <Button onClick={props.toggleDocumentRequestModal} primary={true}>
          Request documents
        </Button>
      </div>
    </Container>
  )
}

export default EmptyCounterpartyLibrary
