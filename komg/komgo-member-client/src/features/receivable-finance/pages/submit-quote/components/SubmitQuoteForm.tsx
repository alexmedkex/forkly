import React from 'react'
import { initialSubmitQuoteData } from '../../../../receivable-discounting-legacy/utils/constants'
import { FormikProps, Formik } from 'formik'
import { ISubmitQuoteFormDetails } from '../../../../receivable-discounting-legacy/store/types'
import { IReceivablesDiscountingInfo, IQuoteBase } from '@komgo/types'
import { SPACES } from '@komgo/ui-components'
import SubmitQuoteModalFormErrors from '../../../../receivable-discounting-legacy/components/receivable-discounting-application/SubmitQuoteModalFormErrors'
import { SubmitQuoteFields } from './SubmitQuoteFields'
import { Form, Button } from 'semantic-ui-react'
import { StatusText } from '../../../../receivable-discounting-legacy/components/generics/StatusText'
import { ModalPrompt } from '../../../../../components/modal-prompt/ModalPrompt'
import {
  sanitizeQuoteForValidation,
  sanitizeQuoteForSubmit
} from '../../../../receivable-discounting-legacy/utils/sanitize'
import { rdValidator } from '../../../../receivable-discounting-legacy/utils/RDValidator'
import { ServerError } from '../../../../../store/common/types'

export interface ISubmitQuoteFormProps {
  discountingRequest: IReceivablesDiscountingInfo
  sellerName: string
  rdId: string
  isSubmitting: boolean
  bankCreateQuote: (quote: IQuoteBase, rdId: string) => void
  receivablesDiscountingError?: string | ServerError
}

export interface ISubmitQuoteFormState {
  openConfirm: boolean
}

export class SubmitQuoteForm extends React.Component<ISubmitQuoteFormProps, ISubmitQuoteFormState> {
  state = {
    openConfirm: false
  }

  handleSubmit = (values: IQuoteBase) => {
    this.setState({
      openConfirm: true
    })

    this.props.bankCreateQuote(sanitizeQuoteForSubmit(values), this.props.rdId)
  }

  handleCancelSubmit = () =>
    this.setState({
      openConfirm: false
    })

  validate = (values: ISubmitQuoteFormDetails) =>
    rdValidator.validateQuoteSubmission(sanitizeQuoteForValidation(values), this.props.discountingRequest.rd)

  render() {
    const { discountingRequest, sellerName, isSubmitting, receivablesDiscountingError } = this.props
    const { openConfirm } = this.state

    return (
      <>
        <Formik
          initialValues={initialSubmitQuoteData(
            discountingRequest.rd.currency,
            discountingRequest.rd.requestType,
            discountingRequest.rd.discountingType
          )}
          onSubmit={this.handleSubmit}
          validate={this.validate}
          validateOnBlur={false}
          validateOnChange={true}
          render={(formik: FormikProps<ISubmitQuoteFormDetails>) => (
            <>
              <Form onSubmit={formik.handleSubmit} id="bank-submit-quote-form" data-test-id="bank-submit-quote-form">
                <SubmitQuoteModalFormErrors formik={formik} />
                <SubmitQuoteFields formik={formik} discountingRequest={discountingRequest} sellerName={sellerName} />

                <StatusText
                  data-test-id="submitted-quote-section-status-text"
                  fontSize="1rem"
                  margin={`${SPACES.DEFAULT} 0 0 0`}
                >
                  The quote submitted is not legally binding
                </StatusText>
              </Form>
              <ModalPrompt
                header={'Submit Quote'}
                loadingTransitionTitle={'Generating discounting quote'}
                open={openConfirm}
                loading={isSubmitting}
                errorTitle={'Failed to submit quote'}
                error={receivablesDiscountingError as string}
                actions={
                  <>
                    <Button
                      onClick={this.handleCancelSubmit}
                      data-test-id="cancel-submit-button"
                      content="Cancel"
                      disabled={isSubmitting}
                    />
                  </>
                }
              />
            </>
          )}
        />
      </>
    )
  }
}
