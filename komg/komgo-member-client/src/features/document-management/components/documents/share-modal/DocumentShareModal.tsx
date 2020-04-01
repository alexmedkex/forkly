import * as React from 'react'
import { Modal } from 'semantic-ui-react'
import { productKYC } from '@komgo/products'

import { Counterparty } from '../../../../counterparties/store/types'
import { Document, SendDocumentsRequest } from '../../../store/types'
import ConfirmShareStep from './ConfirmShareStep'
import SelectedCounterparties, { ICounterpartyWithDocuments } from './SelectedCounterparties'
import { withLicenseCheck, WithLicenseCheckProps } from '../../../../../components'

interface Props extends WithLicenseCheckProps {
  open: boolean
  counterparties: Counterparty[]
  documents: Document[]
  toggleVisible(): void
  handleShareUpdate(documentsToUpdate: SendDocumentsRequest[]): void
}

enum SharingProcessStep {
  SelectCounterparties,
  ConfirmSharing
}

interface State {
  selectedCounterparties: string[]
  currentStep: SharingProcessStep
}

export class DocumentShareModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      selectedCounterparties: [],
      currentStep: SharingProcessStep.SelectCounterparties
    }
  }

  renderModalContent() {
    switch (this.state.currentStep) {
      case SharingProcessStep.SelectCounterparties:
        return (
          <SelectedCounterparties
            counterparties={this.getCounterpartiesList()}
            setSelectedCounterparties={this.setSelectedCounterparties}
            onCancel={this.handleClose}
            onConfirm={this.toConfirmationStage}
          />
        )
      case SharingProcessStep.ConfirmSharing:
        return (
          <ConfirmShareStep
            selectedCounterparties={this.selectedCounterparties()}
            documents={this.props.documents}
            onCancel={this.toCounterpartiesStage}
            onShare={this.handleSubmit}
          />
        )
      default:
        return null
    }
  }

  render() {
    return (
      <Modal
        open={this.props.open}
        centered={true}
        closeOnEscape={true}
        closeOnDimmerClick={true}
        onClose={this.handleClose}
        data-test-id="select-modal"
        size="large"
      >
        {this.renderModalContent()}
      </Modal>
    )
  }

  private getCounterpartiesList(): ICounterpartyWithDocuments[] {
    return this.props.counterparties
      .map(counterparty => {
        return {
          counterparty,
          documents: this.documentsForCounterparty(counterparty),
          isSelected: this.state.selectedCounterparties.includes(counterparty.staticId)
        }
      })
      .filter(counterparty => this.props.isLicenseEnabledForCompany(productKYC, counterparty.counterparty.staticId))
  }

  private documentsForCounterparty(counterparty: Counterparty): Document[] {
    return this.props.documents.filter(d => {
      return d.sharedWith.map(x => x.counterpartyId).includes(counterparty.staticId)
    })
  }

  private selectedCounterparties(): Counterparty[] {
    return this.props.counterparties.filter(c => {
      return this.state.selectedCounterparties.includes(c.staticId)
    })
  }

  private readonly setSelectedCounterparties = (staticIds: string[]) => {
    this.setState({
      selectedCounterparties: staticIds
    })
  }

  private readonly toCounterpartiesStage = () => {
    this.setState({
      currentStep: SharingProcessStep.SelectCounterparties
    })
  }

  private toConfirmationStage = () => {
    this.setState({
      currentStep: SharingProcessStep.ConfirmSharing
    })
  }

  private readonly handleClose = () => {
    this.cleanState()
    this.props.toggleVisible()
  }

  private readonly handleSubmit = () => {
    const sendDocumentsRequests: SendDocumentsRequest[] = this.state.selectedCounterparties.map(staticId => {
      return {
        documents: this.props.documents.map(doc => doc.id),
        companyId: staticId!
      }
    })

    this.props.handleShareUpdate(sendDocumentsRequests)
    this.handleClose()
  }

  private cleanState = () => {
    this.setState({
      selectedCounterparties: [],
      currentStep: SharingProcessStep.SelectCounterparties
    })
  }
}

export default withLicenseCheck(DocumentShareModal)
