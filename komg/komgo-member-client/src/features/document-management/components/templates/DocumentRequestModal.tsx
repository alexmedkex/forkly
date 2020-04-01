import * as React from 'react'
import { Modal, Button } from 'semantic-ui-react'

import { DocumentType, Category, Request } from '../../store'

import { groupBy } from '../../../document-management/components/documents/my-documents/toMap'
import { DocumentRequestSummary, DocumentTypesByCategory } from '../../../document-management/components'
import { sortCategories, sortDocumentTypes } from '../../../document-management/utils/sortingHelper'

export type PanelCheckboxState = -1 | 0 | 1

enum NEXT_TEXT {
  'Next',
  'Send Request'
}

enum BACK_TEXT {
  'Cancel',
  'Back'
}
export interface Props {
  visible: boolean
  title: string
  categories: Category[]
  documentTypes: DocumentType[]
  selectedCounterpartyName: string
  selectedCounterpartyId: string
  sentDocumentRequestTypes: Map<string, Set<string>>
  toggleVisible(): void
  onSubmit(documentTypes: DocumentType[]): void
}

interface State {
  step: number
  selectedDocumentTypesByCategory: Map<string, DocumentType[]>
  panelCheckboxState: Map<string, PanelCheckboxState>
}
class DocumentRequestModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      step: 0,
      selectedDocumentTypesByCategory: new Map<string, DocumentType[]>(),
      panelCheckboxState: new Map<string, PanelCheckboxState>()
    }
  }

  render() {
    return (
      <Modal
        open={this.props.visible}
        centered={true}
        onClose={this.props.toggleVisible}
        closeOnDimmerClick={false}
        size="large"
        style={{ top: 'unset' }}
      >
        <Modal.Header>
          {this.state.step === 0 && <Modal.Description as="h2" content={'Document request'} />}
          {this.state.step === 1 && <Modal.Description as="h2" content={'Request summary'} />}
          <Modal.Description as="h4" style={{ marginBlockStart: 0 }} content={this.getSubheaderText()} />
        </Modal.Header>
        <Modal.Content scrolling={true}>{this.switchModalContentByStep(this.state.step)}</Modal.Content>
        <Modal.Actions>
          <Button
            key="btn-back"
            type="default"
            onClick={() => (this.state.step === 0 ? this.resetState() : this.setStep(-1))}
          >
            {BACK_TEXT[this.state.step]}
          </Button>
          <Button
            key="btn-next"
            primary={true}
            onClick={() => (this.state.step === 1 ? this.handleSubmit() : this.setStep(+1))}
            disabled={!this.canProceedToNextStep()}
          >
            {NEXT_TEXT[this.state.step]}
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }

  private canProceedToNextStep() {
    return this.state.selectedDocumentTypesByCategory.size > 0
  }

  private getSubheaderText = () => {
    return `You are requesting ${this.countSelectedDocumentTypes() || 0} document types from  ${
      this.props.selectedCounterpartyName
    }`
  }

  private countSelectedDocumentTypes = () => {
    let selectedDocTypeCount = 0
    this.state.selectedDocumentTypesByCategory.forEach(
      selectedDocTypes => (selectedDocTypeCount += selectedDocTypes.length)
    )
    return selectedDocTypeCount
  }

  /**
   * Clears all selections
   */
  private resetState() {
    this.setState({
      selectedDocumentTypesByCategory: new Map<string, DocumentType[]>(),
      panelCheckboxState: new Map<string, PanelCheckboxState>()
    })

    this.props.toggleVisible()
  }

  private handleSubmit = () => {
    const selectedDocumentTypes = Array.from(this.state.selectedDocumentTypesByCategory.values()).reduce(
      (acc, docTypes) => {
        return [...acc, ...docTypes]
      }
    )

    this.setState(
      {
        step: 0,
        selectedDocumentTypesByCategory: new Map<string, DocumentType[]>(),
        panelCheckboxState: new Map<string, PanelCheckboxState>()
      },
      () => {
        this.props.onSubmit(selectedDocumentTypes)
      }
    )
  }

  private setStep = (to: number) => {
    this.setState({ step: this.state.step + to })
  }

  private switchModalContentByStep = (currentStep = 0) => {
    return {
      0: this.renderDocumentTypesByCategory(),
      1: this.renderDocumentRequestSummary()
    }[currentStep]
  }

  private renderDocumentTypesByCategory = () => {
    return (
      <DocumentTypesByCategory
        categories={sortCategories(this.props.categories)}
        documentTypes={sortDocumentTypes(this.props.documentTypes)}
        selectedDocumentTypesByCategory={this.state.selectedDocumentTypesByCategory}
        panelCheckboxState={this.state.panelCheckboxState}
        onPanelClick={this.onCategoryClick}
        onListItemClick={this.onDocumentTypeClick}
        isSelected={this.isSelected}
        markAsDisabled={this.markAsDisabled}
      />
    )
  }

  private isSelected = (documentType: DocumentType): boolean => {
    const selectedDocTypesWithThisCategory =
      this.state.selectedDocumentTypesByCategory.get(documentType.category.id) || []
    return selectedDocTypesWithThisCategory.findIndex(docType => docType.id === documentType.id) > -1
  }

  private markAsDisabled = (documentTypeName: string): { isDisabled: boolean; disabledText: string } => {
    // check if selected counterparty has sent a given documentTypeName
    const types = this.props.sentDocumentRequestTypes.get(this.props.selectedCounterpartyId)
    if (!types) {
      return {
        isDisabled: false,
        disabledText: ''
      }
    }
    return {
      isDisabled: types.has(documentTypeName),
      disabledText: 'Already submitted'
    }
  }

  private onDocumentTypeClick = (toggledDocumenType: DocumentType) => {
    const { selectedDocumentTypesByCategory, panelCheckboxState } = this.state
    let categoryEntry = this.state.selectedDocumentTypesByCategory.get(toggledDocumenType.category.id)

    // There was no documentTypes of this category selected -> the documentTypes was not selected.
    // Toggle the documentTypes as selected and setState.
    if (!categoryEntry) {
      selectedDocumentTypesByCategory.set(toggledDocumenType.category.id, [toggledDocumenType])
      const cboxState = this.getPanelCheckboxState(toggledDocumenType.category)
      panelCheckboxState.set(toggledDocumenType.category.id, cboxState)

      this.setState({
        selectedDocumentTypesByCategory,
        panelCheckboxState
      })
    }

    categoryEntry = categoryEntry || []

    // One or more documentTypes of this type are selected -> unclear whether this doc was selected
    const foundIndex = categoryEntry!.findIndex(docType => docType.id === toggledDocumenType.id)
    const wasSelected = foundIndex > -1

    if (wasSelected) {
      categoryEntry!.splice(foundIndex, 1)
      selectedDocumentTypesByCategory.set(toggledDocumenType.category.id, categoryEntry)
    } else {
      selectedDocumentTypesByCategory.set(toggledDocumenType.category.id, [...categoryEntry!, toggledDocumenType])
    }

    // In all cases we can't know whether the document-type is checked, indeterminate or not checked.
    // Have to check all documents, but at least only for this type.
    const checkboxState = this.getPanelCheckboxState(toggledDocumenType.category)
    panelCheckboxState.set(toggledDocumenType.category.id, checkboxState)

    this.setState({
      selectedDocumentTypesByCategory,
      panelCheckboxState
    })
  }

  private onCategoryClick = (toggledCategory: Category) => {
    const { selectedDocumentTypesByCategory, panelCheckboxState } = this.state
    const wasSelected = selectedDocumentTypesByCategory.get(toggledCategory.id)

    if (wasSelected) {
      selectedDocumentTypesByCategory.delete(toggledCategory.id)
      panelCheckboxState.set(toggledCategory.id, -1)
    } else {
      const documentTypesForThisCategory =
        groupBy(this.props.documentTypes, (docType: DocumentType) => docType.category.id).get(toggledCategory.id) || []
      selectedDocumentTypesByCategory.set(toggledCategory.id, documentTypesForThisCategory)
      panelCheckboxState.set(toggledCategory.id, 1)
    }

    this.setState({
      selectedDocumentTypesByCategory,
      panelCheckboxState
    })
  }

  /*
    -1 -> unselected
    0 -> indeterminate
    1 -> selected
  */
  private getPanelCheckboxState = (category: Category): PanelCheckboxState => {
    const documentTypesForThisCategory = groupBy(
      this.props.documentTypes,
      (docType: DocumentType) => docType.category.id
    ).get(category.id)
    const selectedDocumentTypesOfThisCategory = this.state.selectedDocumentTypesByCategory.get(category.id)

    if (!documentTypesForThisCategory) {
      throw new Error('Could not find type for document')
    }

    if (!selectedDocumentTypesOfThisCategory || selectedDocumentTypesOfThisCategory.length === 0) {
      return -1
    }

    if (documentTypesForThisCategory.length > selectedDocumentTypesOfThisCategory.length) {
      return 0
    }

    return 1
  }

  private renderDocumentRequestSummary = () => {
    return (
      <DocumentRequestSummary
        selectedCounterpartyName={this.props.selectedCounterpartyName}
        selectedModalDocumentTypes={this.props.documentTypes.filter(this.isSelected)}
      />
    )
  }
}

export default DocumentRequestModal
