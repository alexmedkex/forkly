import * as React from 'react'
import { compose } from 'redux'
import { debounce } from 'lodash'
import { withRouter, matchPath } from 'react-router-dom'
import Helmet from 'react-helmet'
import { kyc } from '@komgo/permissions'
import { connect } from 'react-redux'
import { ApplicationState } from '../../../store/reducers'
import { productKYC } from '@komgo/products'

import {
  withPermissions,
  Unauthorized,
  WithPermissionsProps,
  LoadingTransition,
  withLicenseCheck,
  WithLicenseCheckProps
} from '../../../components'

import ModalsContainer from './ModalsContainer'

import {
  withProducts,
  withCategories,
  withDocument,
  withDocumentTypes,
  withDocuments,
  withTemplates,
  withModalsState,
  withRequests,
  withUsersById
} from '../hoc'
import DocumentsByCategoryList from '../components/documents/my-documents/DocumentsByCategoryList'
import { DocumentListPageHeader } from '../components/page-header'
import { withCounterparties } from '../../counterparties/hoc'
import { Counterparty } from '../../counterparties/store/types'
import {
  DOWNLOAD,
  DOWNLOAD_ALL,
  DropdownOption,
  SHARE,
  SHARE_ALL,
  VIEW,
  DELETE
} from '../components/documents/my-documents/DocumentListDropdownOptions'
import { RouteComponentProps } from 'react-router-dom'
import * as _ from 'lodash'
import {
  Category,
  Document,
  DocumentType,
  Template,
  ProductId,
  ModalName,
  FILTERS_NAME,
  DocumentListFilter
} from '../store/types'
import { getSelectedDocuments, filterOwnDocumentList } from '../utils/selectors'
import { downloadSelectedDocuments } from '../utils/downloadDocument'
import { User } from '../../../store/common/types'
import { isFilterApplied } from '../utils/filtersHelper'
import EmptyDocumentLibrary from '../components/messages/EmptyDocumentLibrary'
import { isEmptyLibrary } from '../utils/selectors'
import { getLastLocation } from '../../../store/history'
import { WithDocumentsProps } from '../hoc/withDocuments'

type EntityType = 'templates' | 'docTypes' | 'documents'

export interface WithDocumentManagementProps extends WithDocumentsProps, RouteComponentProps<{}> {
  history: any
  templates: Template[]
  categories: Category[]
  documentTypes: DocumentType[]
  isLoading: boolean
  counterparties: Counterparty[]
  isLoadingDocumentTypes: boolean
  user: User
  usersById: Map<string, User[]>
  fetchProductsAsync(): void
  fetchCategoriesAsync(productId: ProductId): void
  fetchDocumentTypesAsync(productId: ProductId, categoryId?: string): void
  fetchTemplatesAsync(productId: ProductId): void
  fetchRequestsAsync(productId: ProductId): void
  fetchConnectedCounterpartiesAsync(): void
  selectDocument(documentId: string): void
  selectDocumentType(documentTypeId: string): void
  toggleModalVisible(modalName: ModalName): void
  resetLoadedDocument(): void
  fetchUsersAsync(): void
}

export interface IProps extends WithPermissionsProps, WithLicenseCheckProps, WithDocumentManagementProps {
  entity: EntityType
  selectedCategoryId: string
}

const DEFAULT_PRODUCT_ID = 'kyc'
const LIBRARY_TITLE = 'Our document library'

export class DocumentManagementContainer extends React.Component<IProps> {
  private searchDocuments: (productId: ProductId, searchValue: string, sharedBy: string) => void

  constructor(props: IProps) {
    super(props)

    this.componentForEmptyDocumentLibrary = this.componentForEmptyDocumentLibrary.bind(this)
    this.searchDocuments = debounce(props.searchDocumentsAsync, 300)
  }

