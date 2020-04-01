import * as React from 'react'
import { compose } from 'redux'
import { RouteComponentProps, matchPath } from 'react-router'
import Helmet from 'react-helmet'
import styled from 'styled-components'
import { kyc, Permission } from '@komgo/permissions'

import {
  Category,
  CreateRequestRequest,
  CreateTemplateRequest,
  Document,
  DocumentType,
  DocumentTypeCreateRequest,
  DocumentTypeUpdateRequest,
  Template,
  UpdateTemplateRequest,
  SendDocumentsRequest,
  CreateDocumentRequest,
  ProductId,
  DocumentsFilters,
  CounterpartyDocumentFilter,
  CounterpartyDocumentFilterWrap
} from '../store/types'
import { User } from '../../../store/common/types'

import { DocumentsActions } from '../store'
import { Counterparty, CounterpartyProfile } from '../../counterparties/store/types'
import { withDocumentManagement, withUsersById } from '../hoc'

import withDocumentsReview from '../../review-documents/hoc/withDocumentsReview'
import { IFullDocumentReviewResponse } from '../../review-documents/store/types'

import { CounterpartyDocsHeader } from '../components/page-header/PageHeader'
import DocumentRequestModal from '../components/templates/DocumentRequestModal'
import LoadTemplateModal from '../components/templates/LoadTemplateModal'
import DocumentsByCategoryList from '../components/documents/my-documents/DocumentsByCategoryList'
import { DOWNLOAD, DropdownOption, VIEW } from '../components/documents/my-documents/DocumentListDropdownOptions'
import { DOCUMENTS_BASE_ENDPOINT } from '../../../utils/endpoints'
import { JWT } from '../../../utils/jwt-storage'
import { withPermissions, Unauthorized, WithPermissionsProps } from '../../../components'
import * as _ from 'lodash'
import { MapDocumentsToDocumentTypeId } from '../components/documents/my-documents/toMap'
import { FILTERS_NAME } from '../store/types'
import { getSelectedDocuments, filterCounterpartyDocumentList } from '../utils/selectors'
import { downloadSelectedDocuments } from '../utils/downloadDocument'
import { isCounterpartyLibraryFiltered, isCounterpartyDocsFilterApplied } from '../utils/filtersHelper'
import EmptyCounterpartyLibrary from '../components/messages/EmptyCounterpartyLibrary'
import { isEmptyLibrary } from '../../document-management/utils/selectors'
import { getLastLocation } from '../../../store/history'
import { CounterpartyProfileSection } from '../components/counterparty-profile/CounterpartyProfileSection'
import { connect } from 'react-redux'
import { ApplicationState } from '../../../store/reducers'

const DEFAULT_PRODUCT_ID: ProductId = 'kyc'

interface Props {
  selectedCategoryId: string
}

interface WithDocumentManagementProps {
  templates: Template[]
  categories: Category[]
  documentTypes: DocumentType[]
  allVisibleDocuments: Document[]
  filters: DocumentsFilters
  counterpartyDocsFilter: CounterpartyDocumentFilterWrap
  selectedDocuments: string[]
  documentsGroupByType: MapDocumentsToDocumentTypeId
  isLoading: boolean
  counterparties: Counterparty[]
  sentDocumentRequestTypes: Map<string, Set<string>>
  usersById: Map<string, User[]>
  users: User[]
  counterpartyProfiles: Map<string, CounterpartyProfile>
  fetchProductsAsync(): void
  fetchCategoriesAsync(productId: ProductId): void
  fetchDocumentTypesAsync(productId: ProductId, categoryId?: string): void
  downloadDocumentsAsync(documentId: string, productId: ProductId): void
  createDocumentTypeAsync(documentType: DocumentTypeCreateRequest, productId: ProductId): void
  updateDocumentTypeAsync(documentType: DocumentTypeUpdateRequest, productId: ProductId): void
  deleteDocumentTypeAsync(typeId: string, productId: ProductId): void
  fetchTemplatesAsync(productId: ProductId): void
  createTemplateAsync(templateRequest: CreateTemplateRequest, productId: ProductId): void
  updateTemplateAsync(templateRequest: UpdateTemplateRequest, productId: ProductId): void
  deleteTemplateAsync(templateId: string, productId: ProductId): void
  createRequestAsync(request: CreateRequestRequest, productId: ProductId): void
  fetchRequestsAsync(productId: ProductId): void
  fetchRequestByIdAsync(requestId: string, productId: ProductId): void
  fetchDocumentsAsync(productId: ProductId, sharedBy?: string): void
  searchDocumentsAsync(productId: ProductId, query: string, sharedBy?: string): void
  sendDocumentsAsync(request: SendDocumentsRequest, productId: ProductId): void
  createDocumentAsync(createDocumentRequest: CreateDocumentRequest, productId: ProductId): void
  fetchConnectedCounterpartiesAsync(productId: ProductId): void
  // New reducer actions
  changeDocumentsFilter(filter: string, value: string): void
  selectDocument(documentId: string): void
  bulkSelectDocuments(...documentIds: string[]): void
  selectDocumentType(documentTypeId: string): void
  resetDocumentsSelectData(): void
  fetchUsersAsync(): void
  // Review button
  fetchDocumentsReceivedAsync(idReceivedDocumentsRequest: string, productId: string): void
  postCompleteDocumentReviewAsync(idReceivedDocumentsRequest: string): void
  patchDocumentsReviewAsync(idReceivedDocumentsRequest: string, documentsReviewed: IFullDocumentReviewResponse[]): void
  createCounterpartyProfileAsync(cpProfileRequest: CounterpartyProfile): void
  updateCounterpartyProfileAsync(cpProfileRequest: CounterpartyProfile): void
  fetchCounterpartyProfileAsync(counterpartyId: string): void
  setCounterpartyDocsFilter(filter: CounterpartyDocumentFilter, counterpartyId?: string): void
}

