import * as React from 'react'
import { Header, Icon, Container, Button } from 'semantic-ui-react'
import { CustomEmptyDocumentsIcon } from '../../../../components/custom-icon'

interface Props {
  toggleAddDocumentModal(): void
}

const EmptyDocumentLibrary: React.SFC<Props> = (props: Props) => {
  return (
    <Container text={true}>
      <div style={{ textAlign: 'center', marginBottom: 0, marginTop: '25%' }}>
        <Header icon={true} style={{ fontSize: '2.4em' }}>
          <CustomEmptyDocumentsIcon />
          <h3>Your document library is empty</h3>
        </Header>
        <h4 style={{ color: '#5d768f', marginTop: 0 }}>Add a document to your library</h4>
        <Button onClick={props.toggleAddDocumentModal} primary={true}>
          Add document
        </Button>
      </div>
    </Container>
  )
}

export default EmptyDocumentLibrary
