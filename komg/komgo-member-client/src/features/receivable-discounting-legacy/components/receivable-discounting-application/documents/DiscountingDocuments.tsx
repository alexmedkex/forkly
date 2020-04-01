import { RDStatus } from '@komgo/types'
import * as React from 'react'
import { Button } from 'semantic-ui-react'
import styled from 'styled-components'
import { MinimalAccordionWrapper } from '../../../../../components/accordion/MinimalAccordionWrapper'
import { blueGrey } from '../../../../../styles/colors'
import {
  CreateDocumentRequest,
  Document,
  DocumentType,
  ProductId,
  SendDocumentsRequest
} from '../../../../document-management'
import { AddNewDocumentModal } from '../../../../document-management/components'
import AddNewDocumentForm from '../../../../document-management/components/documents/AddNewDocumentForm'
import { DocumentCategories } from '../../../../document-management/constants/DocumentCategories'
import { DocumentTypes } from '../../../../document-management/constants/DocumentTypes'
import { Products } from '../../../../document-management/constants/Products'
import { SubProducts } from '../../../../document-management/constants/SubProducts'
import BasicPanel from '../../../../trades/components/BasicPanel'
import { DocumentContextBase, TradeDocumentContext } from '../../../../trades/store/types'
import { RDDocumentContext } from '../../../store/types'
import { DocumentCheckbox } from './DocumentListItem'
import DocumentsList from './DocumentsList'
import { ReceivableDiscountingViewPanels, ReceivablesDiscountingRole } from '../../../utils/constants'

export interface IDiscountingDocumentsProps {
  rdId: string
  isDocumentsAccordionOpen: boolean
  registeredDocuments: Document[]
  documentTypes: DocumentType[]
  tradeSourceId: string
  rdStatus: RDStatus
  companyStaticId: string
  role: ReceivablesDiscountingRole
  changed: boolean
  counterpartyId: string
  handleDocumentViewClick: (id: string) => void
  handleDocumentDeleteClick: (id: string) => void
  handleClick: (e: React.SyntheticEvent, titleProps: any) => void
  createDocumentAsync(createDocumentRequest: CreateDocumentRequest, productId: ProductId): void
  sendDocumentsAsync(requests: SendDocumentsRequest[], productId: ProductId): void
}

export interface IDocumentItemSelection {
  selectAll: {
    checked: boolean
    disabled: boolean
  }
  [id: string]: {
    checked: boolean
    disabled: boolean
  }
}

interface IDiscountingDocumentsState {
  isAddNewDocumentModalVisible: boolean
  documentItemSelection: IDocumentItemSelection
}

export const documentIsShared = (document: Document, counterpartyId: string): boolean =>
  document &&
  document.sharedWith &&
  document.sharedWith.length > 0 &&
  document.sharedWith.some(el => el.counterpartyId === counterpartyId)

export const documentIsReceived = (document: Document, companyStaticId: string): boolean =>
  document && document.owner && document.owner.companyId && document.owner.companyId !== companyStaticId

export default class DiscountingDocuments extends React.Component<
  IDiscountingDocumentsProps,
  IDiscountingDocumentsState
