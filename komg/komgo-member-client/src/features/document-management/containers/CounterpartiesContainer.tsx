import * as React from 'react'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { SearchProps, Dropdown } from 'semantic-ui-react'
import Helmet from 'react-helmet'
import { productKYC } from '@komgo/products'
import { ApplicationState } from '../../../store/reducers'

import { PageHeader } from '../components/page-header/PageHeader'
import {
  ErrorMessage,
  withPermissions,
  WithPermissionsProps,
  Unauthorized,
  LoadingTransition,
  withLicenseCheck,
  WithLicenseCheckProps
} from '../../../components'
import ConnectedCounterparties from '../../counterparties/components/connected-counterparties/ConnectedCounterparties'
import {
  Counterparty,
  SearchCounterpartyPayload,
  Sort,
  CounterpartyProfile,
  CounterpartiesActionType
} from '../../counterparties/store/types'
import withCounterparties from '../../counterparties/hoc/withCounterparties'
import { stringOrNull } from '../../../utils/types'
import { kyc } from '@komgo/permissions'
import { RouteComponentProps, matchPath } from 'react-router-dom'
import { getLastLocation } from '../../../store/history'
import DocumentRequestModal from '../components/templates/DocumentRequestModal'
import { Category, DocumentType, ProductId, CreateRequestRequest, CounterpartyFilter } from '../store/types'
import { withDocumentManagement } from '../hoc'
import { counterpartyName } from '../utils/counterpartyHelper'
import { TypeCounterTable } from '../../counterparties/components/connected-counterparties/ConnectedCounterpartiesHeader'
import { RenewalDateFilter } from '../components/filter/RenewalDateFilter'
import { getGroupCounts, filterByRenewalDate, getRenewalDateFilterData } from '../utils/filters'
import { setCounterpartyFilter } from '../store/documents/actions'
import { WithLoaderProps } from '../../../components/with-loaders/index'
import { Feature } from '../../../components/feature-toggles'
import { FeatureToggle } from '../../../utils/featureToggles'

const DEFAULT_PRODUCT_ID: ProductId = 'kyc'

export interface ICounterpartiesProps
  extends IProps,
    WithPermissionsProps,
    WithLicenseCheckProps,
    WithLoaderProps,
    RouteComponentProps<{}> {
  categories: Category[]
  documentTypes: DocumentType[]
  counterparties: Counterparty[]
  counterpartiesSearch: string
  counterpartiesFiltered: Counterparty[]
  counterpartyProfiles: Map<string, CounterpartyProfile>
  counterpartiesSort: Sort
  fetchingConnectedCounterparties: boolean
  fetchingConnectedCounterpartiesError: stringOrNull
  sentDocumentRequestTypes: Map<string, Set<string>>
  counterparty: Map<string, CounterpartyProfile>
  createRequestAsync(request: CreateRequestRequest, productId: ProductId): void
  fetchCategoriesAsync(productId: ProductId): void
  fetchDocumentTypesAsync(productId: ProductId, categoryId?: string): void
  fetchConnectedCounterpartiesAsync(): void
  fetchNotConnectedCompaniesAsync(): void
  searchCounterparty(search: SearchCounterpartyPayload): void
  sortConnectedCounterparties(sort: Sort): void
  setCounterpartyFilter(filter: object): void
}

interface ModalsState {
  documentRequestModalVisible: boolean
  selectedCounterparty: Counterparty
}

interface IProps {
  activeFilter: CounterpartyFilter
  counterpartiesFiltered: Counterparty[]
  renewalDateGroups: any
}

export class CounterpartiesContainer extends React.Component<ICounterpartiesProps, ModalsState> {
  constructor(props: ICounterpartiesProps) {
    super(props)
    this.state = {
      documentRequestModalVisible: false,
      selectedCounterparty: undefined
    }
  }

  sortTable() {
    const { activeFilter } = this.props

    const filterData = activeFilter && getRenewalDateFilterData(activeFilter.renewalDateKey)
    if (filterData && filterData.sort) {
      this.props.sortConnectedCounterparties({
        column: filterData.sort.column,
        order: filterData.sort.order as any
      })
    } else {
      // By default, the table is sorted ASC by renewal date
      this.props.sortConnectedCounterparties({
        column: 'renewal',
        order: 'ascending'
      })
    }
  }

  componentDidUpdate(prevProps: ICounterpartiesProps) {
    if (prevProps.counterpartyProfiles !== this.props.counterpartyProfiles) {
      this.sortTable()
    }
    // There is a new element added in the table
    if (prevProps.counterpartyProfiles.size !== this.props.counterpartyProfiles.size) {
      // We just loaded the last profile missing among all the counterparties
      if (this.props.counterparties.length === this.props.counterpartyProfiles.size) {
        this.sortTable()
      }
    }
  }

  componentDidMount() {
    // reset search box + results only if previous location
    // was NOT view documents from a counterparty
    const lastLocation = getLastLocation() || { pathname: undefined }
    const shouldReset = !matchPath(lastLocation.pathname, {
      path: '/counterparty-docs/:id',
      exact: true,
      strict: false
    })
    if (shouldReset) {
      // clearing counterparty search box + search results
      this.props.searchCounterparty({ search: '', typeCounterparty: 'counterpartiesSearch' })
      this.props.setCounterpartyFilter(null)
    }

    this.props.fetchConnectedCounterpartiesAsync()
    this.props.fetchCategoriesAsync(DEFAULT_PRODUCT_ID)
    this.props.fetchDocumentTypesAsync(DEFAULT_PRODUCT_ID)
  }

