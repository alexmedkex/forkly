import * as React from 'react'
import styled from 'styled-components'

import { Accordion, List, Divider } from 'semantic-ui-react'

import { DropdownOption } from '../my-documents/DocumentListDropdownOptions'
import { Category, Document } from '../../../store/types'
import { OurDocumentsPanelItem } from '../document-library/OurDocumentsPanelItem'
import { OurDocumentsListItem } from '../document-library/OurDocumentsListItem'
import { DocumentListItem } from './DocumentListItem'
import CounterpartyDocumentListItem from './CounterpartyDocumentListItem'
import { sortCategories, sortDocumentsByDocumentTypes } from '../../../utils/sortingHelper'
import withBottomSheet from '../../../../../features/bottom-sheet/hoc/withBottomSheet'
import { compose } from 'redux'

export interface Props {
  context: string
  categoriesById: Map<string, Category[]>
  documentsByCategoryId: Map<string, Document[]>
  highlightedDocumentId: string | null
  selectedDocuments: string[]
  visible: boolean // From the bottomsheet
  getCategoryDocumentCount(docs: Document[]): number
  renderEllipsisMenu(document: Document): React.ReactNode
  getUserNameFromDocumentUploaderId(idUser: string): string
  getViewDocumentOption(doc: Document): DropdownOption
  getDownloadDocumentOption(doc: Document): DropdownOption
  clearHighlightedDocumentId(): void
  handleDocumentSelect(document: Document): void
  bulkSelectDocuments(...documentIds: string[]): void
}

interface State {
  activePanels: Map<string, boolean>
  selectedCategories: Map<string, boolean>
  highlightedDocumentId: string | null
}

interface FooterProps {
  showfooter: number
}

