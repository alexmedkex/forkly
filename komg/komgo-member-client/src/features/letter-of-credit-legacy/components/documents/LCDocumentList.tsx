import * as React from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router'
import { compose } from 'redux'
import styled from 'styled-components'
import { LoadingTransition } from '../../../../components'
import { ApplicationState } from '../../../../store/reducers'
import { displayDate } from '../../../../utils/date'
import {
  DOWNLOAD,
  DropdownOption,
  VIEW
} from '../../../document-management/components/documents/my-documents/DocumentListDropdownOptions'
import {
  groupBy,
  MapDocumentsToDocumentTypeId
} from '../../../document-management/components/documents/my-documents/toMap'
import { EllipsisDropdown } from '../../../document-management/components/dropdowns/EllipsisDropdown'
import { withCategories, withDocuments, withDocumentTypes, withProducts } from '../../../document-management/hoc'
import { Category, Document, DocumentsFilters, DocumentType, ProductId } from '../../../document-management/store/types'
import { initiateDownload } from '../../../document-management/utils/downloadDocument'
import { ILCPresentation } from '../../types/ILCPresentation'
import { ILetterOfCredit } from '../../types/ILetterOfCredit'
import DocumentTabPresentations from '../presentation/DocumentTabPresentations'
import { HeadedList } from './HeadedList'

interface IProps extends RouteComponentProps<{ id: string }> {
  filters: DocumentsFilters
  categories: Category[]
  documentTypes: DocumentType[]
  allDocs: Document[]
  documentsGroupByType: MapDocumentsToDocumentTypeId
  isLoadingDocuments: boolean
  isLoadingDocumentTypes: boolean
  letterOfCredit: ILetterOfCredit
  presentations: ILCPresentation[]
  company: string
  fetchDocumentsAsync(productId: ProductId, lc: string): void
  fetchCategoriesAsync(productId: ProductId): void
  fetchDocumentTypesAsync(productId: ProductId, categoryId?: string): void
  downloadDocumentsAsync(documentId: string, productId: ProductId): void
  changeDocumentsFilter(filter: string, value: string): void
}

const PRODUCT_ID = 'tradeFinance'

export type LCDocument = Document & { context: { parcelId: string } }

export class LCDocumentList extends React.Component<IProps> {
  componentDidMount() {
    this.props.fetchDocumentsAsync(PRODUCT_ID, this.props.match.params.id)
    this.props.fetchCategoriesAsync(PRODUCT_ID)
    this.props.fetchDocumentTypesAsync(PRODUCT_ID)
  }

  renderDocumentDropdownActions = (document: LCDocument): DropdownOption[] => {
    const viewClickHandler = () => {
      this.props.history.push(
        `/financial-instruments/letters-of-credit/${this.props.letterOfCredit._id}/documents/${document.id}`
      )
    }
    const download: DropdownOption = {
      ...DOWNLOAD,
      onClick: () => initiateDownload(document)
    }
    const view: DropdownOption = {
      ...VIEW,
      onClick: viewClickHandler
    }
    const dropdownOptions = { download, view }
    return Object.values(dropdownOptions)
  }

  render() {
    const { letterOfCredit, isLoadingDocuments, isLoadingDocumentTypes, presentations, allDocs, company } = this.props
    if (isLoadingDocuments || isLoadingDocumentTypes) {
      return (
        <LCDocumentListWrapper>
          <StyledLoader title="Loading documents" />
        </LCDocumentListWrapper>
      )
    }
    return (
      <LCDocumentListWrapper>
        {/* We do not need filters on this page for now, will need them later! <StyledHeader>
          <Filters
            filters={this.props.filters}
            letterOfCredit={letterOfCredit}
            filterDocuments={this.props.changeDocumentsFilter}
            categories={this.props.categories}
          />
        </StyledHeader> */}
        {this.renderLCDocumentsByCategory()}
        {company === letterOfCredit.applicantId && (
          <DocumentTabPresentations
            presentations={presentations}
            documents={allDocs}
            itemToListItemContent={this.documentToListItemContent}
            lcId={letterOfCredit._id}
          />
        )}
      </LCDocumentListWrapper>
    )
  }