  handleCreateRequest = (documentTypes: DocumentType[]) => {
    const newDocTypesRequest: CreateRequestRequest = {
      companyId: this.state.selectedCounterparty.staticId,
      types: documentTypes.map(docType => docType.id),
      context: {},
      notes: []
    }

    this.setState({
      documentRequestModalVisible: false,
      selectedCounterparty: undefined
    })

    this.props.createRequestAsync(newDocTypesRequest, DEFAULT_PRODUCT_ID) // companyId needed for RabbitMQ
  }

  handleOnSearchConnectedCounterparties = (event: React.MouseEvent<HTMLElement>, data: SearchProps) => {
    const search = data.value === undefined ? '' : data.value
    this.props.searchCounterparty({ search, typeCounterparty: 'counterpartiesSearch' })
  }

  handleConnectedCounterpartiesSort = (column: string, order: 'ascending' | 'descending') => {
    this.props.sortConnectedCounterparties({ column, order })
  }

  renderMenu = (id: string) => (
    <Dropdown inline={true} icon={'ellipsis horizontal'} direction={'left'}>
      <Dropdown.Menu>
        <Dropdown.Item onClick={() => this.props.history.push(`/counterparty-docs/${id}`)}>
          View documents
        </Dropdown.Item>
        <Dropdown.Item
          onClick={() =>
            this.props.history.push({
              pathname: `/request-documents/${id}`
            })
          }
        >
          Request documents
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  )

  handleRequestDocuments(idCounterparty: string) {
    this.setState({
      selectedCounterparty: this.props.counterparties.filter(c => c.staticId === idCounterparty)[0]
    })
    this.toggleNewDocumentRequestModal()
  }

  printErrorOrCounterparties() {
    const {
      fetchingConnectedCounterparties,
      fetchingConnectedCounterpartiesError,
      counterpartiesFiltered,
      counterpartiesSort,
      counterpartyProfiles
    } = this.props

    if (fetchingConnectedCounterparties) {
      return <LoadingTransition title="Loading counterparties" />
    }

    if (fetchingConnectedCounterpartiesError !== null) {
      return <ErrorMessage title="Unable to load counterparties" error={fetchingConnectedCounterpartiesError} />
    }

    return (
      <ConnectedCounterparties
        renderMenu={this.renderMenu}
        counterparties={counterpartiesFiltered}
        handleSort={this.handleConnectedCounterpartiesSort}
        counterpartiesSort={counterpartiesSort}
        counterpartyProfiles={counterpartyProfiles}
        typeCounterTable={TypeCounterTable.COUNTERPARTY_DOCS}
      />
    )
  }

  toggleNewDocumentRequestModal = () => {
    this.setState({
      documentRequestModalVisible: !this.state.documentRequestModalVisible
    })
  }

  filter = key => {
    this.props.setCounterpartyFilter({ renewalDateKey: key })
    // apply default filter
    const filterData = getRenewalDateFilterData(key)
    if (filterData && filterData.sort) {
      this.props.sortConnectedCounterparties({
        column: filterData.sort.column,
        order: filterData.sort.order as any
      })
    }
  }

  dataLoaded = () => {
    // currently, profiles are fetched one by one
    // added this in order to prevent UI flickering (display filtered data) while loading profiles
    return this.props.counterparties && this.props.counterparties.filter(c => c.profile === undefined).length === 0
  }

  render() {
    const { isAuthorized, isLicenseEnabled, activeFilter, renewalDateGroups, isFetching } = this.props

    if (
      !isLicenseEnabled(productKYC) ||
      (!isAuthorized(kyc.canReadRequestedDocs) &&
        !isAuthorized(kyc.canReadAndRequestDocs) &&
        !isAuthorized(kyc.canReviewDocs))
    ) {
      return <Unauthorized />
    }

    if (isFetching || !this.dataLoaded()) {
      return <LoadingTransition title="Loading" />
    }

    return (
      <React.Fragment>
        <Helmet>
          <title>Counterparty docs</title>
        </Helmet>

        <DocumentRequestModal
          title="Request summary"
          visible={this.state.documentRequestModalVisible}
          toggleVisible={this.toggleNewDocumentRequestModal}
          categories={this.props.categories}
          documentTypes={this.props.documentTypes}
          onSubmit={this.handleCreateRequest}
          selectedCounterpartyName={
            this.state.selectedCounterparty ? counterpartyName(this.state.selectedCounterparty) : ''
          }
          selectedCounterpartyId={this.state.selectedCounterparty ? this.state.selectedCounterparty.staticId : ''}
          sentDocumentRequestTypes={this.props.sentDocumentRequestTypes}
        />

        <PageHeader
          pageName="Counterparty docs"
          searchValue={this.props.counterpartiesSearch}
          handleSearch={this.handleOnSearchConnectedCounterparties}
          disabledSearch={false}
        />
        <RenewalDateFilter activeKey={activeFilter.renewalDateKey} count={renewalDateGroups} onFilter={this.filter} />
        {this.printErrorOrCounterparties()}
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: ICounterpartiesProps): IProps => {
  const activeFilter = state.get('documents').get('counterpartyFilter') || { renewalDateKey: 'all' }
  const allCounterparties = ownProps.counterparties
  const filteredCounterparties = ownProps.counterpartiesFiltered
  let renewalDateGroups

  if (allCounterparties) {
    const groups = getGroupCounts(allCounterparties)
    renewalDateGroups = groups.map(g => ({ key: g.key, value: g.value }))
  }

  return {
    activeFilter,
    counterpartiesFiltered: filterByRenewalDate(filteredCounterparties, activeFilter.renewalDateKey),
    renewalDateGroups
  }
}

export default compose(
  withPermissions,
  withLicenseCheck,
  withCounterparties,
  withDocumentManagement,
  connect<IProps>(mapStateToProps, {
    setCounterpartyFilter
  })
)(CounterpartiesContainer)
