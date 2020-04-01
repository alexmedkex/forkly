import React, { Component, ReactElement } from 'react'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { intersection, concat } from 'lodash'

import { LoadingTransition } from '../../../components'
import { InfoPosition } from '../../../components/topbar/Topbar'
import { withLoaders, WithLoaderProps } from '../../../components/with-loaders'
import { ApplicationState } from '../../../store/reducers'

import TradeDocumentsList from '../components/TradeDocumentsList'
import TradeDocumentsHeader from '../components/TradeDocumentsHeader'
import AddDocumentButton from '../components/AddDocumentButton'
import { StyledButton, StyledSpan } from '../components/TradeDocumentsStyles'
import { TemplateLayout } from '../../templates/components/TemplateLayout'
import {
  fetchTradeDocumentsAsync,
  setDocumentListFilter,
  createTradeDocumentAsync
} from '../../document-management/store/documents/actions'
import {
  Document,
  DocumentActionType,
  Category,
  DocumentType,
  ProductId,
  CreateDocumentRequest,
  DocumentListFilter,
  SharedWith
} from '../../document-management'
import { Counterparty } from '../../counterparties/store/types'
import { fetchConnectedCounterpartiesAsync } from '../../counterparties/store/actions'
import { fetchCategoriesAsync } from '../../document-management/store/categories/actions'
import { fetchDocumentTypesAsync } from '../../document-management/store/document-types/actions'

export const DEFAULT_PRODUCT_ID = 'tradeFinance'

interface StateProps {
  documents: Document[]
  categories: Category[]
  documentTypes: DocumentType[]
  counterparties: Counterparty[]
  documentListFilter: DocumentListFilter
}

interface DispatchProps {
  fetchTradeDocumentsAsync(): void
  fetchCategoriesAsync(productId: ProductId): void
  fetchDocumentTypesAsync(productId: ProductId): void
  createTradeDocumentAsync(createDocumentRequest: CreateDocumentRequest): void
  fetchConnectedCounterpartiesAsync(): void
  setDocumentListFilter(filter: DocumentListFilter): void
}

export type Props = StateProps & DispatchProps & WithLoaderProps

export class TradeDocuments extends Component<Props> {
  private static buildSelected(): ReactElement {
    return <StyledSpan>no document selected</StyledSpan>
  }

  private static buildDetails(): ReactElement {
    return <StyledButton icon="left chevron" content="Details" />
  }

  componentDidMount(): void {
    this.props.fetchTradeDocumentsAsync()
    this.props.fetchCategoriesAsync(DEFAULT_PRODUCT_ID)
    this.props.fetchDocumentTypesAsync(DEFAULT_PRODUCT_ID)
    this.props.fetchConnectedCounterpartiesAsync()
  }

  checkCounterparty = (counterparties: string[], document: Document) => {
    const sharedWith = document.sharedWith.map((shared: SharedWith) => shared.counterpartyId)

    return !!intersection(counterparties, concat(sharedWith, document.sharedBy)).length
  }

  getDocuments = () => {
    const { documents, documentListFilter } = this.props
    const { type = [], counterparties = [] } = documentListFilter || {}

    if (type.length || counterparties.length) {
      return documents.filter(
        (document: Document) => type.includes(document.type.id) || this.checkCounterparty(counterparties, document)
      )
    }
    return documents
  }

  render(): JSX.Element {
    const { isFetching, documents, categories, counterparties, documentTypes } = this.props

    return (
      <TemplateLayout
        title="Trade document library"
        withPadding={true}
        actions={[
          <AddDocumentButton
            key="addDocumentButton"
            onSubmit={this.handleSubmit}
            documents={documents}
            categories={categories}
            documentTypes={documentTypes}
          />
        ]}
        infos={[TradeDocuments.buildSelected(), TradeDocuments.buildDetails()]}
        infoPosition={InfoPosition.SpaceBetween}
      >
        {isFetching ? (
          <LoadingTransition />
        ) : (
          <>
            <TradeDocumentsHeader
              types={documentTypes}
              categories={categories}
              counterparties={counterparties}
              onFilterChange={this.handleFilterChange}
            />
            <TradeDocumentsList documents={this.getDocuments()} />
          </>
        )}
      </TemplateLayout>
    )
  }

  private handleSubmit = (createDocumentRequest: CreateDocumentRequest) => {
    this.props.createTradeDocumentAsync(createDocumentRequest)
  }

  private handleFilterChange = (filter?: DocumentListFilter) => {
    this.props.setDocumentListFilter(filter)
  }
}

const mapStateToProps = (state: ApplicationState): StateProps => ({
  documents: state.get('documents').get('allDocuments'),
  categories: state.get('categories').get('categories'),
  documentTypes: state.get('documentTypes').get('documentTypes'),
  counterparties: state.get('counterparties').get('counterparties'),
  documentListFilter: state.get('documents').get('documentListFilter')
})

const mapDispatchToProps: DispatchProps = {
  fetchTradeDocumentsAsync,
  fetchCategoriesAsync,
  fetchDocumentTypesAsync,
  createTradeDocumentAsync,
  fetchConnectedCounterpartiesAsync,
  setDocumentListFilter
}

export default compose(
  withLoaders({
    actions: [DocumentActionType.FETCH_DOCUMENTS_REQUEST]
  }),
  connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)
)(TradeDocuments)