interface ModalsState {
  documentRequestModalVisible: boolean
  loadTemplateModalVisible: boolean
  createDocumentTypeModalVisible: boolean
  addNewDocumentModalVisible: boolean
  documentShareModalVisible: boolean
  titleModalEditCreateDocType: string
  selectedModalCategories: Category[]
  selectedModalDocumentTypes: DocumentType[]
  selectedCounterparty: { name: string; id: string }
  predefinedData: { category: string; name: string; id: string }
}

export class CounterpartyDocsContainer extends React.Component<
  Props & WithDocumentManagementProps & WithPermissionsProps & RouteComponentProps<any>,
  ModalsState
> {
  private searchDocuments: (productId: ProductId, query: string, sharedBy: string) => void

  constructor(props: Props & WithDocumentManagementProps & WithPermissionsProps & RouteComponentProps<any>) {
    super(props)

    const modalsState: ModalsState = {
      documentRequestModalVisible: false,
      loadTemplateModalVisible: false,
      documentShareModalVisible: false,
      createDocumentTypeModalVisible: false,
      addNewDocumentModalVisible: false,
      titleModalEditCreateDocType: 'New document type',
      selectedModalCategories: [],
      selectedModalDocumentTypes: [],
      selectedCounterparty: { name: '', id: '' },
      predefinedData: { category: '', name: '', id: '' }
    }

    this.state = {
      ...modalsState
    }

    this.componentForEmptyCounterpartyLibrary = this.componentForEmptyCounterpartyLibrary.bind(this)
    this.searchDocuments = _.debounce(props.searchDocumentsAsync, 300)
  }

  public componentDidMount() {
    const counterpartyId = this.props.match.params.id

    this.props.fetchProductsAsync()
    this.props.fetchCategoriesAsync(DEFAULT_PRODUCT_ID)
    this.props.fetchDocumentTypesAsync(DEFAULT_PRODUCT_ID)
    this.props.fetchTemplatesAsync(DEFAULT_PRODUCT_ID)

    this.props.fetchRequestsAsync(DEFAULT_PRODUCT_ID)
    this.props.fetchDocumentsAsync(DEFAULT_PRODUCT_ID, counterpartyId)

    this.props.fetchConnectedCounterpartiesAsync(DEFAULT_PRODUCT_ID)
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

    if (
      this.props.counterpartyDocsFilter &&
      this.props.counterpartyDocsFilter.counterpartyId &&
      this.props.counterpartyDocsFilter.counterpartyId !== this.props.match.params.id
    ) {
      this.props.setCounterpartyDocsFilter(null)
    }
  }

  public componentDidUpdate(prevProps: WithDocumentManagementProps) {
    // if (this.props.allDocuments !== prevProps.allDocuments) {
    //   // this.resetComponent()
    // }

    if (this.props.counterparties !== prevProps.counterparties) {
      const selectedCounterparty = this.props.counterparties.find(
        (counterparty: Counterparty) => counterparty.staticId === this.props.match.params.id
      ) || { x500Name: { CN: '' }, staticId: '' }

      this.props.fetchCounterpartyProfileAsync(selectedCounterparty.staticId)

      this.setState({
        selectedCounterparty: { name: selectedCounterparty.x500Name.CN, id: selectedCounterparty.staticId }
      })
    }
  }

  handleSearchChange = (e: any, obj: any): void => {
    const searchValue: string = obj.value
    this.props.changeDocumentsFilter(FILTERS_NAME.SEARCH, searchValue)

    this.searchDocuments(DEFAULT_PRODUCT_ID, searchValue, this.props.match.params.id)
  }

  filterApplied = (filter: CounterpartyDocumentFilter) => {
    this.props.setCounterpartyDocsFilter(filter, this.props.match.params.id)
  }

  toggleNewDocumentRequestModal = () => {
    this.props.history.push({
      pathname: `/request-documents/${this.state.selectedCounterparty.id}`
    })
  }

  toggleLoadDocumentRequestTemplateModal = () =>
    this.setState({
      documentRequestModalVisible: false,
      loadTemplateModalVisible: !this.state.loadTemplateModalVisible
    })

  handleCreateRequest = (documentTypes: DocumentType[]) => {
    const newDocTypesRequest: CreateRequestRequest = {
      companyId: this.state.selectedCounterparty.id,
      types: documentTypes.map(docType => docType.id),
      context: {},
      notes: []
    }

    this.setState({
      documentRequestModalVisible: false,
      loadTemplateModalVisible: false
    })

    this.props.createRequestAsync(newDocTypesRequest, DEFAULT_PRODUCT_ID) // companyId needed for RabbitMQ
  }

  handleSelectDocument = (document: Document): void => {
    this.props.selectDocument(document.id)
  }

  handleSelectDocumentType = (documentType: DocumentType): void => {
    this.props.selectDocumentType(documentType.id)
  }

  renderDocumentDropdownActions = (document: Document): DropdownOption[] => {
    // Create downloadClickHandler

    const viewClickHandler = () => {
      this.props.history.push(`/documents/${document.id}`)
    }

    const view: DropdownOption = {
      ...VIEW,
      onClick: viewClickHandler
    }

    const download: DropdownOption = {
      ...DOWNLOAD,
      onClick: () => downloadSelectedDocuments(this.props.downloadDocumentsAsync)([document])
    }

    const dropdownOptions = { download, view }

    return Object.values(dropdownOptions)
  }

  renderDocumentTypeDropdownActions = (documentType: DocumentType): DropdownOption[] => {
    // Get all documents of this type and category.
    const childDocuments = this.props.documentsGroupByType.get(documentType.id) || []

    // Create downloadClickHandler
    const downloadClickHandler = (event: React.MouseEvent, props: object) => {
      // Horrible fix to have the download work asap.

      for (const document of childDocuments) {
        const anchor = window.document.createElement('a')
        const file = `${process.env.REACT_APP_API_GATEWAY_URL}/api${DOCUMENTS_BASE_ENDPOINT}/products/${
          document.product.id
        }/documents/${document.id}/content/`

        const headers = new Headers()
        headers.append('Authorization', `Bearer ${JWT.token}`)
        fetch(file, {
          headers
        })
          .then(response => response.blob())
          .then(blobby => {
            const objectUrl = window.URL.createObjectURL(blobby)
            anchor.href = objectUrl
            anchor.download = `${document.name}`
            anchor.click()
            window.URL.revokeObjectURL(objectUrl)
          })
      }
      return
    }

    const download: DropdownOption = {
      ...DOWNLOAD,
      onClick: downloadClickHandler
    }

    const dropdownOptions = { download }

    return Object.values(dropdownOptions)
  }

  render() {
    const { loadTemplateModalVisible, selectedCounterparty } = this.state
    const { categories, documentTypes, templates, isAuthorized, isLoading } = this.props

    if (
      !isAuthorized(kyc.canReadRequestedDocs) &&
      !isAuthorized(kyc.canReadAndRequestDocs) &&
      !isAuthorized(kyc.canReviewDocs)
    ) {
      return <Unauthorized />
    }

    const areDocsFiltered = isCounterpartyDocsFilterApplied(
      this.props.counterpartyDocsFilter ? this.props.counterpartyDocsFilter.filter : null,
      this.props.filters
    )

    return (
      <React.Fragment>
        <Helmet>
          <title>{selectedCounterparty.name} documents</title>
        </Helmet>
        <CounterpartyDocsHeader
          pageName={selectedCounterparty.name ? `${selectedCounterparty.name} documents` : ''}
          isLoading={isLoading}
          handleSearch={this.handleSearchChange}
          filters={this.props.filters}
          filter={this.props.counterpartyDocsFilter ? this.props.counterpartyDocsFilter.filter : null}
          onFilterApplied={this.filterApplied}
          userCanCreateRequest={isAuthorized(kyc.canReadAndRequestDocs)}
          types={this.props.documentTypes}
          categories={this.props.categories}
          users={this.props.users}
          selectedDocuments={getSelectedDocuments(
            this.props.documentsGroupByType.get('all') || [],
            this.props.selectedDocuments
          )}
          toggleNewDocumentRequestModal={this.toggleNewDocumentRequestModal}
          toggleLoadDocumentRequestTemplateModal={this.toggleLoadDocumentRequestTemplateModal}
          downloadSelectedDocuments={downloadSelectedDocuments(this.props.downloadDocumentsAsync)}
          changeDocumentsFilter={this.props.changeDocumentsFilter}
          disabledSearch={!areDocsFiltered && isEmptyLibrary(this.props.documentsGroupByType)}
        />
        <CPDocsMetadataGrid>
          <div className="doc-exchange-status" />
          <CounterpartyProfileSection
            permittedUsers={this.usersWithPermissions([kyc.canManageDocReqTemplate])}
            counterpartyId={selectedCounterparty.id}
            counterpartyProfile={this.props.counterpartyProfiles.get(selectedCounterparty.id)}
            fetchCounterpartyProfileAsync={this.props.fetchCounterpartyProfileAsync}
            createCounterpartyProfileAsync={this.props.createCounterpartyProfileAsync}
            updateCounterpartyProfileAsync={this.props.updateCounterpartyProfileAsync}
          />
        </CPDocsMetadataGrid>

        <LoadTemplateModal
          toggleVisible={this.toggleLoadDocumentRequestTemplateModal}
          title={'Load Templates'}
          visible={loadTemplateModalVisible}
          templates={templates}
          categories={categories}
          documentTypes={documentTypes}
          onSubmit={this.handleCreateRequest}
          selectedCounterpartyName={this.state.selectedCounterparty.name}
          selectedCounterpartyId={this.state.selectedCounterparty.id}
          sentDocumentRequestTypes={this.props.sentDocumentRequestTypes}
        />

        <DocumentsByCategoryList
          context="counterparty-library"
          documents={this.props.allVisibleDocuments}
          categories={[{ id: 'all', name: 'All', product: { id: 'kyc', name: 'KYC ' } }, ...categories]}
          documentTypes={documentTypes}
          documentsGroupByType={this.props.documentsGroupByType}
          selectedDocuments={this.props.selectedDocuments}
          handleSelectDocument={this.handleSelectDocument}
          bulkSelectDocuments={this.props.bulkSelectDocuments}
          handleSelectDocumentType={this.handleSelectDocumentType}
          componentInCaseNoDocuments={this.componentForEmptyCounterpartyLibrary}
          renderDocumentDropdownActions={this.renderDocumentDropdownActions}
          renderDocumentTypeDropdownActions={this.renderDocumentTypeDropdownActions}
          isFiltered={areDocsFiltered}
          usersById={this.props.usersById}
        />
      </React.Fragment>
    )
  }

  private componentForEmptyCounterpartyLibrary(): React.ReactNode {
    return <EmptyCounterpartyLibrary toggleDocumentRequestModal={this.toggleNewDocumentRequestModal} />
  }

  private usersWithPermissions = (permissions: Permission[]) => {
    return Array.from(this.props.usersById.values()).reduce((acc, users) => [...acc, ...users], [])
  }
}

const mapStateToProps = (state: ApplicationState) => {
  const documentsState = state.get('documents')

  return {
    counterpartyDocsFilter: documentsState.get('counterpartyDocsFilter')
  }
}

const withDocumentsManagementHoc = wrapped =>
  withDocumentManagement(wrapped, { filterDocuments: filterCounterpartyDocumentList })

export default compose<any>(
  withPermissions,
  withDocumentsManagementHoc,
  withUsersById,
  withDocumentsReview,
  connect(mapStateToProps, {
    setCounterpartyDocsFilter: DocumentsActions.setCounterpartyDocsFilter
  })
)(CounterpartyDocsContainer)

const CPDocsMetadataGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr [doc-exchange-status] 1fr [profile-summary];
  grid-column-gap: 20.5px;
  margin-bottom: 20.5px;
`
