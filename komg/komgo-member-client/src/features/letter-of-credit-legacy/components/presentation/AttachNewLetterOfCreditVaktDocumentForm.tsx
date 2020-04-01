import * as React from 'react'
import styled from 'styled-components'
import { List, Image, Checkbox, Modal, Button } from 'semantic-ui-react'
import { Document } from '../../../document-management/store/types'
import { displayDateAndTime } from '../../../../utils/date'
import { ErrorMessage, LoadingTransition } from '../../../../components'
import { ServerError } from '../../../../store/common/types'

interface Props {
  visible: boolean
  isAttaching: boolean
  title: string
  vaktDocuments: Document[]
  isFetchingVaktDocuments: boolean
  fetchingVaktDocumentErrors: ServerError[]
  attachingDocumentsError: ServerError[]
  toggleVisible(): void
  handleSubmit(ids: string[]): void
}

interface State {
  addVaktDocuments: string[]
}

class AttachNewLetterOfCreditVaktDocumentForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      addVaktDocuments: []
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.visible && !this.props.visible && this.state.addVaktDocuments.length > 0) {
      this.setState({ addVaktDocuments: [] })
    }
  }

  handleCheckboxClick = (documentId: string): void => {
    let docs = this.state.addVaktDocuments
    if (this.state.addVaktDocuments.indexOf(documentId) === -1) {
      docs.push(documentId)
    } else {
      docs = this.state.addVaktDocuments.filter(id => id !== documentId)
    }
    this.setState({
      addVaktDocuments: docs
    })
  }

  parcelIdOrNull(document: Document) {
    const { context } = document
    return context && context.parcelId ? `Parcel #${context.parcelId}` : null
  }

  renderModalContent() {
    const {
      vaktDocuments,
      isAttaching,
      isFetchingVaktDocuments,
      fetchingVaktDocumentErrors,
      attachingDocumentsError
    } = this.props

    if (fetchingVaktDocumentErrors && fetchingVaktDocumentErrors.length > 0) {
      return <ErrorMessage title="Loading Vakt Documents Error" error={fetchingVaktDocumentErrors[0].message} />
    }
    if (isAttaching || isFetchingVaktDocuments) {
      return (
        <LoadingTransition title={isAttaching ? 'Attaching Documents' : 'Loading Vakt Documents'} marginTop="15px" />
      )
    }
    if (!vaktDocuments || vaktDocuments.length === 0) {
      return <NotFoundText className="disabled">No VAKT documents found</NotFoundText>
    }
    return (
      <List divided={false} style={{ paddingLeft: 0, paddingRight: 0 }}>
        {attachingDocumentsError && attachingDocumentsError.length > 0 ? (
          <ErrorMessage title="Attaching document error" error={attachingDocumentsError[0].message} />
        ) : null}
        {vaktDocuments.map(document => (
          <List.Item key={document.id}>
            <List.Content>
              <Checkbox
                onClick={() => this.handleCheckboxClick(document.id)}
                style={{ paddingLeft: 0, paddingRight: 0 }}
                checked={this.state.addVaktDocuments.includes(document.id)}
              />
              <Image
                src="/images/file.svg"
                inline={true}
                spaced="right"
                verticalAlign="top"
                style={{ marginLeft: '5px' }}
              />
              <CommonCell>
                <BreakWord>{document.name}</BreakWord>
              </CommonCell>
              <CommonCell>{document.type ? document.type.name : ''}</CommonCell>
              <CommonCell>{this.parcelIdOrNull(document)}</CommonCell>
              <DateCell>{displayDateAndTime(document.registrationDate)}</DateCell>
            </List.Content>
          </List.Item>
        ))}
      </List>
    )
  }

  render() {
    const { toggleVisible, handleSubmit, isAttaching } = this.props
    const { addVaktDocuments } = this.state
    return (
      <Modal open={this.props.visible} centered={true} style={{ top: 'unset' }} size="large">
        <Modal.Header>{this.props.title}</Modal.Header>
        <Modal.Content>{this.renderModalContent()}</Modal.Content>
        <Modal.Actions>
          <Button className="ui button" role="button" onClick={() => toggleVisible()} disabled={isAttaching}>
            Cancel
          </Button>
          <Button
            primary={true}
            content="Submit"
            onClick={() => handleSubmit(this.state.addVaktDocuments)}
            disabled={addVaktDocuments.length === 0 || isAttaching}
          />
        </Modal.Actions>
      </Modal>
    )
  }
}

interface IStyledPropProps {
  width?: string
}

const StyledProp = styled.span`
  display: inline-block;
  vertical-align: top;
  width: ${(prop: IStyledPropProps) => prop.width || '20%'};
`

const CommonCell = styled(StyledProp)`
  width: calc(calc(100% - 200px) / 3);
`

const BreakWord = styled.span`
  overflow-wrap: break-word;
  word-wrap: break-word;
  -ms-word-break: break-all;
  word-break: break-all;
  word-break: break-word;
  -ms-hyphens: auto;
  -moz-hyphens: auto;
  -webkit-hyphens: auto;
  hyphens: auto;
  font-weight: bold;
`

const DateCell = styled(StyledProp)`
  width: 150px;
`

const NotFoundText = styled.div`
  text-align: center;
  padding: 50px 0;
`

export default AttachNewLetterOfCreditVaktDocumentForm
