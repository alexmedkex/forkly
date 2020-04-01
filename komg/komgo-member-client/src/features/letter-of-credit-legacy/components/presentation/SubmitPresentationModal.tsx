import * as React from 'react'
import { Modal, Form, Button, List, Image, Popup } from 'semantic-ui-react'
import styled from 'styled-components'
import { Formik, FormikProps } from 'formik'
import { SubmitPresentation } from '../../store/presentation/types'
import { ILCPresentation } from '../../types/ILCPresentation'
import { Document } from '../../../document-management/store/types'
import { ServerError } from '../../../../store/common/types'
import { ErrorMessage, LoadingTransition } from '../../../../components'
import { IMember } from '../../../members/store/types'
import { findMemberName } from '../../utils/selectors'

interface IProps {
  open: boolean
  presentation: ILCPresentation
  documents: Document[]
  isSubmitting: boolean
  submittingError: ServerError[]
  members: IMember[]
  toggleSubmitPresentationModal(): void
  submitPresentation(presentation: ILCPresentation, data: SubmitPresentation): void
}

class SubmitPresentationModal extends React.Component<IProps> {
  handleSubmit = (data: SubmitPresentation) => {
    this.props.submitPresentation(this.props.presentation, data)
  }

  closeModal = (formik: FormikProps<SubmitPresentation>) => {
    formik.resetForm()
    this.props.toggleSubmitPresentationModal()
  }

  parcelIdOrNull(document: Document) {
    const { context } = document
    return context && context.parcelId ? `Parcel #${context.parcelId}` : null
  }

  renderListOfDocument() {
    const { documents } = this.props
    return (
      <List divided={false} style={{ paddingLeft: 0, paddingRight: 0 }}>
        {documents.map(document => (
          <List.Item key={document.id}>
            <List.Content>
              <CommonCell>
                {' '}
                <Image src="/images/file.svg" inline={true} spaced="right" />
                <Popup trigger={<DocumentName>{document.name}</DocumentName>} content={document.name} />
              </CommonCell>
              <CommonCell>{document.type.name}</CommonCell>
              <CommonCell>{this.parcelIdOrNull(document)}</CommonCell>
            </List.Content>
          </List.Item>
        ))}
      </List>
    )
  }

  renderModalContent(formik: FormikProps<SubmitPresentation>) {
    const { isSubmitting, submittingError } = this.props
    if (isSubmitting) {
      return <LoadingTransition title="Submitting" marginTop="15px" />
    }
    return (
      <React.Fragment>
        {submittingError && submittingError.length > 0 ? (
          <ErrorMessage title="Error" error={submittingError[0].message} />
        ) : null}
        {this.renderListOfDocument()}
        <Form onSubmit={formik.handleSubmit}>
          <Form.TextArea
            label="Comment"
            value={formik.values.comment}
            onChange={formik.handleChange}
            name="comment"
            id="comment"
          />
        </Form>
      </React.Fragment>
    )
  }

  findShareWith() {
    const { presentation, members } = this.props
    if (presentation.nominatedBankId) {
      return `with ${findMemberName(presentation.nominatedBankId, members)}`
    } else if (presentation.issuingBankId) {
      return `with ${findMemberName(presentation.issuingBankId, members)}`
    }
    return ''
  }

  render() {
    const { open, presentation, documents, isSubmitting } = this.props
    return (
      <Modal open={open} size="large">
        <Formik
          initialValues={{ comment: '' }}
          onSubmit={this.handleSubmit}
          validateOnBlur={true}
          validateOnChange={true}
          render={(formik: FormikProps<SubmitPresentation>) => (
            <React.Fragment>
              <Modal.Header>
                Presentation #{presentation.reference}
                <LCReference>{presentation.LCReference}</LCReference>
                <Description>
                  You are about to share {documents.length} documents {this.findShareWith()} for LC application{' '}
                  {presentation.LCReference}
                </Description>
              </Modal.Header>
              <Modal.Content>{this.renderModalContent(formik)}</Modal.Content>
              <Modal.Actions>
                <Button type="button" onClick={() => this.closeModal(formik)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" primary={true} onClick={() => formik.handleSubmit()} disabled={isSubmitting}>
                  Submit
                </Button>
              </Modal.Actions>
            </React.Fragment>
          )}
        />
      </Modal>
    )
  }
}

const CommonCell = styled.span`
  display: inline-block;
  width: 33%;
`

export const LCReference = styled.span`
  font-size: 1rem;
  float: right;
`

const Description = styled.p`
  margin-top: 20px;
  font-size: 1rem;
`

const DocumentName = styled.b`
  width: 170px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  vertical-align: middle;
`

export default SubmitPresentationModal
