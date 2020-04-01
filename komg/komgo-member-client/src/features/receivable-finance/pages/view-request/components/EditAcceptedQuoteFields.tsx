import React from 'react'

import { FormikContext, Field } from 'formik'
import { IQuoteBase, InterestType, LiborType, Currency, IReceivablesDiscounting } from '@komgo/types'
import { FieldWithLabel } from '../../../../trades/components/Field'
import { isErrorActive } from '../../../../trades/utils/isErrorActive'
import Numeral from 'numeral'
import { GridTextController } from '../../../../letter-of-credit-legacy/components'
import { rdQuoteSchema } from '../../../../receivable-discounting-legacy/utils/constants'
import { FieldStyling } from '../../../../trades/components/trade-form-fields/TradeData'
import { sentenceCase } from '../../../../../utils/casings'
import styled from 'styled-components'
import BasicPanel from '../../../../trades/components/BasicPanel'
import { findFieldFromSchema } from '../../../../../store/common/selectors/displaySelectors'
import { PricingTypeField } from '../../../../receivable-discounting-legacy/components/fields/PricingTypeField'
import { MaturityInputFieldWithLabel } from '../../../../receivable-discounting-legacy/components/fields/MaturityInputFieldWithLabel'
import { PercentageInputField } from '../../../../receivable-discounting-legacy/components/fields/PercentageInputField'
import { interestTypeDisplayValue } from '../../../../receivable-discounting-legacy/utils/displaySelectors'
import { Dimensions } from '../../../../receivable-discounting-legacy/resources/dimensions'
import { borderLabelStyling } from '../../../../receivable-discounting-legacy/utils/styles'
import { QuoteInputFieldLogic } from '../../../../receivable-discounting-legacy/presentation/QuoteInputFieldLogic'
import { Form } from 'semantic-ui-react'

export interface IEditAcceptedQuoteFieldsProps {
  formik: FormikContext<IQuoteBase>
  rd: IReceivablesDiscounting
}

export const EditAcceptedQuoteFields: React.FC<IEditAcceptedQuoteFieldsProps> = ({ formik, rd }) => {
  const { values, setFieldValue, setFieldTouched, errors, touched } = formik
  return (
    <BasicPanel padding="10px 0 10px 0">
      <Form data-test-id="edit-agreed-terms-form" id="edit-agreed-terms-form">
        <FieldWithLabel customWidth={Dimensions.FormInputLabelWidth}>
          <Field
            name="advanceRate"
            type="number"
            step="0.01"
            fieldName={findFieldFromSchema('title', 'advanceRate', rdQuoteSchema)}
            error={isErrorActive('advanceRate', errors, touched)}
            formatAsString={(v: number) => Numeral(v).format('0,0.00')}
            setFieldValue={setFieldValue}
            setFieldTouched={setFieldTouched}
            initialValue={values.advanceRate}
            fieldStyle={BoldFieldStyling}
            label={{ basic: true, content: '%', style: borderLabelStyling }}
            labelPosition="right"
            component={GridTextController}
            data-test-id="advanceRate"
          />
        </FieldWithLabel>
        <PricingInputFields formik={formik} />
        {QuoteInputFieldLogic.shouldShowRiskCoverFields(rd.requestType, rd.discountingType) && (
          <FieldWithLabel customWidth={Dimensions.FormInputLabelWidth}>
            <Field
              name="numberOfDaysRiskCover"
              type="number"
              fieldStyle={BoldFieldStyling}
              fieldName={findFieldFromSchema('title', 'numberOfDaysRiskCover', rdQuoteSchema)}
              error={isErrorActive('numberOfDaysRiskCover', errors, touched)}
              formatAsString={(v: number) => Numeral(v).format('0,0.00')}
              setFieldValue={setFieldValue}
              setFieldTouched={setFieldTouched}
              initialValue={values.numberOfDaysRiskCover}
              defaultValue={0}
              component={GridTextController}
              data-test-id="numberOfDaysRiskCover"
            />
          </FieldWithLabel>
        )}
        {QuoteInputFieldLogic.shouldShowDiscountingFields(rd.requestType) && (
          <FieldWithLabel customWidth={Dimensions.FormInputLabelWidth}>
            <Field
              name="numberOfDaysDiscounting"
              type="number"
              fieldStyle={BoldFieldStyling}
              fieldName={findFieldFromSchema('title', 'numberOfDaysDiscounting', rdQuoteSchema)}
              error={isErrorActive('numberOfDaysDiscounting', errors, touched)}
              formatAsString={(v: number) => Numeral(v).format('0,0.00')}
              setFieldValue={setFieldValue}
              setFieldTouched={setFieldTouched}
              initialValue={values.numberOfDaysDiscounting}
              defaultValue={0}
              component={GridTextController}
              data-test-id="numberOfDaysDiscounting"
            />
          </FieldWithLabel>
        )}
        {QuoteInputFieldLogic.shouldShowInterestTypeFields(rd.requestType) && <InterestInputFields formik={formik} />}
        <FieldWithLabel customWidth={Dimensions.FormInputLabelWidth}>
          <Field
            name="comment"
            type="textarea"
            fieldStyle={BoldFieldStyling}
            fieldName={findFieldFromSchema('title', 'comment', rdQuoteSchema)}
            error={isErrorActive('comment', errors, touched)}
            setFieldValue={setFieldValue}
            setFieldTouched={setFieldTouched}
            component={GridTextController}
            data-test-id="comment"
          />
        </FieldWithLabel>
      </Form>
    </BasicPanel>
  )
}

