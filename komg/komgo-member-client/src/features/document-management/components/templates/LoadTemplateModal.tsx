import * as React from 'react'
import { Button, Modal, Table } from 'semantic-ui-react'
import { DocumentType, Category, Template } from '../../store'

import SelectableRow from './SelectableRow'
import SearchComponent from '../search/SearchComponent'
import { DocumentRequestSummary, DocumentTypesByCategory } from '../../../document-management/components'
import { groupBy } from '../../../document-management/components/documents/my-documents/toMap'

export type PanelCheckboxState = -1 | 0 | 1
interface Props {
  visible: boolean
  title: string
  templates: Template[]
  categories: Category[]
  documentTypes: DocumentType[]
  selectedCounterpartyName: string
  selectedCounterpartyId: string
  sentDocumentRequestTypes: Map<string, Set<string>>
  toggleVisible(): void
  onSubmit(documentTypes: DocumentType[]): void
}

interface State {
  activeRow: any[]
  isLoading: boolean
  value: string
  results: Template[]
  step: number
  selectedDocumentTypesByCategory: Map<string, DocumentType[]>
  panelCheckboxState: Map<string, PanelCheckboxState>
}

class LoadTemplateModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      activeRow: [],
      isLoading: false,
      value: '',
      results: this.props.templates,
      step: 0,
      selectedDocumentTypesByCategory: new Map<string, DocumentType[]>(),
      panelCheckboxState: new Map<string, PanelCheckboxState>()
    }
  }

  componentWillMount() {
    this.resetComponent()
  }

  resetComponent = () => this.setState({ isLoading: false, step: 0, results: this.props.templates, value: '' })

  isTemplate(template: Template | undefined): template is Template {
    return true
  }

  handleSelect(template: Template) {
    // ensure when we select a template, we clear previous selection
    this.state.selectedDocumentTypesByCategory.clear()

    // iterate each type in the template and organized them in category -> [type1, ...typeN]
    template.types.forEach(documentType => {
      // skip documents requests already sent
      const sentDocumentRequests: Set<string> =
        this.props.sentDocumentRequestTypes.get(this.props.selectedCounterpartyId) || new Set()
      if (sentDocumentRequests.has(documentType.name)) {
        return
      }

      let documentTypesByCategory = this.state.selectedDocumentTypesByCategory.get(documentType.category.id)
      // initialize typesByCategory when necessary
      if (!documentTypesByCategory) {
        documentTypesByCategory = []
        this.state.selectedDocumentTypesByCategory.set(documentType.category.id, documentTypesByCategory)
      }
      // add current type to category
      documentTypesByCategory.push(documentType)

      // ensure panel is also updated
      const checkboxState = this.getPanelCheckboxState(documentType.category)
      this.state.panelCheckboxState.set(documentType.category.id, checkboxState)
    })
  }

  onRowClick = (id: any, e: any) => {
    const { activeRow, results } = this.state
    const nextRow: any = {
      [id]: !activeRow[id]
    }
    this.setState({ activeRow: nextRow })

    const selectedTemplate: Template | undefined = results.find(x => x.id === id)

    if (this.isTemplate(selectedTemplate)) {
      this.handleSelect(selectedTemplate)
    }
  }

  render() {
    return (
      <Modal width={'75%'} open={this.props.visible} centered={true} onClose={this.props.toggleVisible}>
        <Modal.Header>{this.props.title}</Modal.Header>
        <Modal.Content>
          {this.switchModalContentByStep(this.state.step)}
          <br />
        </Modal.Content>
        <Modal.Actions>
          <Button
            key="btn-back"
            type="default"
            onClick={() => (this.state.step === 0 ? this.props.toggleVisible() : this.setStep(-1))}
          >
            {this.state.step === 0 ? 'Cancel' : 'Back'}
          </Button>
          <Button
            key="btn-next"
            primary={true}
            onClick={() => (this.state.step > 1 ? this.handleSubmit() : this.setStep(+1))}
            disabled={!this.canProceedToNextStep()}
          >
            {this.state.step > 0 ? (this.state.step > 1 ? 'Submit' : 'Next') : 'Load'}
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }

  private canProceedToNextStep() {
    // on "Load Templates" screen
    if (this.state.step === 0) {
      // allow going to the next step/screen if at least 1 template is selected
      if (Object.keys(this.state.activeRow).length > 0) {
        return true
      }
    }

    // on "Select document request types" screen
    if (this.state.step >= 1) {
      // allow going to the next step/screen if at least 1 document type is selected
      if (this.state.selectedDocumentTypesByCategory.size > 0) {
        return true
      }
    }

    // all conditions to proceed to next step/screen failed
    return false
  }

  private setStep = (to: number) => {
    this.setState({ step: this.state.step + to })
  }

  private switchModalContentByStep = (currentStep = 0) => {
    return {
      0: this.renderLoadTemplates(),
      1: this.renderDocumentTypesByCategory(),
      2: this.renderDocumentRequestSummary()
    }[currentStep]
  }

  private renderDocumentTypesByCategory = () => {
    return (
      <DocumentTypesByCategory
        categories={this.props.categories}
        documentTypes={this.props.documentTypes}
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

  private renderLoadTemplates() {
    const { activeRow } = this.state
    // Check to update the results attribute on state to default to all available templates on loading component
    if (this.props.templates.length > 0 && this.state.results.length === 0) {
      this.setState({ results: this.props.templates })
    }

    return [
      <SearchComponent
        handleSearch={(results: Template[]) => this.setState({ results })}
        dataPoints={this.props.templates}
        key={'template-search'}
      />,
      <Table selectable={true} key={'template-table'}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Template Name</Table.HeaderCell>
            <Table.HeaderCell>Type</Table.HeaderCell>
            <Table.HeaderCell>Documents</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {this.state.results.map(u => {
            const isActive = activeRow[u.id]
            return <SelectableRow active={isActive} key={u.id} rowId={u.id} template={u} onClick={this.onRowClick} />
          })}
        </Table.Body>
      </Table>
    ]
  }

  private renderDocumentRequestSummary = () => {
    return (
      <DocumentRequestSummary
        selectedModalDocumentTypes={this.props.documentTypes.filter(this.isSelected)}
        selectedCounterpartyName={this.props.selectedCounterpartyName}
      />
    )
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
}

export default LoadTemplateModal