> {
  constructor(props) {
    super(props)
    this.state = {
      isAddNewDocumentModalVisible: false,
      documentItemSelection: this.mapAllCheckboxStates()
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.registeredDocuments !== this.props.registeredDocuments) {
      this.setState(prevState => ({ ...prevState, documentItemSelection: this.mapAllCheckboxStates() }))
    }
  }

  toggleModalState() {
    this.setState({
      isAddNewDocumentModalVisible: !this.state.isAddNewDocumentModalVisible
    })
  }

  closeDocumentUpload = () => {
    this.setState({
      isAddNewDocumentModalVisible: false
    })
  }

  // Duplicated from ModalsContainer.tsx as set to private - check with Dublin
  // if proper way of doing it or make exported
  handleCreateDocument = (createDocumentRequest: CreateDocumentRequest) => {
    const { documentTypes, rdId, tradeSourceId } = this.props

    // Find the category and subproductId given the selected type
    const documentType = documentTypes.find(documentType => documentType.id === createDocumentRequest.documentTypeId)
    const category = documentType.category

    let context: DocumentContextBase
    if (category.id === DocumentCategories.RDDocuments) {
      const rdContext: RDDocumentContext = {
        productId: Products.TradeFinance,
        subProductId: SubProducts.ReceivableDiscounting,
        rdId
      }
      context = rdContext
    }
    if (category.id === DocumentCategories.TradeDocuments || category.id === DocumentCategories.CommercialContract) {
      const tradeContext: TradeDocumentContext = {
        productId: Products.TradeFinance,
        subProductId: SubProducts.Trade,
        vaktId: tradeSourceId
      }
      context = tradeContext
    }
    createDocumentRequest.context = context
    createDocumentRequest.categoryId = category.id

    this.createDocument(createDocumentRequest).then(() => this.toggleModalState())
  }

  createDocument = async (createDocumentRequest: CreateDocumentRequest) => {
    this.props.createDocumentAsync(createDocumentRequest, Products.TradeFinance)
  }

  shareDocuments(): void {
    const { sendDocumentsAsync, counterpartyId, companyStaticId } = this.props
    const { documentItemSelection } = this.state

    const documentsMap = this.props.registeredDocuments.reduce((memo, doc) => {
      return {
        ...memo,
        [doc.id]: doc
      }
    }, {})

    const ids = Object.keys(documentItemSelection).filter(
      key =>
        key !== 'selectAll' &&
        !documentIsShared(documentsMap[key], counterpartyId) &&
        !documentIsReceived(documentsMap[key], companyStaticId) &&
        documentItemSelection[key].checked
    )

    const requests = [
      {
        documents: ids,
        companyId: counterpartyId,
        context: {
          reviewNotRequired: true
        }
      }
    ]
    const productId = Products.TradeFinance

    sendDocumentsAsync(requests, productId)
  }

  filteredDocumentTypes = () => {
    // TODO: The notion of subproductId is not present in the client for some
    // reason so it's impossible to filter by subProductId Change this filter
    // when this is  fixed
    const allowedDocumentCategories = [DocumentCategories.RDDocuments]

    const allowedDocumentTypesForBoth = [
      DocumentTypes.DiscountingAgreement,
      DocumentTypes.DiscountingAgreementAppendixes,
      DocumentTypes.Other
    ]

    const allowedDocumentTypesForBank = [
      ...allowedDocumentTypesForBoth,
      DocumentTypes.ProofOfDiscounting,
      DocumentTypes.ProofOfRepayment
    ]

    const allowedDocumentTypesForTrader = [
      ...allowedDocumentTypesForBoth,
      DocumentTypes.AssignmentOfProceeds,
      DocumentTypes.ParentCompanyGuarantee,
      DocumentTypes.PaymentUndertaking,
      DocumentTypes.ProofOfPerformance,
      DocumentTypes.ProofOfTradeAcceptance,
      DocumentTypes.InsurancePolicy,
      DocumentTypes.LostPayeeEvidence,
      DocumentTypes.PaymentConfirmation,
      DocumentTypes.BillOfExchange,
      DocumentTypes.PromissoryNote,
      DocumentTypes.AcknowledgementOfNoticeOfAssignment,
      DocumentTypes.RenunciationOfRights,
      DocumentTypes.Invoice,
      DocumentTypes.CommercialContract,
      DocumentTypes.CommercialContractAmendment
    ]

    let allowedDocumentTypes
    if (this.props.role === ReceivablesDiscountingRole.Bank) {
      allowedDocumentTypes = allowedDocumentTypesForBank
    } else {
      allowedDocumentTypes = allowedDocumentTypesForTrader
    }

    return this.props.documentTypes.filter(
      documentType =>
        allowedDocumentCategories.includes(documentType.category.id as DocumentCategories) ||
        allowedDocumentTypes.includes(documentType.id as DocumentTypes)
    )
  }

  renderNewDocumentModal() {
    return (
      <AddNewDocumentModal
        toggleVisible={this.closeDocumentUpload}
        visible={this.state.isAddNewDocumentModalVisible}
        title="Add document"
      >
        <AddNewDocumentForm
          documents={this.props.registeredDocuments}
          documentTypes={this.filteredDocumentTypes()}
          handleSubmit={this.handleCreateDocument}
          preselectedCategory=""
          preselectedDocumentType=""
          documentTypeDisabled={false}
        />
      </AddNewDocumentModal>
    )
  }

  mapAllCheckboxStates(): IDocumentItemSelection {
    const { companyStaticId, counterpartyId } = this.props
    const documentsState: IDocumentItemSelection = { selectAll: { checked: false, disabled: false } }

    for (const doc of this.props.registeredDocuments) {
      documentsState[doc.id] = {
        checked: documentIsShared(doc, counterpartyId),
        disabled: documentIsShared(doc, counterpartyId) || documentIsReceived(doc, companyStaticId)
      }
    }

    documentsState.selectAll.checked = this.shouldCheckSelectAll(documentsState)
    documentsState.selectAll.disabled = this.shouldDisableSelectAll(documentsState)

    return documentsState
  }

  toggleAllSelections(selectAllChecked: boolean): IDocumentItemSelection {
    const documentsState: IDocumentItemSelection = {
      selectAll: {
        checked: selectAllChecked,
        disabled: false
      }
    }

    for (const doc of this.props.registeredDocuments) {
      documentsState[doc.id] = {
        checked: !this.state.documentItemSelection[doc.id].disabled
          ? selectAllChecked
          : this.state.documentItemSelection[doc.id].checked,
        disabled: this.state.documentItemSelection[doc.id] && this.state.documentItemSelection[doc.id].disabled
      }
    }

    return documentsState
  }

  handleClickDocumentItemCheckbox(id: string, checked: boolean, disabled: boolean): void {
    if (id === 'selectAll') {
      const documentItemSelection = this.toggleAllSelections(checked)
      const newState = {
        ...this.state,
        documentItemSelection
      }

      return this.setState(newState)
    } else {
      const newState = {
        ...this.state,
        documentItemSelection: {
          ...this.state.documentItemSelection,
          [id]: {
            ...this.state.documentItemSelection[id],
            checked,
            disabled
          }
        }
      }

      if (this.shouldCheckSelectAll(newState.documentItemSelection)) {
        newState.documentItemSelection.selectAll = {
          checked: true,
          disabled: false
        }
      } else {
        newState.documentItemSelection.selectAll = {
          checked: false,
          disabled: false
        }
      }

      return this.setState(newState)
    }
  }

  shouldCheckSelectAll(documentItemSelection: IDocumentItemSelection): boolean {
    const { selectAll, ...ids } = documentItemSelection
    if (ids) {
      for (const id of Object.values(ids)) {
        if (id.checked === false) {
          return false
        }
      }

      return true
    }
  }

  shouldDisableSelectAll(documentItemSelection: IDocumentItemSelection): boolean {
    const { selectAll, ...ids } = documentItemSelection
    if (ids) {
      for (const id of Object.values(ids)) {
        if (id.disabled === false) {
          return false
        }
      }
    }
    return true
  }

  // When there is at least one checked checkbox that is not disabled
  shouldShowShareButton(documentItemSelection: IDocumentItemSelection): boolean {
    const { selectAll, ...ids } = documentItemSelection

    return ids && Object.values(ids).some(id => id.checked === true && !id.disabled)
  }

  render() {
    const { isDocumentsAccordionOpen, companyStaticId, handleClick, counterpartyId, rdStatus, changed } = this.props
    const { documentItemSelection } = this.state

    const canShareDocuments = rdStatus === RDStatus.QuoteAccepted

    return (
      <MinimalAccordionWrapper
        active={isDocumentsAccordionOpen}
        handleClick={handleClick}
        highlight={changed}
        index={ReceivableDiscountingViewPanels.Documents}
        title="Documents"
      >
        <BasicPanel>
          <DocumentsHeader data-test-id="documents-header">
            {this.createTextBasedOnDocsLengthAndStatus(this.props.registeredDocuments, this.props.rdStatus)}

            {this.props.rdStatus === RDStatus.QuoteAccepted && (
              <Button
                style={{
                  marginLeft: 'auto'
                }}
                primary={true}
                floated="right"
                disabled={this.props.rdStatus !== RDStatus.QuoteAccepted}
                type="submit"
                data-test-id="button-add-document"
                onClick={() => this.toggleModalState()}
              >
                Upload document
              </Button>
            )}
          </DocumentsHeader>
          {canShareDocuments &&
            this.props.registeredDocuments.length > 0 && (
              <SelectAllCheckboxWrapper data-test-id="select-all-checkbox-wrapper">
                <DocumentCheckbox
                  id="selectAll"
                  name={null}
                  handleClickDocumentItemCheckbox={(id: string, checked: boolean, disabled: boolean) =>
                    this.handleClickDocumentItemCheckbox('selectAll', checked, false)
                  }
                  checked={documentItemSelection.selectAll.checked}
                  disabled={documentItemSelection.selectAll.disabled}
                />
                {this.shouldShowShareButton(documentItemSelection) ? (
                  <SharedButton size="small" data-test-id="share-documents" onClick={() => this.shareDocuments()}>
                    Share
                  </SharedButton>
                ) : (
                  <SelectAllParagraph>Select all</SelectAllParagraph>
                )}
              </SelectAllCheckboxWrapper>
            )}
          <DocumentsList
            documents={this.props.registeredDocuments}
            companyStaticId={companyStaticId}
            counterpartyId={counterpartyId}
            documentItemSelection={documentItemSelection}
            handleClickDocumentItemCheckbox={(id: string, checked: boolean, disabled: boolean) =>
              this.handleClickDocumentItemCheckbox(id, checked, disabled)
            }
            documentTypes={this.props.documentTypes}
            handleDocumentViewClick={this.props.handleDocumentViewClick}
            handleDocumentDeleteClick={this.props.handleDocumentDeleteClick}
            rdStatus={this.props.rdStatus}
            data-test-id="document-list"
            canShareDocuments={canShareDocuments}
          />
          {this.renderNewDocumentModal()}
        </BasicPanel>
      </MinimalAccordionWrapper>
    )
  }

  private createTextBasedOnDocsLengthAndStatus(documents: Document[], status: RDStatus) {
    if (status !== RDStatus.QuoteAccepted && documents.length > 0) {
      return <p>Document(s) have not been shared with any external parties</p>
    }
    return documents.length > 0 ? (
      <p>
        Select document(s) you wish to share with your counterparty. Once document(s) are shared you will not be able to
        delete or unshare them
      </p>
    ) : (
      <p>Upload document(s) that you want to share with your counterparty</p>
    )
  }
}

export const SelectAllParagraph = styled.div`
  color: ${blueGrey};
  font-size: 12px;
  line-height: 18px;
  margin: 0px 15px;
`

export const SharedButton = styled(Button)`
  &&& {
    margin: 0 12.5px;
  }
`

export const SelectAllCheckboxWrapper = styled.div`
  & {
    display: flex;
    align-items: center;
    margin: 0 1em;
    padding: 0 0 0.5em 0;
    height: 35px;
  }
`

export const DocumentsHeader = styled.div`
  &&& {
    display: flex;
    justify-content: space-around;
    padding: 0px 14px;
    > p {
      color: ${blueGrey};
      font-style: italic;
      padding-right: 60px;
      flex-grow: 1;
    }
    > button {
      min-width: 150px;
      align-self: flex-start;
    }
    @media screen and (max-width: 1000px) {
      flex-direction: column;
    }
  }
`
