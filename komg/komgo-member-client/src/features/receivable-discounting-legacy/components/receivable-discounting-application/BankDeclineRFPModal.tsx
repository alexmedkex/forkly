import { IReceivablesDiscountingInfo } from '@komgo/types'
import { connect, Field, Formik, FormikContext, FormikProps } from 'formik'
import * as React from 'react'
import { Button, Form, Header, Modal } from 'semantic-ui-react'
import Text from '../../../../components/text'
import { stringOrNull } from '../../../../utils/types'
import { TextAreaController } from '../../../letter-of-credit-legacy/components/InputControllers'
import { findFieldFromSchema } from '../../../../store/common/selectors/displaySelectors'
import { IBankDeclineRFPFormDetails, IRFPReply } from '../../store/types'
import { initialBankDeclineRFPData, rdQuoteSchema, ReceivableDiscountingModal } from '../../utils/constants'
import SubmitStatus from './SubmitStatus'
import { displaySimpleRequestType } from '../../utils/displaySelectors'

export interface BankDeclineRFPModalOwnProps {
  visible: boolean
  tradeId: string
  discountingRequest?: IReceivablesDiscountingInfo
  sellerName?: string
  buyerName?: string
  rdId: string
  rdError: stringOrNull
  bankDeclineRFPLoader: boolean
  toggleVisible(modal: string): void
  bankDeclineRFP(values: IRFPReply): void
}

interface BankDeclineRFPModalState {
  values: IBankDeclineRFPFormDetails
  openConfirm?: boolean
}

export type BankDeclineRFPModalProps = BankDeclineRFPModalOwnProps & {
  formik: FormikContext<IBankDeclineRFPFormDetails>
}

class BankDeclineRFPModal extends React.Component<BankDeclineRFPModalProps, BankDeclineRFPModalState> {
  constructor(props: BankDeclineRFPModalProps) {
    super(props)
    this.state = {
      openConfirm: false,
      values: initialBankDeclineRFPData
    }
  }

  handleSubmit = (values: IBankDeclineRFPFormDetails, formik: FormikProps<IBankDeclineRFPFormDetails>) => {
    const { rdId, bankDeclineRFP } = this.props
    formik.setSubmitting(false)
    this.setState({
      openConfirm: true
    })

    const bankDeclineRFPData: IRFPReply = {
      comment: values.comment,
      rdId
    }

    bankDeclineRFP(bankDeclineRFPData)
  }

  handleCancelSubmit = () => {
    this.setState({
      openConfirm: false
    })
  }

  handleCloseModal = (formik: FormikProps<IBankDeclineRFPFormDetails>) => {
    formik.resetForm()
    this.props.toggleVisible(ReceivableDiscountingModal.Decline)
  }

  render() {
    const { tradeId, sellerName, buyerName, rdError, bankDeclineRFPLoader, visible, discountingRequest } = this.props

    return (
      <Formik
        initialValues={initialBankDeclineRFPData}
        onSubmit={this.handleSubmit}
        render={(formik: FormikProps<IBankDeclineRFPFormDetails>) => {
          const { handleSubmit } = formik

          return (
            <React.Fragment>
              <Modal
                data-test-id="bank-decline-rfp-modal"
                open={visible}
                centered={true}
                style={{ top: 'unset', width: '680px' }}
              >
                <Modal.Content>
                  <Header as="h1" content="Decline discounting request" />
                  <p>
                    You are declining a{' '}
                    {discountingRequest
                      ? `${displaySimpleRequestType(discountingRequest.rd.requestType).toLocaleLowerCase()} request`
                      : 'request'}{' '}
                    for <Text bold={true}>Trade ID {tradeId}</Text> from {sellerName} for a quote on{' '}
                    <Text bold={true}>{buyerName}</Text>.
                  </p>
                  <Form onSubmit={handleSubmit} id="bank-decline-rfp-form">
                    <label style={{ fontWeight: 'bold' }}>
                      {findFieldFromSchema('title', 'comment', rdQuoteSchema)}
                    </label>
                    <Field component={TextAreaController} name="comment" data-test-id="comment" />
                  </Form>
                </Modal.Content>
                <Modal.Actions>
                  <Button
                    className="ui button"
                    role="button"
                    onClick={() => this.handleCloseModal(formik)}
                    data-test-id="bank-decline-rfp-cancel-btn"
                  >
                    Cancel
                  </Button>
                  <Button
                    primary={true}
                    content="Decline request"
                    form="bank-decline-rfp-form"
                    type="submit"
                    data-test-id="bank-decline-rfp-submit-btn"
                  />
                </Modal.Actions>
                <SubmitStatus
                  title="Decline Request"
                  actionText="Declining request"
                  isSubmitting={bankDeclineRFPLoader}
                  open={this.state.openConfirm}
                  cancelSubmit={this.handleCancelSubmit}
                  error={rdError}
                />
              </Modal>
            </React.Fragment>
          )
        }}
      />
    )
  }
}

export default connect<BankDeclineRFPModalOwnProps, IBankDeclineRFPFormDetails>(BankDeclineRFPModal)
