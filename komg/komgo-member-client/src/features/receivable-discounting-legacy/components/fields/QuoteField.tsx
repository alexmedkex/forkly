import * as React from 'react'
import { IHistory, IQuote, Currency, IHistoryChange, IMonetaryAmount } from '@komgo/types'
import styled from 'styled-components'
import { History } from '../tooltips/History'
import { Field } from '../../../trades/components/Field'
import { formatAgreedTermsHistory } from '../../selectors/historySelectors'
import { isEmpty } from 'lodash'
import { Dimensions } from '../../resources/dimensions'
import { FLAT_FEE__AMOUNT_VIEW_FIELD_NAME } from '../../../receivable-finance/entities/quote/components/DisplayQuote'
import { HistoryWrapper } from '../tooltips/HistoryWrapper'
import { StyledValue } from '../generics/StyledValue'

export interface IQuoteFieldProps {
  fieldName: keyof IQuote | 'provider' | 'comment'
  label: string
  value: React.ReactNode
  history?: IHistory<IQuote>
  sectionName: string
  currency?: Currency
  historyInModal?: boolean
}

const showHistory = (fieldName: string, history: IHistory<IQuote>) => {
  return !isEmpty(history) && history.historyEntry[fieldName]
}

const createHistoryContent = (props: IQuoteFieldProps) => {
  const { fieldName, history: agreedTermsHistory, currency } = props

  if (fieldName === FLAT_FEE__AMOUNT_VIEW_FIELD_NAME) {
    const pricingFlatFeeHistoryAmount = (agreedTermsHistory.historyEntry.pricingFlatFeeAmount as IHistory<
      IMonetaryAmount
    >).historyEntry.amount as Array<IHistoryChange<number>>

    return (
      <History
        fieldName={fieldName}
        history={formatAgreedTermsHistory(fieldName, pricingFlatFeeHistoryAmount, currency)}
      />
    )
  }
  return (
    <History
      fieldName={fieldName}
      history={formatAgreedTermsHistory(fieldName, agreedTermsHistory.historyEntry[fieldName])}
    />
  )
}

export const QuoteField = (props: IQuoteFieldProps) => {
  const { fieldName, label, value, history, sectionName } = props

  const testId = `${sectionName}-value-${fieldName}`
  return (
    <StyledFieldWrapper data-test-id={`${sectionName}-field-component-${fieldName}`}>
      <StyledLabel>{label}</StyledLabel>
      {showHistory(fieldName, history) ? (
        <HistoryWrapper
          {...props}
          history={history}
          createHistoryContent={createHistoryContent}
          header="Agreed terms comment history"
          buttonText="View previous comments"
          testId={testId}
        />
      ) : (
        <StyledValue data-test-id={testId}>{value}</StyledValue>
      )}
    </StyledFieldWrapper>
  )
}

const StyledFieldWrapper = styled(Field)`
  display: block;
  margin-bottom: 10px;

  p {
    vertical-align: top;
    display: inline-block;
  }
`

const StyledLabel = styled.p`
  font-weight: bold;
  width: ${Dimensions.DiscountingRequestInfoFieldLabelWidth};
  text-align: right;
`