  private renderLCDocumentsByCategory = () => {
    const lcDocumentsByCategory = groupBy(
      this.props.allDocs.filter(doc => !doc.context || (doc.context && !doc.context.lcPresentationStaticId)),
      doc => doc.category.id
    )
    const categoryIds = Array.from(lcDocumentsByCategory.keys()).filter(this.applyCategoryFilter)
    return categoryIds.map(categoryId => {
      const documentsForThisCategory = lcDocumentsByCategory.get(categoryId) || []
      return documentsForThisCategory.length ? (
        <HeadedList
          key={categoryId}
          title={categoryId}
          items={documentsForThisCategory.filter(this.applyDocumentFilters)}
          itemToListItemContent={this.documentToListItemContent}
        />
      ) : null
    })
  }

  private applyDocumentFilters = (document: LCDocument) => {
    return this.applyCategoryFilter(document.category.id) && this.applyParcelIdFilter(document.context.parcelId)
  }

  private applyCategoryFilter = (categoryId: string) => {
    const { filters } = this.props
    if (!filters) {
      return true
    }
    const selectedCategoryId = filters.selectedCategoryId || 'all'
    return selectedCategoryId === 'all' ? true : categoryId === selectedCategoryId
  }

  private applyParcelIdFilter = (parcelId: string) => {
    const { filters } = this.props
    if (!filters) {
      return true
    }
    const selectedParcelId = filters.parcel || 'all'
    return selectedParcelId === 'all' ? true : parcelId === selectedParcelId
  }

  private documentToListItemContent = (document: Document) => {
    return {
      id: document.id,
      documentType: <StyledDocumentType>{document.type.name}</StyledDocumentType>,
      fileName: <StyledDocumentProp>{document.name}</StyledDocumentProp>,
      parcelId: <StyledDocumentProp>{this.parcelIdOrNull(document)}</StyledDocumentProp>,
      registrationDate: <StyledDocumentProp>{displayDate(document.registrationDate)}</StyledDocumentProp>,
      controls: (
        <EllipsisDropdown
          options={this.renderDocumentDropdownActions}
          item={document}
          style={{ top: '-5px', paddingRight: '0' }}
        />
      )
    }
  }

  private parcelIdOrNull(document: Document) {
    const { context } = document
    return context && context.parcelId ? `Parcel #${context.parcelId}` : null
  }
}

const StyledHeader = styled.div`
  &:after {
    content: '';
    clear: both;
    display: table;
  }
  margin-bottom: 30px;
`

const StyledLoader = styled(LoadingTransition)`
  margin-top: 50px;
`

const LCDocumentListWrapper = styled.div`
  min-height: 40vh;
`

const StyledDocumentType = styled.b`
  flex: 1;
`

const StyledDocumentProp = styled.p`
  flex: 1;
`

const mapStateToProps = (state: ApplicationState, ownProps: IProps) => {
  const letterOfCreditId = ownProps.match.params.id

  const letterOfCredit: ILetterOfCredit =
    state
      .get('lettersOfCredit')
      .get('byId')
      .toJS()[letterOfCreditId] || {}

  let presentations: ILCPresentation[]

  if (letterOfCredit.reference) {
    presentations = state
      .get('lCPresentation')
      .get('byLetterOfCreditReference')
      .toJS()[letterOfCredit.reference]
  }

  return {
    letterOfCredit,
    presentations,
    company: state.get('uiState').get('profile').company
  }
}

export default compose<any>(
  withProducts,
  withCategories,
  withDocuments,
  withRouter,
  withDocumentTypes,
  connect(mapStateToProps)
)(LCDocumentList)
