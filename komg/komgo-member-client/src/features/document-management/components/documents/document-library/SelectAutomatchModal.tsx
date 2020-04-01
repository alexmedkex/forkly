import * as React from 'react'
import { Confirm, Divider, Radio, Button, List, Checkbox, CheckboxProps } from 'semantic-ui-react'
import styled from 'styled-components'

import { Document, Category, DocumentType } from '../../../store'
import { groupBy } from '../../../components/documents/my-documents/toMap'

import { CategoryWithColourTag } from './CategoryWithColourTag'
import { ListItemBorderLeft } from './ListItemBorderLeft'
import { Items, DocumentListItem } from './DocumentListItem'
import SpanAsLink from '../../../../../components/span-as-link/SpanAsLink'

interface Props {
  category: Category
  documentType: DocumentType
  allDocs: Document[]
  open: boolean
  allowMultipleSelection?: boolean
  selectedDocumentIds?: string[]
  onConfirmClose(ids: string[]): void
  openViewDocument(id: string): void
  onToggleVisible(documentType: DocumentType): void
}

interface State {
  selectedDocumentIds: string[]
  countAutomatchedDocs: number
  automatchedDocs: Document[]
}

enum SelectionState {
  Unchecked = 0,
  Checked = 1,
  Indeterminate = 2
}

class SelectAutomatchModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    const documentsByType = groupBy(props.allDocs, doc => doc.type.id)
    const availableDocuments = documentsByType.get(props.documentType ? props.documentType.id : null) || []
    const counterDocs = availableDocuments.length

    this.state = {
      selectedDocumentIds: props.selectedDocumentIds || [],
      countAutomatchedDocs: counterDocs,
      automatchedDocs: availableDocuments
    }
  }

  handleConfirm = () => {
    this.props.onConfirmClose(this.state.selectedDocumentIds)
    this.resetSelectedDocumentId()
  }

  handleChange = (id: string) => {
    if (!this.props.allowMultipleSelection) {
      this.setState({ selectedDocumentIds: [id] })
    } else {
      const { selectedDocumentIds } = this.state

      this.setState({
        selectedDocumentIds: selectedDocumentIds.includes(id)
          ? selectedDocumentIds.filter(docId => docId !== id)
          : [...selectedDocumentIds, id]
      })
    }
  }

  handleToggleAll = (e: React.FormEvent<HTMLInputElement>, data: CheckboxProps) => {
    this.setState({
      selectedDocumentIds: data.checked ? this.state.automatchedDocs.map(i => i.id) : []
    })
  }

  getToggleAllState = (): SelectionState => {
    const { selectedDocumentIds, automatchedDocs } = this.state

    if (selectedDocumentIds.length === 0) {
      return SelectionState.Unchecked
    }

    return selectedDocumentIds.length === automatchedDocs.length ? SelectionState.Checked : SelectionState.Indeterminate
  }

  renderContent = () => {
    const { allowMultipleSelection } = this.props
    const { selectedDocumentIds, automatchedDocs, countAutomatchedDocs } = this.state

    return (
      <StyledContent>
        <StyledRow>
          <StyledTitle>Automatch</StyledTitle>
          <StyledDocumentCounter data-test-id="automatch-counter-docs">{`[ ${countAutomatchedDocs} ]`}</StyledDocumentCounter>
        </StyledRow>
        <Divider style={{ marginTop: '10px', marginBottom: '10px' }} />
        <StyledRow>
          {allowMultipleSelection ? (
            <ToggleAllCheckbox
              data-test-id={`automatch-radio-toggle-all`}
              checked={this.getToggleAllState() === SelectionState.Checked}
              indeterminate={this.getToggleAllState() === SelectionState.Indeterminate}
              onChange={this.handleToggleAll}
            />
          ) : null}
          <CategoryWithColourTag category={this.props.category} />
        </StyledRow>
        <StyledListDocTypes
          data-test-id="request-documents-list-doctypes"
          className="style-scroll"
          items={automatchedDocs.map(doc => (
            <DocumentListRow id={doc.id} key={doc.id} data-test-id={doc.name}>
              {!allowMultipleSelection ? (
                <Radio
                  data-test-id={`automatch-radio-${doc.name}`}
                  value={doc.id}
                  checked={selectedDocumentIds.includes(doc.id)}
                  onChange={() => this.handleChange(doc.id)}
                />
              ) : (
                <Checkbox
                  data-test-id={`automatch-radio-${doc.name}`}
                  checked={selectedDocumentIds.includes(doc.id)}
                  onChange={() => this.handleChange(doc.id)}
                  value={doc.id}
                />
              )}
              <ListItemBorderLeft categoryId={this.props.category.id} />
              <DocumentListItem
                data-test-id={`automatch-list-${doc.id}`}
                document={doc}
                highlighted={false}
                itemsToDisplay={itemsToDisplay()}
                numColumns={2}
                printExtraActionsMenu={() => (
                  <SpanAsLink
                    data-test-id={`automatch-view-${doc.name}`}
                    onClick={() => this.props.openViewDocument(doc.id)}
                  >
                    View
                  </SpanAsLink>
                )}
              />
            </DocumentListRow>
          ))}
        />
      </StyledContent>
    )
  }

  render() {
    const { onToggleVisible, open } = this.props
    return (
      <React.Fragment>
        <Confirm
          open={open}
          size="large"
          cancelButton="Cancel"
          confirmButton={
            <Button data-test-id="automatch-accept-button" disabled={this.state.selectedDocumentIds.length === 0}>
              Attach document
            </Button>
          }
          header="Select from document library"
          content={this.renderContent()}
          onCancel={() => {
            this.resetSelectedDocumentId()
            onToggleVisible(null)
          }}
          onConfirm={() => this.handleConfirm()}
        />
      </React.Fragment>
    )
  }

  private resetSelectedDocumentId = () => {
    this.setState({ selectedDocumentIds: [] })
  }
}

const itemsToDisplay = () => {
  return [Items.TYPE, Items.UPLOADED_ON, Items.NAME, Items.FORMAT]
}

const StyledDocumentCounter = styled.div`
  &&&&&&& {
    height: 21px;
    width: 78px;
    color: #5d768f;
    font-size: 11px;
    font-weight: 600;
    line-height: 21px;
    padding-left: 13px;
  }
`

const StyledListDocTypes = styled(List)`
  &&&&&&& {
    padding: 10px 20px 0px 0px;
    margin-top: 0px;
    width: -webkit-fill-available;
    height: 258px;
    overflow-y: auto;
  }
`

const StyledRow = styled.div`
  &&&&&& {
    display: flex;
    flex-direction: row;
  }
`

const StyledTitle = styled.div`
  height: 21px;
  width: 71px;
  color: #1c2936;
  font-size: 14px;
  font-weight: 600;
  line-height: 21px;
`

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px 30px 20px 30px;
`

const DocumentListRow = styled.div`
  min-width: 600px;
  min-height: 40px;
  display: grid;
  grid-template-columns: 40px [cbox] 5px [border] auto [list-item];
  align-items: center;
  margin: 8px 0;
`

const ToggleAllCheckbox = styled(Checkbox)`
  margin-right: 21px;
`

export default SelectAutomatchModal
