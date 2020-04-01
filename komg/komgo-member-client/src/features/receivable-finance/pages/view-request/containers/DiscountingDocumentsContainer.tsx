import React from 'react'
import { ApplicationState } from '../../../../../store/reducers'
import { connect } from 'react-redux'
import { IReceivablesDiscountingInfo, RDStatus } from '@komgo/types'
import { ReceivablesDiscountingRole } from '../../../../receivable-discounting-legacy/utils/constants'
import DiscountingDocuments from '../../../../receivable-discounting-legacy/components/receivable-discounting-application/documents/DiscountingDocuments'
import { Document, ProductId, DocumentType } from '../../../../document-management'
import { withDocuments, withDocumentTypes } from '../../../../document-management/hoc'
import { compose } from 'redux'
import { WithDocumentsProps } from '../../../../document-management/hoc/withDocuments'
import { RouteComponentProps } from 'react-router'
import { Products } from '../../../../document-management/constants/Products'
import { deleteDocumentSuccessWithoutPush } from '../../../../document-management/store/documents/actions'
import { SubProducts } from '../../../../document-management/constants/SubProducts'
import { DocumentCategories } from '../../../../document-management/constants/DocumentCategories'
import { BottomSheetStatus } from '../../../../bottom-sheet/store/types'
import { ModifiedDocument, latestDocument } from '../../../../receivable-discounting-legacy/utils/document-utils'
import H from 'history'
import { isLaterThan } from '../../../../../utils/date'
import { ICachedData, CachedDataProvider } from '../../../../../components/cached-data-provider'

const PRODUCT_ID = Products.TradeFinance

interface IDiscountingDocumentsContainerOwnProps {
  discountingRequest: IReceivablesDiscountingInfo
  role: ReceivablesDiscountingRole
  history: H.History
}

interface IProps {
  documents: Document[]
  companyStaticId: string
}

interface IDiscountingDocumentsContainerState {
  active: boolean
}

interface IDocumentProps extends Partial<WithDocumentsProps> {
  documentTypes: DocumentType[]
  fetchDocumentTypesAsync(productId: ProductId, categoryId?: string): void
  fetchDocumentsWithParamsAsync(productId: ProductId, query?: string, sharedBy?: string, context?: any): void
}

interface IRouteComponentProps extends Partial<RouteComponentProps<any>> {
  history: H.History
}

export type IDiscountingDocumentsContainerProps = IDiscountingDocumentsContainerOwnProps &
  IProps &
  IDocumentProps &
  IRouteComponentProps

export class DiscountingDocumentsContainer extends React.Component<
  IDiscountingDocumentsContainerProps,
  IDiscountingDocumentsContainerState
> {
  state = {
    active: false
  }

  componentDidMount() {
    this.props.fetchDocumentTypesAsync(PRODUCT_ID)
    this.fetchDocuments()
  }

  componentDidUpdate(prevProps) {
    const { discountingRequest } = this.props
    if (prevProps.discountingRequest.rd.staticId !== discountingRequest.rd.staticId) {
      this.fetchDocuments()
    }
  }

  fetchDocuments() {
    const { discountingRequest } = this.props
    this.props.fetchDocumentsWithParamsAsync(Products.TradeFinance, undefined, undefined, {
      productId: Products.TradeFinance,
      subProductId: SubProducts.ReceivableDiscounting,
      rdId: discountingRequest.rd.staticId
    })
    this.props.fetchDocumentsWithParamsAsync(Products.TradeFinance, undefined, undefined, {
      productId: Products.TradeFinance,
      subProductId: SubProducts.Trade,
      vaktId: discountingRequest && discountingRequest.rd.tradeReference.sourceId
    })
  }

  handleAccordionClick(): void {
    this.setState(prevState => ({
      active: !prevState.active
    }))
  }

  handleDocumentViewClick = (id: string) => {
    this.props.history.push(`/documents/${id}?productId=${Products.TradeFinance}`)
  }

  handleDocumentDeleteClick = (id: string) => {
    this.props.deleteDocumentAsync(PRODUCT_ID, id, deleteDocumentSuccessWithoutPush)
  }

  registeredDocuments() {
    return this.props.documents.filter(
      (document: Document) =>
        document.state === BottomSheetStatus.REGISTERED &&
        (document.context.rdId === this.props.discountingRequest.rd.staticId ||
          document.context.vaktId === this.props.discountingRequest.rd.tradeReference.sourceId)
    )
  }

  getContextSpecificCounterpartyStaticID() {
    // Define the counterparty at this level, so that it can filter through to all the child components. This is used throughout
    // the child components to calculate the isShared/isReceived. It has no other function so updating it here.
    // If we are a bank, we need to use TradeSeller instead of CounterpartyID

    const { role, discountingRequest } = this.props

    return role === ReceivablesDiscountingRole.Bank && discountingRequest && discountingRequest.tradeSnapshot
      ? discountingRequest.tradeSnapshot.trade.seller
      : discountingRequest.acceptedParticipantStaticId
  }

  render() {
    const { documentTypes, companyStaticId, discountingRequest, role } = this.props
    const { active } = this.state
    const registeredDocuments = this.registeredDocuments()
    const latest: ModifiedDocument = latestDocument(registeredDocuments)
    const sectionId = (id: string) => `${id}-documents`

    return registeredDocuments.length > 0 || this.props.discountingRequest.status === RDStatus.QuoteAccepted ? (
      <CachedDataProvider
        data={active ? latest && latest.lastModifiedAt && latest.lastModifiedAt.toString() : null}
        id={sectionId(discountingRequest.rd.staticId)}
      >
        {({ cached: lastSeen }: ICachedData<string>) => (
          <DiscountingDocuments
            rdId={discountingRequest.rd.staticId}
            role={role}
            changed={latest && lastSeen ? isLaterThan(latest.lastModifiedAt, lastSeen) : Boolean(latest)}
            registeredDocuments={registeredDocuments}
            companyStaticId={companyStaticId}
            counterpartyId={this.getContextSpecificCounterpartyStaticID()}
            documentTypes={documentTypes}
            isDocumentsAccordionOpen={active}
            handleClick={() => this.handleAccordionClick()}
            handleDocumentViewClick={id => this.handleDocumentViewClick(id)}
            handleDocumentDeleteClick={id => this.handleDocumentDeleteClick(id)}
            createDocumentAsync={this.props.createDocumentAsync}
            sendDocumentsAsync={this.props.sendDocumentsAsync}
            tradeSourceId={discountingRequest.rd.tradeReference.sourceId}
            rdStatus={discountingRequest.status}
          />
        )}
      </CachedDataProvider>
    ) : null
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: IDiscountingDocumentsContainerProps): IProps => {
  const profile = state.get('uiState').get('profile')
  return {
    companyStaticId: profile ? profile.company : '',
    documents: Object.values<Document>(ownProps.documentsById.toJS()).filter(
      (document: Document) =>
        document.category.id === DocumentCategories.TradeDocuments ||
        document.category.id === DocumentCategories.RDDocuments ||
        document.category.id === DocumentCategories.CommercialContract
    )
  }
}

export default compose<any>(
  withDocuments,
  withDocumentTypes,
  connect<IProps, {}, IDiscountingDocumentsContainerOwnProps>(mapStateToProps, {})
)(DiscountingDocumentsContainer)
