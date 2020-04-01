import React from 'react'

import { FormikContext } from 'formik'
import { IReceivablesDiscountingBase, InvoiceType, SupportingInstrument, FinancialInstrument } from '@komgo/types'

import { enumToRadioOptions, RadioController, CustomStyles } from '../../../../letter-of-credit-legacy/components'
import { sentenceCase } from '../../../../../utils/casings'
import { RDFieldWithLabel } from '../../../../receivable-discounting-legacy/components/fields/RDFieldWithLabel'
import { MultiSelectDropdown } from '../../../../../components/styled-components'
import { RDInvoiceAmountAndCurrency } from '../../../../receivable-discounting-legacy/components/fields/RDInvoiceAmountWithCurrencyField'
import { borderLabelStyling } from '../../../../receivable-discounting-legacy/utils/styles'
import { Form } from 'semantic-ui-react'
import { RDInputFieldLogic } from '../../../../receivable-discounting-legacy/presentation/RDInputFieldLogic'

export interface IEditDiscountingRequestFieldsProps {
  formik: FormikContext<IReceivablesDiscountingBase>
}

export const EditDiscountingRequestFields: React.FC<IEditDiscountingRequestFieldsProps> = ({ formik }) => {
  const { values } = formik
  return (
    <Form data-test-id="edit-discounting-request-form" id="edit-discounting-request-form">
      <RDInvoiceAmountAndCurrency currencyDisabled={true} formik={formik} />

      <RDFieldWithLabel
        name="invoiceType"
        formik={formik}
        component={RadioController}
        options={enumToRadioOptions(InvoiceType)}
        stylingValues={radioStylingValues}
      />

      <RDFieldWithLabel
        formik={formik}
        name="advancedRate"
        type="number"
        value={values.advancedRate}
        disabled={true}
        step="0.01"
        labelPosition="right"
        label={{ basic: true, content: '%', style: borderLabelStyling }}
      />

      {RDInputFieldLogic.shouldShowRiskCoverFields(values.requestType, values.discountingType) && (
        <RDFieldWithLabel name="riskCoverDate" formik={formik} type="date" value={values.riskCoverDate} />
      )}
      {RDInputFieldLogic.shouldShowRiskCoverFields(values.requestType, values.discountingType) && (
        <RDFieldWithLabel
          name="numberOfDaysRiskCover"
          formik={formik}
          type="number"
          disabled={true}
          value={values.numberOfDaysRiskCover}
        />
      )}

      {RDInputFieldLogic.shouldShowDiscountingFields(values.requestType) && (
        <RDFieldWithLabel name="discountingDate" formik={formik} type="date" value={values.discountingDate} />
      )}

      {RDInputFieldLogic.shouldShowDiscountingFields(values.requestType) && (
        <RDFieldWithLabel
          name="numberOfDaysDiscounting"
          formik={formik}
          type="number"
          disabled={true}
          value={values.numberOfDaysDiscounting}
        />
      )}

      <RDFieldWithLabel name="dateOfPerformance" formik={formik} type="date" value={values.dateOfPerformance} />

      <RDFieldWithLabel
        formik={formik}
        name="supportingInstruments"
        component={MultiSelectDropdown}
        options={Object.values(SupportingInstrument).map(v => ({
          key: v,
          text: sentenceCase(v),
          value: v
        }))}
        value={values.supportingInstruments}
        multiple={true}
        selection={true}
        placeholder="Select Supporting Instruments"
      />

      {RDInputFieldLogic.shouldShowFinancialInstrumentFields(values.supportingInstruments) && (
        <RDFieldWithLabel
          formik={formik}
          name="financialInstrumentInfo.financialInstrument"
          component={RadioController}
          options={enumToRadioOptions(FinancialInstrument)}
          stylingValues={radioStylingValues}
          error={undefined}
        />
      )}

      {RDInputFieldLogic.shouldShowFinancialInstrumentOtherField(
        values.supportingInstruments,
        values.financialInstrumentInfo
      ) && (
        <RDFieldWithLabel
          formik={formik}
          name="financialInstrumentInfo.financialInstrumentIfOther"
          value={values.financialInstrumentInfo.financialInstrumentIfOther}
          marginLeftLabel={100}
          customFieldWidth={'36%'}
        />
      )}
      {RDInputFieldLogic.shouldShowFinancialInstrumentFields(values.supportingInstruments) && (
        <RDFieldWithLabel
          formik={formik}
          name="financialInstrumentInfo.financialInstrumentIssuerName"
          value={values.financialInstrumentInfo.financialInstrumentIssuerName}
        />
      )}

      {RDInputFieldLogic.shouldShowGuarantor(values.supportingInstruments) && (
        <RDFieldWithLabel formik={formik} name="guarantor" value={values.guarantor} />
      )}

      <RDFieldWithLabel formik={formik} name="comment" value={values.comment} type="textarea" />
    </Form>
  )
}

const radioColumnStyling = {
  width: '240px'
}

const radioFieldStyling = {
  margin: 0
}

const radioStylingValues: CustomStyles = {
  columnStyle: radioColumnStyling,
  fieldStyle: radioFieldStyling
}