  public componentDidMount() {
    this.props.fetchProductsAsync()
    this.props.fetchCategoriesAsync(DEFAULT_PRODUCT_ID)
    this.props.fetchDocumentTypesAsync(DEFAULT_PRODUCT_ID)
    this.props.fetchTemplatesAsync(DEFAULT_PRODUCT_ID)
    this.props.fetchRequestsAsync(DEFAULT_PRODUCT_ID)
    this.props.fetchDocumentsAsync(DEFAULT_PRODUCT_ID, 'none')
    this.props.fetchConnectedCounterpartiesAsync()
    this.props.fetchUsersAsync()
    // reset search box + results only if previous location
    // was NOT view document
    const lastLocation = getLastLocation() || { pathname: undefined }
    const shouldReset = !matchPath(lastLocation.pathname, {
      path: '/documents/:id',
      exact: true,
      strict: false
    })
    if (shouldReset) {
      this.props.resetDocumentsSelectData()
    }
    this.props.resetLoadedDocument()
  }

  renderDocumentDropdownActions = (document: Document): DropdownOption[] => {
    const { download, view, remove, share } = this.getOptions(document)

    const options: DropdownOption[] = [share, view, download, remove]

    return options.filter(option => option)
  }

  renderDocumentTypeDropdownActions = (documentType: DocumentType): DropdownOption[] => {
    const handleClickSingleDocumentType = (documentType: DocumentType, toggleModal: () => void) => {
      this.props.resetDocumentsSelectData()
      this.handleSelectDocumentType(documentType)
      toggleModal()
    }

    const documentTypeDocuments = this.props.documentsGroupByType.get(documentType.id) || []

    const download: DropdownOption = {
      ...DOWNLOAD_ALL,
      onClick: () => downloadSelectedDocuments(this.props.downloadDocumentsAsync)(documentTypeDocuments)
    }

    const share: DropdownOption = {
      ...SHARE_ALL,
      onClick: () => handleClickSingleDocumentType(documentType, this.toggleShareDocumentModal)
    }

    if (!this.props.isAuthorized(kyc.canCrudAndShareDocs)) {
      return Object.values({ download })
    } else {
      return Object.values({ download, share })
    }
  }

  /* tslint:disable: cyclomatic-complexity*/
  render() {
    const { categories, documentTypes, isAuthorized, isLicenseEnabled } = this.props

    if (
      !isLicenseEnabled(productKYC) ||
      (!isAuthorized(kyc.canReadDocs) && !isAuthorized(kyc.canCrudAndShareDocs) && !isAuthorized(kyc.canReviewDocs))
    ) {
      return <Unauthorized />
    }

    if (this.props.isLoadingDocuments || this.props.isLoadingDocumentTypes) {
      return <LoadingTransition title="Loading documents" />
    }

    const areDocsFiltered = isFilterApplied(this.props.documentListFilter, this.props.filters)

    return (
      <React.Fragment>
        <Helmet>
          <title>{LIBRARY_TITLE}</title>
        </Helmet>
        <DocumentListPageHeader
          pageName={LIBRARY_TITLE}
          isLoading={this.props.isLoading}
          categories={this.props.categories}
          types={documentTypes}
          counterparties={this.props.counterparties}
          filters={this.props.filters}
          filter={this.props.documentListFilter}
          onFilterApplied={this.filterApplied}
          userCanCrudAndShareDocs={isAuthorized(kyc.canCrudAndShareDocs)}
          selectedDocuments={getSelectedDocuments(
            this.props.documentsGroupByType.get('all') || [],
            this.props.selectedDocuments
          )}
          changeDocumentsFilter={this.props.changeDocumentsFilter}
          handleSearch={this.handleSearchChange}
          toggleShareDocumentModal={this.toggleShareDocumentModal}
          toggleAddDocumentModal={() => this.props.toggleModalVisible('addDocument')}
          toggleAddDocumentTypeModal={() => this.props.toggleModalVisible('addDocumentType')}
          downloadSelectedDocuments={downloadSelectedDocuments(this.props.downloadDocumentsAsync)}
          disabledSearch={!areDocsFiltered && isEmptyLibrary(this.props.documentsGroupByType)}
        />

        <ModalsContainer />
        <DocumentsByCategoryList
          context="document-library"
          categories={[{ id: 'all', name: 'All', product: { id: 'kyc', name: 'KYC ' } }, ...categories]}
          documentTypes={documentTypes}
          documents={this.props.allVisibleDocuments}
          selectedDocuments={this.props.selectedDocuments}
          handleSelectDocument={this.handleSelectDocument}
          bulkSelectDocuments={this.props.bulkSelectDocuments}
          handleSelectDocumentType={this.handleSelectDocumentType}
          componentInCaseNoDocuments={this.componentForEmptyDocumentLibrary}
          documentsGroupByType={this.props.documentsGroupByType}
          renderDocumentDropdownActions={this.renderDocumentDropdownActions}
          renderDocumentTypeDropdownActions={this.renderDocumentTypeDropdownActions}
          isFiltered={isFilterApplied(this.props.documentListFilter, this.props.filters)}
          historyLocation={this.props.history.location}
          clearHighlightedDocumentId={this.clearHighlightedDocumentId}
          usersById={this.props.usersById}
        />
      </React.Fragment>
    )
  }

