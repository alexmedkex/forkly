import { IQuote, IReceivablesDiscounting } from '@komgo/types'
import { connect, Formik, FormikContext, FormikProps } from 'formik'
import * as React from 'react'
import { Form, Button } from 'semantic-ui-react'
import styled from 'styled-components'
import { ErrorMessage } from '../../../../components'
import { stringOrNull } from '../../../../utils/types'
import { ISubmitQuoteFormDetails } from '../../store/types'
import { initialAcceptQuoteData } from '../../utils/constants'
import SubmitQuoteModalFormErrors from './SubmitQuoteModalFormErrors'
import TraderAcceptQuoteSubmitConfirm from './TraderAcceptQuoteSubmitConfirm'
import { sanitizeQuoteForValidation, sanitizeQuoteForSubmit } from '../../utils/sanitize'
import { rdValidator } from '../../utils/RDValidator'
import AcceptQuoteFields from '../../../receivable-finance/pages/accept-quote/components/AcceptQuoteFields'
import { displaySimpleRequestType } from '../../utils/displaySelectors'

export interface TraderAcceptQuoteFormOwnProps {
  rdId: string
  quote: IQuote
  bankName: string
  tradeId: string
  rdError: stringOrNull
  participantStaticId: string
  traderSubmitQuoteLoader: boolean
  rd: IReceivablesDiscounting
  traderCreateQuote(values: ISubmitQuoteFormDetails, rdId: string, participantStaticId: string): void
}

interface TraderAcceptQuoteFormState {
  values: ISubmitQuoteFormDetails
  openConfirm?: boolean
}

export type TraderAcceptQuoteFormProps = TraderAcceptQuoteFormOwnProps & {
  formik: FormikContext<ISubmitQuoteFormDetails>
}

class TraderAcceptQuoteForm extends React.Component<TraderAcceptQuoteFormProps, TraderAcceptQuoteFormState> {
  constructor(props: TraderAcceptQuoteFormProps) {
    super(props)
    this.state = {
      openConfirm: false,
      values: initialAcceptQuoteData(props.quote, props.rd.currency, props.rd.requestType)
    }
  }

  validate = (values: ISubmitQuoteFormDetails) => {
    const { rd } = this.props
    const cleaned = sanitizeQuoteForValidation(values)
    return rdValidator.validateQuoteSubmission(cleaned, rd)
  }

  handleSubmit = (values: ISubmitQuoteFormDetails, formik: FormikProps<ISubmitQuoteFormDetails>) => {
    formik.setSubmitting(false)
    const cleaned = sanitizeQuoteForSubmit(values)
    this.setState({
      openConfirm: true,
      values: cleaned
    })
  }

  handleConfirmSubmit = () => {
    const { values } = this.state
    const { rdId, traderCreateQuote, participantStaticId } = this.props
    traderCreateQuote(values, rdId, participantStaticId)
  }

  handleCancelSubmit = () => {
    this.setState({
      openConfirm: false
    })
  }

  render() {
    const { rdError, traderSubmitQuoteLoader, bankName, quote, tradeId, rd } = this.props

    const initialValues = initialAcceptQuoteData(quote, rd.currency, rd.requestType, rd.discountingType)

    const requestType = displaySimpleRequestType(rd.requestType).toLocaleLowerCase()

    return (
      <>
        <AcceptQuoteParagraph data-test-id="request-header-text">
          Enter agreed terms to accept {requestType} quote from <strong>{bankName} </strong>
          for <strong>trade ID {tradeId}</strong>.
        </AcceptQuoteParagraph>
        <Formik
          initialValues={initialValues}
          onSubmit={this.handleSubmit}
          validate={this.validate}
          validateOnBlur={false}
          validateOnChange={true}
          render={(formik: FormikProps<ISubmitQuoteFormDetails>) => (
            <Form onSubmit={formik.handleSubmit} id="trader-accept-quote-form" data-test-id="trader-accept-quote-form">
              <SubmitQuoteModalFormErrors formik={formik} />
              {rdError && <ErrorMessage title="Something went wrong" error={rdError} />}
              <AcceptQuoteFields formik={formik} bank={bankName} quote={quote} rd={rd} />
              <TraderAcceptQuoteSubmitConfirm
                title="Accept quote and submit final terms"
                actionText={
                  <div>
                    <p>
                      You are about to accept a quote for {displaySimpleRequestType(rd.requestType).toLocaleLowerCase()}{' '}
                      on <strong>trade ID {tradeId}</strong> from <strong>{bankName}</strong>.
                    </p>

                    <p>When accepting a quote all other quotes will be automatically declined.</p>
                  </div>
                }
                loadingText={'Submitting accepted quote terms'}
                buttonText={'Accept quote'}
                isSubmitting={traderSubmitQuoteLoader}
                open={this.state.openConfirm}
                cancelSubmit={this.handleCancelSubmit}
                confirmSubmit={this.handleConfirmSubmit}
                error={rdError}
              />
            </Form>
          )}
        />
      </>
    )
  }
}

const AcceptQuoteParagraph = styled.p`
  &&& {
    margin: 1.5em 0 1.75em;
  }
`

export default connect<TraderAcceptQuoteFormOwnProps, ISubmitQuoteFormDetails>(TraderAcceptQuoteForm)
