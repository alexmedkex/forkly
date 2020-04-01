import React from 'react'
import FieldDisplay from '../../credit-appetite-shared-components/FieldDisplay'
import { amountWithCurrencyDisplay, percentFormat, daysFormat } from '../../../utils/formatters'
import { IExtendedCreditLine, CreditLineType, IDisclosedCreditLine } from '../../../store/types'
import { IRiskCoverData } from '@komgo/types'
import ActionTimeInfo from '../../credit-appetite-shared-components/ActionTimeInfo'
import { dictionary } from '../../../dictionary'
import { displayDate, dateFormats } from '../../../../../utils/date'
import styled from 'styled-components'

export interface ICounterpartyCreditLineDataViewrops {
  creditLine: IExtendedCreditLine
  feature: CreditLineType
  showFieldVerticalDisplay?: boolean
  hideOptionalLabel?: boolean
}

export class CounterpartyCreditLineDataView extends React.Component<ICounterpartyCreditLineDataViewrops> {
  render() {
    const { creditLine, feature, showFieldVerticalDisplay, hideOptionalLabel } = this.props
    const creditLineData = creditLine.data || ({} as IRiskCoverData)

    const { createOrEdit } = dictionary[feature].financialInstitution

    const defaultFieldProps = { verticalDisplay: showFieldVerticalDisplay }

    return (
      <>
        <FieldDisplay
          {...defaultFieldProps}
          verticalDisplay={showFieldVerticalDisplay}
          label="Appetite"
          value={creditLine.appetite ? 'Yes' : 'No'}
        />
        <FieldDisplay
          {...defaultFieldProps}
          label="Credit limit"
          isOptional={!hideOptionalLabel}
          value={amountWithCurrencyDisplay(creditLine.creditLimit, creditLine.currency)}
        />
        <FieldDisplay {...defaultFieldProps} label="Expiry date" isOptional={!hideOptionalLabel}>
          {creditLine.creditExpiryDate ? displayDate(creditLine.creditExpiryDate, dateFormats.inputs) : '-'}
        </FieldDisplay>
        <FieldDisplay {...defaultFieldProps} label="Availability" value={creditLine.availability ? 'Yes' : 'No'} />
        <FieldDisplay {...defaultFieldProps} label="Amount available" isOptional={!hideOptionalLabel}>
          <span>{amountWithCurrencyDisplay(creditLine.availabilityAmount, creditLine.currency)}</span>
          {creditLine.availabilityAmountUpdatedAt && (
            <ActionTimeInfoPaddingSpan>
              <ActionTimeInfo
                time={creditLine.availabilityAmountUpdatedAt}
                fieldName="amountAvailable"
                prefix="Last updated"
              />
            </ActionTimeInfoPaddingSpan>
          )}
        </FieldDisplay>
        <FieldDisplay {...defaultFieldProps} label="Availability reserved" isOptional={!hideOptionalLabel}>
          <span>{amountWithCurrencyDisplay(creditLineData.availabilityReserved, creditLine.currency)}</span>
          {creditLineData.availabilityReservedUpdatedAt && (
            <ActionTimeInfoPaddingSpan>
              <ActionTimeInfo
                time={creditLineData.availabilityReservedUpdatedAt}
                fieldName="availabilityReserved"
                prefix="Last updated"
              />
            </ActionTimeInfoPaddingSpan>
          )}
        </FieldDisplay>
        <FieldDisplay
          {...defaultFieldProps}
          label={createOrEdit.feeFieldLabel}
          isOptional={!hideOptionalLabel}
          value={percentFormat(creditLineData.fee, '-')}
        />
        <FieldDisplay
          {...defaultFieldProps}
          label="Maximum tenor"
          isOptional={!hideOptionalLabel}
          value={daysFormat(creditLineData.maximumTenor, '-')}
        />
      </>
    )
  }
}

const ActionTimeInfoPaddingSpan = styled.span`
  &&& {
    margin-left: 6px;
  }
`