  private clearHighlightedDocumentId = () => {
    this.props.history.push({ pathname: '/documents', state: { highlightedDocumentId: null } })
  }

  private getOptions(document: Document) {
    const canReadDocs = this.props.isAuthorized(kyc.canReadDocs)

    const viewClickHandler = () => {
      this.props.history.push(`/documents/${document.id}`)
    }

    const handleClickSingleDocument = (document: Document, toggleModal: () => void) => {
      this.props.resetDocumentsSelectData()
      this.handleSelectDocument(document)
      toggleModal()
    }

    const download: DropdownOption = {
      ...DOWNLOAD,
      onClick: () => downloadSelectedDocuments(this.props.downloadDocumentsAsync)([document])
    }

    const view: DropdownOption = {
      ...VIEW,
      onClick: viewClickHandler
    }

    const remove: DropdownOption = canReadDocs
      ? {
          ...DELETE,
          onClick: () => handleClickSingleDocument(document, this.toggleDeleteDocumentModal)
        }
      : undefined

    const share: DropdownOption = canReadDocs
      ? {
          ...SHARE,
          onClick: () => handleClickSingleDocument(document, this.toggleShareDocumentModal)
        }
      : undefined

    const isPDF = document.name.toLowerCase().endsWith('.pdf')
    return { download, view, remove, share }
  }

  private componentForEmptyDocumentLibrary(): React.ReactNode {
    return <EmptyDocumentLibrary toggleAddDocumentModal={this.toggleAddDocumentModal} />
  }

  private toggleShareDocumentModal = () => this.props.toggleModalVisible('shareDocument')
  private toggleDeleteDocumentModal = () => this.props.toggleModalVisible('deleteDocument')
  private toggleAddDocumentModal = () => this.props.toggleModalVisible('addDocument')

  private handleSelectDocument = (document: Document): void => {
    this.props.selectDocument(document.id)
  }

  private handleSelectDocumentType = (documentType: DocumentType): void => {
    this.props.selectDocumentType(documentType.id)
  }

  // Function to handle the search filter of Documents.
  private handleSearchChange = (e: any, obj: any): void => {
    const searchValue: string = obj.value
    this.props.changeDocumentsFilter(FILTERS_NAME.SEARCH, searchValue)
    this.searchDocuments(DEFAULT_PRODUCT_ID, searchValue, 'none')
  }

  private filterApplied = (filter: DocumentListFilter) => {
    this.props.setDocumentListFilter(filter)
  }
}

const mapStateToProps = (state: ApplicationState) => ({
  user: state.get('uiState').get('profile')
})

const withDocumentsListHoc = c => withDocuments(c, { filterDocuments: filterOwnDocumentList })

export default compose<any>(
  withPermissions,
  withProducts,
  withCategories,
  withDocument,
  withDocumentTypes,
  withDocumentsListHoc,
  withModalsState,
  withTemplates,
  withCounterparties,
  withRequests,
  withRouter,
  withLicenseCheck,
  withUsersById,
  connect(mapStateToProps)
)(DocumentManagementContainer)