interface IEditAcceptedQuoteSectionProps {
  formik: FormikContext<IQuoteBase>
}

export const InterestInputFields: React.FC<IEditAcceptedQuoteSectionProps> = ({ formik }) => {
  const values = formik.values
  return (
    <>
      <StyledLabelFieldWrapper>
        <b>{findFieldFromSchema('title', 'interestType', rdQuoteSchema)}</b>
        <label data-test-id="label-interest-type">
          {interestTypeDisplayValue(values.interestType, values.liborType)}
        </label>
      </StyledLabelFieldWrapper>
      {values.interestType === InterestType.CostOfFunds && (
        <FieldWithLabel customWidth={Dimensions.FormInputLabelWidth}>
          <Field
            name="indicativeCof"
            type="number"
            step="0.01"
            fieldStyle={BoldFieldStyling}
            fieldName={findFieldFromSchema('title', 'indicativeCof', rdQuoteSchema)}
            error={isErrorActive('indicativeCof', formik.errors, formik.touched)}
            disabled={false}
            formatAsString={(v: number) => Numeral(v).format('0,0.00')}
            setFieldValue={formik.setFieldValue}
            setFieldTouched={formik.setFieldTouched}
            initialValue={values.indicativeCof}
            component={GridTextController}
            data-test-id="indicativeCof"
          />
        </FieldWithLabel>
      )}
      {values.interestType === InterestType.AddOnLibor && (
        <div style={fieldDivContainerStyle}>
          <PercentageInputField
            schema={rdQuoteSchema}
            name="addOnValue"
            data-test-id="addOnValue"
            formik={formik}
            labelStyle={fieldLabelStyle}
            fieldStyle={fieldStyle}
            inputStyle={fieldInputStyle}
          />
        </div>
      )}
      {isLiborPublised(values) && (
        <div style={fieldDivContainerStyle}>
          <MaturityInputFieldWithLabel
            formik={formik}
            fieldStyling={fieldStyle}
            labelStyle={fieldLabelStyle}
            inputStyle={fieldInputStyle}
          />
        </div>
      )}

      <StyledLabelFieldWrapper>
        <b>{findFieldFromSchema('title', 'feeCalculationType', rdQuoteSchema)}</b>
        <label data-test-id="label-fee-calculation-type">{sentenceCase(values.feeCalculationType)}</label>
      </StyledLabelFieldWrapper>
    </>
  )
}

export const PricingInputFields: React.FC<IEditAcceptedQuoteSectionProps> = ({ formik }) => {
  const values = formik.values
  return (
    <>
      <StyledLabelFieldWrapper>
        <b>{findFieldFromSchema('title', 'pricingType', rdQuoteSchema)}</b>
        <label data-test-id="label-pricing-type">{sentenceCase(values.pricingType)}</label>
      </StyledLabelFieldWrapper>
      <PricingTypeField
        pricingType={values.pricingType}
        formik={formik}
        currencyDisabled={true}
        defaultCurrency={values.pricingFlatFeeAmount ? values.pricingFlatFeeAmount.currency : Currency.USD}
        labelStyle={fieldLabelStyle}
        divContainerStyle={fieldDivContainerStyle}
        fieldStyle={fieldStyle}
        inputStyle={fieldInputStyle}
      />
    </>
  )
}

function isLiborPublised(values: IQuoteBase) {
  return values.interestType !== InterestType.CostOfFunds && values.liborType === LiborType.Published
}

export const FieldWithLableExt = styled(FieldWithLabel)`
  &&&&& {
    .field {
      .selection.dropdown {
        width: 30% !important;
      }
    }
  }
`

export const BoldFieldStyling = { ...FieldStyling, fontWeight: 'bold' }

const fieldDivContainerStyle = { display: 'flex', maxWidth: '720px', alignItems: 'center', marginBottom: '5px' }

const fieldStyle = {
  width: '50%'
}

const fieldLabelStyle = {
  width: Dimensions.FormInputLabelWidth,
  marginRight: 0,
  display: 'inline-block',
  textAlign: 'right',
  paddingRight: '20px',
  fontWeight: 'bold'
}

const fieldInputStyle = {
  width: '100%'
}

const StyledLabelFieldWrapper = styled.div`
  &&&&& {
    b {
      width: ${Dimensions.FormInputLabelWidth};
      margin-right: 0;
      display: inline-block;
      text-align: right;
      padding-right: 20px;
      }
      margin-bottom: 5px;
      line-height: 2;
      height: 32px;
      align-items: center;
      display: flex;
    }
  }
`