class OurDocumentsLibrary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      activePanels: new Map<string, boolean>(),
      selectedCategories: new Map<string, boolean>(),
      highlightedDocumentId: null
    }
  }

  componentDidMount() {
    this.scrollToHighlightedDocument()
  }

  componentDidUpdate() {
    this.scrollToHighlightedDocument()
  }

  render() {
    const categoriesWithDocuments: Category[] = Array.from(this.props.documentsByCategoryId.keys()).reduce(
      (acc, catId) => [...acc, ...(this.props.categoriesById.get(catId) || [])],
      []
    )
    const sortedCategories = sortCategories(categoriesWithDocuments)
    return (
      <StyledAccordion
        showfooter={this.props.visible ? 1 : 0}
        data-test-id={'accordionlist-accordion'}
        exclusive={false}
        fluid={true}
        styled={false}
        panels={sortedCategories.map(this.categoryToPanel)}
      />
    )
  }

  private categoryToPanel = (cat: Category) => {
    return {
      key: `panel-${cat.id}`,
      name: cat.name,
      active: this.panelIsActive(cat),
      title: this.categoryToPanelTitle(cat),
      content: { content: this.categoryDocumentsToList(cat.id) }
    }
  }

  private categoryToPanelTitle = (cat: Category) => {
    const active = this.panelIsActive(cat)
    return (
      <Accordion.Title key={`panel-title-${cat.id}`} name={cat.name} style={{ padding: 0 }}>
        <OurDocumentsPanelItem
          active={active}
          category={cat}
          documentCount={getCategoryDocumentCount(this.props.documentsByCategoryId.get(cat.id))}
          handleCategorySelect={this.handleCategorySelect}
          checked={this.getPanelCheckboxState(cat.id) === PanelCheckedState.CHECKED}
          indeterminate={this.getPanelCheckboxState(cat.id) === PanelCheckedState.INDETERMINATE}
          onTitleClick={() => this.togglePanelActive(cat.id)}
        />
        {!active && <Divider style={{ margin: 0 }} />}
      </Accordion.Title>
    )
  }

  private getItemRenderer = () => {
    const { context } = this.props
    switch (context) {
      case 'document-library':
        return DocumentListItem
      case 'counterparty-library':
        return CounterpartyDocumentListItem
    }
  }

  private categoryDocumentsToList = (categoryId: string) => {
    const categoryDocuments = this.props.documentsByCategoryId.get(categoryId) || []
    const sortedCategoryDocuments = sortDocumentsByDocumentTypes(categoryDocuments)
    return (
      <Accordion.Content key={`panel-content-${categoryId}`}>
        <UnpaddedList key={`list-for-${categoryId}`} items={this.documentsToListItems(sortedCategoryDocuments)} />
        <Divider />
      </Accordion.Content>
    )
  }

  private documentsToListItems = (documents: Document[]) => {
    return documents.map(doc => {
      return (
        <OurDocumentsListItem
          key={doc.id}
          document={doc}
          highlighted={doc.id === this.props.highlightedDocumentId}
          selected={new Set(this.props.selectedDocuments).has(doc.id)}
          viewDocumentOption={this.props.getViewDocumentOption(doc)}
          downloadDocumentOption={this.props.getDownloadDocumentOption(doc)}
          renderEllipsisMenu={this.props.renderEllipsisMenu}
          ItemRenderer={this.getItemRenderer()}
          handleDocumentSelect={this.props.handleDocumentSelect}
          getUserNameFromDocumentUploaderId={this.props.getUserNameFromDocumentUploaderId}
        />
      )
    })
  }

  private handleCategorySelect = (categoryId: string) => {
    const categoryIsSelected = this.state.selectedCategories.get(categoryId)
    const categoryDocumentIds = this.props.documentsByCategoryId.get(categoryId).map(doc => doc.id)

    if (categoryIsSelected) {
      // Unselect all selected documents within this category
      this.props.bulkSelectDocuments(...categoryDocumentIds.filter(this.isSelected))
    } else {
      // Select all un-selected documents within this category
      this.props.bulkSelectDocuments(...categoryDocumentIds.filter(id => !this.isSelected(id)))
    }

    // Finally toggle category cbox checked or not.
    this.setState({ selectedCategories: this.state.selectedCategories.set(categoryId, !categoryIsSelected) })
  }

  private togglePanelActive = categoryId => {
    if (this.props.clearHighlightedDocumentId) {
      this.props.clearHighlightedDocumentId()
    }
    this.setState({
      activePanels: this.state.activePanels.set(categoryId, !this.state.activePanels.get(categoryId))
    })
  }

  private getPanelCheckboxState = (categoryId: string) => {
    const categoryDocumentIds = this.getDocumentIdsForCategory(categoryId)
    const selectedCount = categoryDocumentIds.filter(this.isSelected).length
    if (selectedCount === categoryDocumentIds.length) {
      return PanelCheckedState.CHECKED
    } else if (selectedCount === 0) {
      return PanelCheckedState.UNCHECKED
    }
    return PanelCheckedState.INDETERMINATE
  }

  private isSelected = (documentId: string) => {
    const selectedSet = new Set(this.props.selectedDocuments)
    return selectedSet.has(documentId)
  }

  private scrollToHighlightedDocument = () => {
    const { highlightedDocumentId } = this.props
    if (highlightedDocumentId) {
      const el = document.getElementById(highlightedDocumentId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  private panelIsActive = (cat: Category) =>
    !!(this.categoryContainsDocument(cat.id, this.props.highlightedDocumentId) || this.state.activePanels.get(cat.id))

  private categoryContainsDocument = (categoryId: string, documentId: string) =>
    new Set(this.getDocumentIdsForCategory(categoryId)).has(documentId)

  private getDocumentIdsForCategory = (categoryId: string) =>
    (this.props.documentsByCategoryId.get(categoryId) || []).map(doc => doc.id)
}

enum PanelCheckedState {
  UNCHECKED = 0,
  CHECKED = 1,
  INDETERMINATE = 2
}

const getCategoryDocumentCount = (docs: Document[] = []) => docs.length

const UnpaddedList = styled(List)`
  && {
    padding: 0;
  }
`

const StyledAccordion = styled(Accordion)`
  &&&&&&& {
    padding-bottom: ${(props: FooterProps) => (props.showfooter ? '100px;' : '0px;')};
  }
`

export default compose<any>(withBottomSheet)(OurDocumentsLibrary)
