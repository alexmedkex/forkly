import { IQuote, IReceivablesDiscountingInfo } from '@komgo/types'
import moment from 'moment'
import * as React from 'react'

import { MinimalAccordionWrapper } from '../../../components/accordion/MinimalAccordionWrapper'
import { DisplayQuote } from '../../receivable-finance/entities/quote/components/DisplayQuote'
import { UpperCaseText } from './generics/UpperCaseText'
import { StatusText } from './generics/StatusText'

export interface ISubmittedQuoteSectionProps {
  discountingRequest: IReceivablesDiscountingInfo
  index: string
  isSubmittedQuoteAccordionOpen: boolean
  submittedQuote: IQuote
  comment?: string
  handleClick: (e: React.SyntheticEvent, titleProps: any) => void
}

export default class SubmittedQuoteSection extends React.Component<ISubmittedQuoteSectionProps> {
  render() {
    const {
      index,
      handleClick,
      isSubmittedQuoteAccordionOpen,
      submittedQuote,
      comment,
      discountingRequest
    } = this.props

    const submittedQuoteTimestamp = (quote: IQuote): string => moment(quote.createdAt).format('DD/MM/YYYY [at] HH:mm')

    return (
      <MinimalAccordionWrapper
        active={isSubmittedQuoteAccordionOpen}
        handleClick={handleClick}
        index={index}
        title="Submitted quote"
      >
        <StatusText data-test-id="submitted-quote-section-status-text" margin="0 0 0 28px">
          <UpperCaseText>Quote submitted - {submittedQuoteTimestamp(submittedQuote)}</UpperCaseText>
        </StatusText>
        <DisplayQuote
          quote={submittedQuote}
          comment={comment}
          sectionName="submittedQuote"
          requestType={discountingRequest.rd.requestType}
          discountingType={discountingRequest.rd.discountingType}
        />
      </MinimalAccordionWrapper>
    )
  }
}
