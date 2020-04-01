import {
  IReceivablesDiscountingBase,
  InvoiceType,
  SupportingInstrument,
  FinancialInstrument,
  DiscountingType,
  RequestType
} from '@komgo/types'
import { FormikContext } from 'formik'
import * as React from 'react'
import { MinimalAccordionWrapper } from '../../../../../components/accordion/MinimalAccordionWrapper'
import {
  CustomStyles,
  enumToRadioOptions,
  RadioController
} from '../../../../letter-of-credit-legacy/components/InputControllers'
import BasicPanel from '../../../../trades/components/BasicPanel'
import { sentenceCase } from '../../../../../utils/casings'
import { RDFieldWithLabel } from '../../../../receivable-discounting-legacy/components/fields/RDFieldWithLabel'
import { MultiSelectDropdown } from '../../../../../components/styled-components'
import { RDInvoiceAmountAndCurrency } from '../../../../receivable-discounting-legacy/components/fields/RDInvoiceAmountWithCurrencyField'
import { borderLabelStyling } from '../../../../receivable-discounting-legacy/utils/styles'
import { RadioButtonGroupWithDescriptions } from '../../../../../components/form/radio-button-group-with-descriptions/RadioButtonGroupWithDescriptions'
import { applyForDiscountingRadioButtonOptions } from '../../../../receivable-discounting-legacy/utils/constants'
import { RDInputFieldLogic } from '../../../../receivable-discounting-legacy/presentation/RDInputFieldLogic'
import { displaySimpleRequestType } from '../../../../receivable-discounting-legacy/utils/displaySelectors'
import styled from 'styled-components'

interface IApplyForDiscountingDataProps {
  formik: FormikContext<IReceivablesDiscountingBase>
  index: string
  isApplyForDiscountingDataAccordionOpen: boolean
  handleClick: (e: React.SyntheticEvent, titleProps: any) => void
}

const ApplyForDiscountingData: React.FC<IApplyForDiscountingDataProps> = (props: IApplyForDiscountingDataProps) => {
  const {
    formik: { values },
    index,
    isApplyForDiscountingDataAccordionOpen,
    handleClick
  } = props
  return (
    <MinimalAccordionWrapper
      active={isApplyForDiscountingDataAccordionOpen}
      handleClick={handleClick}
      index={index}
      title={`${displaySimpleRequestType(undefined)} data`}
    >
      <RadioButtonGroupWithDescriptions
        options={applyForDiscountingRadioButtonOptions}
        groupTitle={'Select request type'}
        disabled={false}
        value={values.requestType}
        name={'requestType'}
        formik={props.formik}
      />

      {values.requestType && (
        <BasicPanel centeredForm={true}>
          {RDInputFieldLogic.shouldShowDiscountingTypeField(values.requestType) && (
            <RadioMargin>
              <RDFieldWithLabel
                formik={props.formik}
                name="discountingType"
                component={RadioController}
                options={enumToRadioOptions(DiscountingType, undefined, undefined, {
                  [DiscountingType.Recourse]: 'With recourse'
                })}
                stylingValues={radioStylingValues}
                error={undefined}
              />
            </RadioMargin>
          )}

          <RDInvoiceAmountAndCurrency currencyDisabled={false} formik={props.formik} />

          <RadioMargin>
            <RDFieldWithLabel
              formik={props.formik}
              name="invoiceType"
              fieldName=""
              component={RadioController}
              options={enumToRadioOptions(InvoiceType)}
              stylingValues={radioStylingValues}
              error={undefined}
            />
          </RadioMargin>

          <RDFieldWithLabel
            formik={props.formik}
            name="advancedRate"
            type="number"
            value={values.advancedRate}
            step="0.01"
            labelPosition="right"
            label={{ basic: true, content: '%', style: borderLabelStyling }}
          />

          {RDInputFieldLogic.shouldShowRiskCoverFields(values.requestType, values.discountingType) && (
            <RiskCoverSection {...props} />
          )}

          {RDInputFieldLogic.shouldShowDiscountingFields(values.requestType) && <DiscountingSection {...props} />}

          <RDFieldWithLabel
            formik={props.formik}
            name="dateOfPerformance"
            type="date"
            value={values.dateOfPerformance}
          />
          <RDFieldWithLabel
            formik={props.formik}
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
            <FinancialInstrumentSection {...props} />
          )}

          {RDInputFieldLogic.shouldShowGuarantor(values.supportingInstruments) && (
            <RDFieldWithLabel formik={props.formik} name="guarantor" value={values.guarantor} />
          )}
          <RDFieldWithLabel formik={props.formik} name="comment" value={values.comment} type="textarea" />
        </BasicPanel>
      )}
    </MinimalAccordionWrapper>
  )
}

const RiskCoverSection: React.FC<IApplyForDiscountingDataProps> = ({ formik }) => (
  <>
    <RDFieldWithLabel formik={formik} name="riskCoverDate" type="date" value={formik.values.riskCoverDate} />

    <RDFieldWithLabel
      formik={formik}
      name="numberOfDaysRiskCover"
      type="number"
      value={formik.values.numberOfDaysRiskCover}
    />
  </>
)

const DiscountingSection: React.FC<IApplyForDiscountingDataProps> = ({ formik }) => (
  <>
    <RDFieldWithLabel formik={formik} name="discountingDate" type="date" value={formik.values.discountingDate} />

    <RDFieldWithLabel
      formik={formik}
      name="numberOfDaysDiscounting"
      type="number"
      value={formik.values.numberOfDaysDiscounting}
    />
  </>
)

const FinancialInstrumentSection: React.FC<IApplyForDiscountingDataProps> = ({ formik }) => (
  <>
    <RDFieldWithLabel
      formik={formik}
      name="financialInstrumentInfo.financialInstrument"
      component={RadioController}
      options={enumToRadioOptions(FinancialInstrument)}
      stylingValues={radioStylingValues}
      error={undefined}
    />
    {RDInputFieldLogic.shouldShowFinancialInstrumentOtherField(
      formik.values.supportingInstruments,
      formik.values.financialInstrumentInfo
    ) && (
      <RDFieldWithLabel
        formik={formik}
        name="financialInstrumentInfo.financialInstrumentIfOther"
        value={formik.values.financialInstrumentInfo.financialInstrumentIfOther}
        marginLeftLabel={100}
        customFieldWidth={'36%'}
      />
    )}
    <RDFieldWithLabel
      formik={formik}
      name="financialInstrumentInfo.financialInstrumentIssuerName"
      value={formik.values.financialInstrumentInfo.financialInstrumentIssuerName}
    />
  </>
)

export default ApplyForDiscountingData

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

const RadioMargin = styled.div`
  margin-bottom: 16px;
`
