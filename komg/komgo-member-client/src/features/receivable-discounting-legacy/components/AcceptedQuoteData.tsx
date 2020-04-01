import { IQuote, IQuoteBase, IHistory, RequestType, DiscountingType, IReceivablesDiscounting } from '@komgo/types'
import moment from 'moment'
import * as React from 'react'
import styled from 'styled-components'
import { MinimalAccordionWrapper } from '../../../components/accordion/MinimalAccordionWrapper'
import { DisplayQuote } from '../../receivable-finance/entities/quote/components/DisplayQuote'
import { Button } from 'semantic-ui-react'
import { Formik, FormikProps } from 'formik'
import { EditAcceptedQuoteFields } from '../../receivable-finance/pages/view-request/components/EditAcceptedQuoteFields'
import { MultiErrorMessage } from '../../../components/error-message'
import { formikQuoteAcceptedErrors } from '../utils/errors'
import { decorateQuoteForInitialValues, createEditQuoteValidator } from '../utils/edit-utils'
import { StatusText } from './generics/StatusText'

export interface IAcceptedQuoteData {
  index: string
  open: boolean
  quote: IQuote
  isSubmitting: boolean
  isEditing: boolean
  editable: boolean
  comment?: string
  replyDate?: string
  provider?: string
  agreedTermsHistory: IHistory<IQuote>
  changed: boolean
  rd: IReceivablesDiscounting
  handleSubmit: (values: IQuoteBase) => void
  handleEditClicked: () => void
  handleCancelClicked: () => void
  handleToggleAccordion: () => void
}

const AcceptedQuoteData: React.FC<IAcceptedQuoteData> = ({
  index,
  open,
  quote,
  comment,
  replyDate,
  provider,
  editable,
  isEditing,
  changed,
  isSubmitting,
  handleCancelClicked,
  handleEditClicked,
  handleToggleAccordion,
  handleSubmit,
  agreedTermsHistory,
  rd
}) => {
  const initialValues = quote ? decorateQuoteForInitialValues(quote) : {}
  const actions = formik =>
    isEditing ? (
      <>
        <Button
          content={'Save'}
          data-test-id="save-accepted-quote"
          primary={true}
          type="submit"
          disabled={isSubmitting}
          onClick={e => {
            e.stopPropagation()
            formik.handleSubmit(e)
          }}
        />
        <Button
          content={'Cancel'}
          data-test-id="savecancel-edit-accepted-quote"
          disabled={isSubmitting}
          onClick={e => {
            e.stopPropagation()
            formik.resetForm()
            handleCancelClicked()
          }}
        />
      </>
    ) : editable ? (
      <Button
        content={'Edit'}
        data-test-id="edit-accepted-quote"
        onClick={e => {
          e.stopPropagation()
          handleEditClicked()
        }}
      />
    ) : null

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validate={createEditQuoteValidator(initialValues, rd)}
      validateOnBlur={false}
      validateOnChange={true}
      render={(formik: FormikProps<IQuoteBase>) => (
        <>
          <MinimalAccordionWrapper
            buttons={actions(formik)}
            active={open}
            handleClick={handleToggleAccordion}
            index={index}
            highlight={changed}
            title="Agreed terms"
          >
            {formikQuoteAcceptedErrors(formik).length > 0 ? (
              <MultiErrorMessage
                data-test-id="edit-quote-accepted-validation-errors"
                title=""
                messages={formikQuoteAcceptedErrors(formik)}
              />
            ) : null}
            <StatusText data-test-id="quote-section-status-text" margin="0 0 0 28px">
              <UpperCaseText>Quote accepted - {moment(quote.createdAt).format('DD/MM/YYYY [at] HH:mm')}</UpperCaseText>
            </StatusText>
            {isEditing ? (
              <EditAcceptedQuoteFields data-test-id="edit-accepted-quote-panel" formik={formik} rd={rd} />
            ) : (
              <DisplayQuote
                quote={quote}
                provider={provider}
                comment={comment}
                replyDate={replyDate}
                agreedTermsHistory={agreedTermsHistory}
                sectionName="agreedTerms"
                requestType={rd.requestType}
                discountingType={rd.discountingType}
              />
            )}
          </MinimalAccordionWrapper>
        </>
      )}
    />
  )
}

const UpperCaseText = styled.span`
  &&& {
    text-transform: uppercase;
  }
`

export default AcceptedQuoteData
