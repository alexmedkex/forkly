import { IReceivablesDiscounting, IHistory } from '@komgo/types'
import React from 'react'
import styled from 'styled-components'
import { Field } from '../../../trades/components/Field'
import { History } from '../tooltips/History'
import {
  formatRdHistory,
  formatMergedInvoiceAmount,
  INVOICE_AMOUNT,
  getHistoryEntry,
  FINANCIAL_INSTRUMENT,
  formatFinancialInstrument,
  FINANCIAL_INSTRUMENT_INFO,
  shouldShowHistory
} from '../../selectors/historySelectors'
import { rdDiscountingSchema } from '../../utils/constants'
import { findFieldFromSchema } from '../../../../store/common/selectors/displaySelectors'
import { Dimensions } from '../../resources/dimensions'
import { HistoryWrapper } from '../tooltips/HistoryWrapper'
import { StyledValue } from '../generics/StyledValue'

export interface IDiscountingRequestInfoFieldProps {
  fieldName: string
  value: React.ReactNode
  history: IHistory<IReceivablesDiscounting>
  rd: IReceivablesDiscounting
  historyInModal?: boolean
}

const createHistoryContent = (props: IDiscountingRequestInfoFieldProps) => {
  if (props.fieldName === INVOICE_AMOUNT) {
    return (
      <History fieldName={props.fieldName} history={formatMergedInvoiceAmount(props.history.historyEntry, props.rd)} />
    )
  }

  if (props.fieldName === FINANCIAL_INSTRUMENT) {
    return (
      <History
        fieldName={props.fieldName}
        history={formatFinancialInstrument(props.history.historyEntry[FINANCIAL_INSTRUMENT_INFO])}
      />
    )
  }

  return (
    <History
      fieldName={props.fieldName}
      history={formatRdHistory(props.fieldName, getHistoryEntry(props.fieldName, props.history), props.rd.currency)}
    />
  )
}

export const DiscountingRequestInfoField: React.FC<IDiscountingRequestInfoFieldProps> = props => {
  const { fieldName, value, history } = props

  return (
    <StyledField data-test-id={`rdInfo-field-component-${fieldName}`}>
      <StyledLabel>{findFieldFromSchema('title', fieldName, rdDiscountingSchema)}</StyledLabel>
      {shouldShowHistory(fieldName, history) ? (
        <HistoryWrapper
          {...props}
          createHistoryContent={createHistoryContent}
          header="Other information history"
          buttonText="View previous information"
          testId={`rdInfo-value-${fieldName}`}
        />
      ) : (
        <StyledValue>{value}</StyledValue>
      )}
    </StyledField>
  )
}

const StyledField = styled(Field)`
  display: block;
  margin-bottom: 10px;

  p {
    vertical-align: top;
    display: inline-block;
  }
`

export const StyledLabel = styled.p`
  font-weight: bold;
  width: ${Dimensions.DiscountingRequestInfoFieldLabelWidth};
  text-align: right;
`
