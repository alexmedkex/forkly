import * as React from 'react'
import { Accordion, Confirm, Button } from 'semantic-ui-react'
import { FormikContext } from 'formik'
import { PANELS } from '../TradeViewData'
import { CapitalizedHeader } from '../../../letter-of-credit-legacy/components/CapitalizedHeader'
import { ICreateOrUpdateTrade, ITradeDocument } from '../../store/types'
import { DocumentType } from '../../../document-management/store/types/document-type'
import SimpleButton from '../../../../components/buttons/SimpleButton'
import DocumentData from './DocumentData'
import { initialDocumentData, TRADING_ROLE_OPTIONS } from '../../constants'
import DocumentsList from './DocumentsList'
import { DocumentTypes } from '../../../document-management/constants/DocumentTypes'

interface IProps {
  documentTypes: DocumentType[]
  tradingRole: string
  formik: FormikContext<ICreateOrUpdateTrade>
}

interface IState {
  documentModalOpen: boolean
  documentIndex: number
  confirmRemoveOpen: boolean
  removeDocumentIndex: number
}

class Documents extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      documentModalOpen: false,
      documentIndex: 0,
      confirmRemoveOpen: false,
      removeDocumentIndex: undefined
    }
  }

  openAttachDocumentModal = () => {
    this.setState({
      documentModalOpen: true,
      documentIndex: this.props.formik.values.documents.length
    })
  }

  toggleDocumentModal = () => {
    this.setState({
      documentModalOpen: !this.state.documentModalOpen
    })
  }

  handleAttachDocument = (currDocument: ITradeDocument) => {
    const newDocuments = [...this.props.formik.values.documents]

    currDocument.categoryId = this.props.documentTypes.find(type => type.id === currDocument.typeId).category.id

    newDocuments[this.state.documentIndex] = currDocument
    this.props.formik.setFieldValue('documents', newDocuments)
  }

  getInitialData = () => {
    if (this.props.formik.values.documents[this.state.documentIndex]) {
      return this.props.formik.values.documents[this.state.documentIndex]
    }

    return initialDocumentData
  }

  filteredDocumentTypes = () => {
    const allowedDocumentTypes =
      this.props.tradingRole === TRADING_ROLE_OPTIONS.BUYER
        ? [DocumentTypes.CommercialContract, DocumentTypes.CommercialContractAmendment, DocumentTypes.Other]
        : [
            DocumentTypes.CommercialContract,
            DocumentTypes.CommercialContractAmendment,
            DocumentTypes.Invoice,
            DocumentTypes.Other
          ]

    return this.props.documentTypes.filter(type => allowedDocumentTypes.includes(type.id as DocumentTypes))
  }

  removeToggleConfirm = (removeDocumentIndex?: number) => {
    this.setState({
      confirmRemoveOpen: !this.state.confirmRemoveOpen,
      removeDocumentIndex
    })
  }

  removeDocument = () => {
    const { formik } = this.props
    const newDocuments = formik.values.documents.filter((value, i) => this.state.removeDocumentIndex !== i)
    formik.setFieldValue('documents', newDocuments)
    this.removeToggleConfirm()
  }

  editDocument = (index: number) => {
    this.setState({
      documentModalOpen: !this.state.documentModalOpen,
      documentIndex: index
    })
  }

  getConfirmContent = () => {
    return (
      <div className="content">
        Are you sure you want to remove document {`#${this.state.removeDocumentIndex + 1}`}?
      </div>
    )
  }

  render() {
    const { formik } = this.props
    const { confirmRemoveOpen } = this.state

    return (
      <React.Fragment>
        <Accordion.Title active={true} index={PANELS.Documents}>
          <CapitalizedHeader block={true}>Documents</CapitalizedHeader>
        </Accordion.Title>
        <Accordion.Content active={true}>
          <DocumentsList
            documents={formik.values.documents}
            removeDocument={this.removeToggleConfirm}
            editDocument={this.editDocument}
            inForm={true}
            documentTypes={this.filteredDocumentTypes()}
          />
          <DocumentData
            open={this.state.documentModalOpen}
            toggleDocumentModal={this.toggleDocumentModal}
            documentTypes={this.filteredDocumentTypes()}
            preselectedDocumentType=""
            initialDocumentData={this.getInitialData() as any}
            attachDocument={this.handleAttachDocument}
          />
          <SimpleButton
            type="button"
            data-test-id="attach-document-button"
            onClick={this.openAttachDocumentModal}
            style={{ marginTop: '15px', marginBottom: '15px' }}
          >
            + Attach new document
          </SimpleButton>
        </Accordion.Content>
        <Confirm
          open={confirmRemoveOpen}
          header="Remove document"
          content={this.getConfirmContent()}
          cancelButton={<Button content="Cancel" />}
          confirmButton={<Button primary={true} content="Confirm" />}
          onCancel={() => this.removeToggleConfirm()}
          onConfirm={() => this.removeDocument()}
        />
      </React.Fragment>
    )
  }
}

export default Documents
