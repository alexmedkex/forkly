import * as React from 'react'
import { Button, Container } from 'semantic-ui-react'
import styled from 'styled-components'
interface Props {
  visible: boolean
  counterparty?: boolean
  userCanCrudAndShareDocs?: boolean
  toggleShareDocumentModalVisible?: () => void
  downloadSelectedDocuments: () => void
}

class DocumentActionsButtonGroup extends React.Component<Props> {
  constructor(props: Props) {
    super(props)
  }

  render() {
    const { visible, toggleShareDocumentModalVisible } = this.props
    if (this.props.counterparty) {
      return (
        <ContainerWithMargin visible={visible ? 1 : 0}>
          <Button.Group>
            <Button onClick={() => this.props.downloadSelectedDocuments()}>Download</Button>
          </Button.Group>
        </ContainerWithMargin>
      )
    } else {
      return (
        <ContainerWithMargin visible={visible ? 1 : 0}>
          <Button.Group>
            <ShareButton
              userCanCrudAndShareDocs={!!this.props.userCanCrudAndShareDocs}
              toggleShareDocumentModalVisible={toggleShareDocumentModalVisible}
            />
            {/* <Button disabled={true}>Revoke</Button> */}
            <Button onClick={() => this.props.downloadSelectedDocuments()}>Download</Button>
          </Button.Group>
        </ContainerWithMargin>
      )
    }
  }
}

const ShareButton = (props: { userCanCrudAndShareDocs: boolean; toggleShareDocumentModalVisible?: () => void }) => {
  if (props.userCanCrudAndShareDocs) {
    return (
      <Button onClick={() => props.toggleShareDocumentModalVisible && props.toggleShareDocumentModalVisible()}>
        Share
      </Button>
    )
  } else {
    return null
  }
}

const ContainerWithMargin = styled(Container)`
  margin-top: 0.5rem;
  margin-bottom: -0.14285714em;
  visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};
`

export default DocumentActionsButtonGroup
