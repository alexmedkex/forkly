import * as React from 'react'
import styled from 'styled-components'
import { Header, Button, Dropdown, Label } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { paleBlue } from '../../../../styles/colors'
import { Document } from '../../../document-management/store/types'
import { History } from 'history'
import { ILCPresentation } from '../../types/ILCPresentation'
import AddAndAttachDocumentButtons from './AddAndAttachDocumentButtons'
import { displayDateAndTime } from '../../../../utils/date'
import SimpleButton from '../../../../components/buttons/SimpleButton'
import { LCPresentationStatus } from '../../store/presentation/types'
import DocumentsList from './DocumentsList'
import { capitalize } from '../../../../utils/casings'

interface IProps {
  presentation: ILCPresentation
  history: History
  id: string
  documents: Document[]
  readOnly: boolean
  toggleAddNewDocumentModal(presentation: ILCPresentation): void
  toggleAttachNewDocumentModal(presentation: ILCPresentation): void
  removePresentationHandle(presentation: ILCPresentation): void
  openDeleteDocumentConfirm(presentation: ILCPresentation, document: Document): void
  toggleSubmitPresentationModal(presentation: ILCPresentation): void
}

class Presentation extends React.Component<IProps> {
  static getPresentationStatusColor(status: LCPresentationStatus) {
    if (
      status === LCPresentationStatus.DocumentsDiscrepantByIssuingBank ||
      status === LCPresentationStatus.DocumentsDiscrepantByNominatedBank
    ) {
      return 'red'
    }
    return 'green'
  }

  viewClickHandler = (document: Document) => {
    this.props.history.push(`/financial-instruments/letters-of-credit/${this.props.id}/documents/${document.id}`)
  }

  removePresentation = () => {
    const { presentation } = this.props
    this.props.removePresentationHandle(presentation)
  }

  printDocuments = (documents: Document[], presentation: ILCPresentation) => {
    if (documents.length > 0) {
      return (
        <DocumentsList
          presentation={presentation}
          documents={documents}
          removeDeleteButton={this.props.readOnly}
          showActions={true}
          openDeleteDocumentConfirm={this.props.openDeleteDocumentConfirm}
          viewClickHandler={this.viewClickHandler}
        />
      )
    }
    return null
  }

  renderSubmitPresentationButton() {
    const { presentation, documents, readOnly } = this.props
    if (
      presentation.documents.length > 0 &&
      documents &&
      documents.length > 0 &&
      presentation.status === LCPresentationStatus.Draft &&
      !presentation.destinationState &&
      !readOnly
    ) {
      return (
        <SubmitPresentation>
          <Button primary={true} onClick={() => this.props.toggleSubmitPresentationModal(presentation)}>
            Submit Presentation
          </Button>
        </SubmitPresentation>
      )
    }
    return null
  }

  renderRemoveButtonOrSubmittedLabel() {
    const { presentation, readOnly } = this.props
    if (presentation.destinationState) {
      return (
        <SubmittedLabel>
          <Label color="grey">Pending</Label>
        </SubmittedLabel>
      )
    } else if (presentation.status === LCPresentationStatus.Draft && !readOnly) {
      return (
        <SimpleButton onClick={this.removePresentation} style={{ float: 'right', padding: '0' }}>
          Remove
        </SimpleButton>
      )
    }
    return (
      <SubmittedLabel>
        <Label color={Presentation.getPresentationStatusColor(presentation.status)}>
          {capitalize(presentation.status)}
        </Label>
        <SubmittedDetails>
          <SubmittedTime>
            {presentation.stateHistory &&
              presentation.stateHistory.length > 0 &&
              displayDateAndTime(presentation.stateHistory[presentation.stateHistory.length - 1].date)}
          </SubmittedTime>
          <Link
            to={`/financial-instruments/letters-of-credit/${this.props.id}/presentations/${
              presentation.staticId
            }/history`}
          >
            View history
          </Link>
        </SubmittedDetails>
      </SubmittedLabel>
    )
  }

  render() {
    const { presentation, toggleAddNewDocumentModal, documents, readOnly, toggleAttachNewDocumentModal } = this.props

    return (
      <StyledWrapper data-test-id={presentation.reference}>
        <Header as="h3" style={{ display: 'inline-block' }}>
          Presentation #{presentation.reference}
        </Header>
        {this.renderRemoveButtonOrSubmittedLabel()}
        {this.printDocuments(documents, presentation)}
        {presentation.status === LCPresentationStatus.Draft &&
          !presentation.destinationState &&
          !readOnly && (
            <AddAndAttachDocumentButtons
              presentation={presentation}
              toggleAddDocumentModal={() => toggleAddNewDocumentModal(presentation)}
              toggleAttachDocumentModal={() => toggleAttachNewDocumentModal(presentation)}
            />
          )}
        {this.renderSubmitPresentationButton()}
      </StyledWrapper>
    )
  }
}

const StyledWrapper = styled.div`
  margin: 20px 0;
  border: 1px solid ${paleBlue};
  padding: 15px;
  position: relative;
`

const SubmitPresentation = styled.div`
  &:before {
    content: '';
    position: absolute;
    height: 1px;
    background-color: ${paleBlue};
    width: 100%;
    left: 0;
    bottom: 62px;
  }
  padding-top: 15px;
  margin-top: 15px;
  text-align: right;
`

export const SubmittedLabel = styled.div`
  float: right;
  text-align: right;
`

const SubmittedDetails = styled.p`
  margin-top: 10px;
`

const SubmittedTime = styled.span`
  margin-right: 5px;
`

export default Presentation
