import * as React from 'react'
import { Header, Grid, SearchProps, Button, Container } from 'semantic-ui-react'
import styled from 'styled-components'

import { CustomSearch } from '../../../../components'

import DocumentActionsButtonGroup from '../../components/documents/DocumentActionsButtonGroup'
import {
  Category,
  DocumentType,
  Document,
  DocumentsFilters,
  DocumentListFilter,
  CounterpartyDocumentFilter
} from '../../store'
import { Counterparty } from '../../../counterparties/store/types'
import { CounterpartyDocsFilter } from '../filter/CounterpartyDocsFilter'
import { DocumentFilter } from '../filter/DocumentFilter'
import { User } from '../../../../store/common/types'

export const StyledGrid = styled(Grid)`
  &&& {
    margin-bottom: 15px;
  }
`

export interface PageHeaderProps {
  pageName: string
  isLoading?: boolean
  searchValue?: string
  disabledSearch: boolean
  handleSearch(event: React.MouseEvent<HTMLElement>, data: SearchProps): void
}

export const PageHeader: React.SFC<PageHeaderProps> = (props: PageHeaderProps) => {
  return (
    <StyledGrid>
      <Grid.Column width={8}>
        <Header as="h1" content={props.pageName} />
      </Grid.Column>
      <Grid.Column width={8} textAlign="right">
        <CustomSearch
          value={props.searchValue}
          handleSearch={props.handleSearch}
          isLoading={props.isLoading}
          disabled={false}
        />
      </Grid.Column>
    </StyledGrid>
  )
}

export interface LOCDocsHeaderProps extends PageHeaderProps {
  renderHeaderButton(): JSX.Element
}

export const LOCDocsHeader = (props: LOCDocsHeaderProps) => {
  return (
    <StyledGrid>
      <Grid.Column width={8}>
        <Header as="h1" content={props.pageName} />
      </Grid.Column>
      <Grid.Column width={8} textAlign="right">
        <CustomSearch handleSearch={props.handleSearch} isLoading={props.isLoading} disabled={false} />
        {props.renderHeaderButton()}
      </Grid.Column>
    </StyledGrid>
  )
}

export interface DocumentListPageHeaderProps extends PageHeaderProps {
  counterparties: Counterparty[]
  categories: Category[]
  types: DocumentType[]
  isLoading: boolean
  selectedDocuments: Document[]
  filters: DocumentsFilters
  userCanCrudAndShareDocs: boolean
  filter: DocumentListFilter
  handleSearch(event: React.MouseEvent<HTMLElement>, data: SearchProps): void
  toggleShareDocumentModal(): void
  toggleAddDocumentModal(): void
  toggleAddDocumentTypeModal(): void
  downloadSelectedDocuments(documents: Document[]): void
  changeDocumentsFilter(filter: string, value: string): void
  onFilterApplied(filter: DocumentListFilter): void
}
export const DocumentListPageHeader: React.SFC<DocumentListPageHeaderProps> = (props: DocumentListPageHeaderProps) => {
  const { pageName, selectedDocuments, downloadSelectedDocuments, handleSearch, isLoading } = props
  return (
    <StyledGrid className="doc-filter centered-options">
      <Grid.Column width={8}>
        <Header as="h1" content={pageName} />
        <DocumentFilter
          counterparties={props.counterparties}
          categories={props.categories}
          types={props.types}
          onChange={props.onFilterApplied}
          filter={props.filter}
          disabled={props.disabledSearch}
        />
      </Grid.Column>
      <Grid.Column width={8} textAlign="right">
        <CustomSearch
          value={props.filters.search}
          handleSearch={handleSearch}
          isLoading={isLoading}
          disabled={props.disabledSearch}
        />
        {props.userCanCrudAndShareDocs && (
          <Button primary={true} onClick={props.toggleAddDocumentModal}>
            Add document
          </Button>
        )}
        <Container>
          <DocumentActionsButtonGroup
            userCanCrudAndShareDocs={props.userCanCrudAndShareDocs}
            visible={selectedDocuments.length > 0}
            toggleShareDocumentModalVisible={props.toggleShareDocumentModal}
            downloadSelectedDocuments={() => downloadSelectedDocuments(selectedDocuments)}
          />
        </Container>
      </Grid.Column>
    </StyledGrid>
  )
}

export interface CounterpartyDocsHeaderProps extends PageHeaderProps {
  isLoading: boolean
  selectedDocuments: Document[]
  filters: DocumentsFilters
  filter: CounterpartyDocumentFilter
  types: DocumentType[]
  categories: Category[]
  users: User[]
  userCanCreateRequest: boolean
  handleSearch(event: React.MouseEvent<HTMLElement>, data: SearchProps): void
  toggleNewDocumentRequestModal(): void
  toggleLoadDocumentRequestTemplateModal(): void
  downloadSelectedDocuments(documents: Document[]): void
  changeDocumentsFilter(filter: string, value: string): void
  onFilterApplied(filter: CounterpartyDocumentFilter): void
}
export const CounterpartyDocsHeader = (props: CounterpartyDocsHeaderProps) => {
  return (
    <StyledGrid className="doc-filter centered-options">
      <Grid.Column width={8}>
        <Header as="h1" content={props.pageName} />
        <CounterpartyDocsFilter
          types={props.types}
          categories={props.categories}
          users={props.users}
          filter={props.filter}
          disabled={props.disabledSearch}
          onChange={props.onFilterApplied}
        />
      </Grid.Column>
      <Grid.Column width={8} style={{ textAlign: 'right' }}>
        <CustomSearch
          value={props.filters.search}
          handleSearch={props.handleSearch}
          isLoading={props.isLoading}
          disabled={props.disabledSearch}
        />
        {/* Commented since eventually we could need the dropdown to deal with templates 
        <NewRequestButtonGroup
          userCanCreateRequest={props.userCanCreateRequest}
          toggleNewDocumentRequestModal={props.toggleNewDocumentRequestModal}
          toggleLoadDocumentRequestTemplateModal={props.toggleLoadDocumentRequestTemplateModal}
        /> */}
        {props.userCanCreateRequest && (
          <Button primary={true} onClick={props.toggleNewDocumentRequestModal}>
            Request documents
          </Button>
        )}
        <DocumentActionsButtonGroup
          visible={props.selectedDocuments.length > 0}
          counterparty={true}
          downloadSelectedDocuments={() => props.downloadSelectedDocuments(props.selectedDocuments)}
        />
      </Grid.Column>
    </StyledGrid>
  )
}
