import React from 'react'
import { rdQuoteSchema } from '../../utils/constants'
import { FormikProps } from 'formik'
import { PricingType, Currency, IQuoteBase } from '@komgo/types'
import { findFieldFromSchema } from '../../../../store/common/selectors/displaySelectors'
import { MonetaryAmountField } from './MonetaryAmountField'
import { PercentageInputField } from './PercentageInputField'

export interface IPricingTypeFieldProps {
  formik: FormikProps<IQuoteBase>
  pricingType: PricingType
  defaultCurrency?: Currency
  currencyDisabled?: boolean
  labelStyle?: any
  divContainerStyle?: any
  fieldStyle?: any
  inputStyle?: any
}

const QuotePercentageField: React.FC<any> = ({ divContainerStyle, ...props }) => (
  <div style={divContainerStyle}>
    <PercentageInputField schema={rdQuoteSchema} style={props.inputStyle} {...props} />
  </div>
)

export const PricingTypeField: React.FC<IPricingTypeFieldProps> = props => {
  if (props.pricingType === PricingType.AllIn) {
    return <QuotePercentageField name="pricingAllIn" data-test-id="pricingAllIn" {...props} />
  }

  if (props.pricingType === PricingType.Split) {
    return (
      <>
        <QuotePercentageField name="pricingRiskFee" data-test-id="riskFee" {...props} />
        <QuotePercentageField name="pricingMargin" data-test-id="margin" {...props} />
      </>
    )
  }

  if (props.pricingType === PricingType.FlatFee) {
    return (
      <div style={props.divContainerStyle}>
        <label style={props.labelStyle}>{findFieldFromSchema('title', 'pricingFlatFeeAmount', rdQuoteSchema)}</label>
        <MonetaryAmountField
          formik={props.formik}
          name={'pricingFlatFeeAmount'}
          defaultCurrency={props.defaultCurrency || Currency.USD}
          schema={rdQuoteSchema}
          currencyDisabled={props.currencyDisabled}
        />
      </div>
    )
  }

  if (props.pricingType === PricingType.Margin) {
    return <QuotePercentageField name="pricingMargin" data-test-id="margin" {...props} />
  }

  if (props.pricingType === PricingType.RiskFee) {
    return <QuotePercentageField name="pricingRiskFee" data-test-id="riskFee" {...props} />
  }
}
