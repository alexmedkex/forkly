import React from 'react'
import styled from 'styled-components'
import { rdQuoteSchema } from '../../../../receivable-discounting-legacy/utils/constants'
import {
  enumToRadioOptions,
  TextAreaController,
  GridTextController
} from '../../../../letter-of-credit-legacy/components'
import { Field, FormikProps } from 'formik'
import { ISubmitQuoteFormDetails } from '../../../../receivable-discounting-legacy/store/types'
import { IReceivablesDiscountingInfo, PricingType, InterestType, FeeCalculationType } from '@komgo/types'
import { greyblue } from '@komgo/ui-components'
import { SimpleRadioController } from '../../../../letter-of-credit-legacy/components/InputControllers/SimpleRadioController'
import { GenericInputFieldWithLabel } from '../../../../receivable-discounting-legacy/components/fields/GenericInputFieldWithLabel'
import { PercentageInputField } from '../../../../receivable-discounting-legacy/components/fields/PercentageInputField'
import { findFieldFromSchema } from '../../../../../store/common/selectors/displaySelectors'
import { SchemaUtils } from '../../../../receivable-discounting-legacy/utils/SchemaUtils'
import { HorizontalRadioLayoutWrapper, FieldGrouping } from '../../../../../components/styled-components'
import { PricingTypeField } from '../../../../receivable-discounting-legacy/components/fields/PricingTypeField'
import { InterestTypeField } from '../../../../receivable-discounting-legacy/components/fields/InterestTypeField'
import { getFieldConfiguration } from '../../../../trades/utils/getFieldConfiguration'
import { QuoteInputFieldLogic } from '../../../../receivable-discounting-legacy/presentation/QuoteInputFieldLogic'
import { enumValueToString } from '../../../../receivable-discounting-legacy/resources/enumValueToString'

export interface ISubmitQuoteFieldsProps {
  formik: FormikProps<ISubmitQuoteFormDetails>
  discountingRequest: IReceivablesDiscountingInfo
  sellerName: string
  defaultCofDate?: Date
}

interface IQuoteFieldProps {
  formik: FormikProps<ISubmitQuoteFormDetails>
  fieldName: string
}

const QuotePercentageInputField = props => <PercentageInputField schema={rdQuoteSchema} {...props} />
const QuoteNumberField: React.FC<IQuoteFieldProps> = ({ fieldName, formik }) => (
  <GenericInputFieldWithLabel
    schema={rdQuoteSchema}
    type="number"
    step="1"
    name={fieldName}
    formik={formik}
    component={GridTextController}
    configuration={getFieldConfiguration(findFieldFromSchema('description', fieldName, rdQuoteSchema))}
    data-test-id={fieldName}
  />
)
const dayOrDays = (value: number) => (value === 1 ? ' day' : ' days')

const renderProposedValues = (
  discountingRequest: IReceivablesDiscountingInfo,
  fieldName: string,
  sellerName: string,
  suffix: string
) => {
  if (discountingRequest && discountingRequest.rd[fieldName]) {
    return (
      <CounterPartyProposedInfo>{`${sellerName} proposes: ${
        discountingRequest.rd[fieldName]
      }${suffix}`}</CounterPartyProposedInfo>
    )
  }
}

const InterestTypeFieldGroups: React.FC<ISubmitQuoteFieldsProps> = ({ formik, discountingRequest, defaultCofDate }) => (
  <>
    <FieldGrouping>
      <HorizontalRadioLayoutWrapper>
        <Field
          name="interestType"
          fieldName={findFieldFromSchema('title', 'interestType', rdQuoteSchema)}
          options={enumToRadioOptions(InterestType, undefined, undefined, {
            [InterestType.AddOnLibor]: 'Add on + Libor'
          })}
          component={SimpleRadioController}
        />
      </HorizontalRadioLayoutWrapper>

      <InterestTypeField
        interestType={formik.values.interestType}
        defaultCofDate={defaultCofDate}
        formik={formik}
        optionalMaturity={!Boolean(discountingRequest.rd.numberOfDaysDiscounting)}
      />
    </FieldGrouping>

    <FieldGrouping>
      <HorizontalRadioLayoutWrapper>
        <Field
          name="feeCalculationType"
          fieldName={findFieldFromSchema('title', 'feeCalculationType', rdQuoteSchema)}
          options={enumToRadioOptions(FeeCalculationType, undefined, undefined, enumValueToString)}
          component={SimpleRadioController}
        />
      </HorizontalRadioLayoutWrapper>
    </FieldGrouping>
  </>
)

export const SubmitQuoteFields: React.FC<ISubmitQuoteFieldsProps> = props => {
  const { formik, discountingRequest, sellerName } = props
  const { values } = formik

  return (
    <>
      <FieldGrouping>
        <QuotePercentageInputField name="advanceRate" data-test-id="advanceRate" formik={formik} />
        {renderProposedValues(discountingRequest, 'advanceRate', sellerName, '%')}
      </FieldGrouping>

      <FieldGrouping>
        <HorizontalRadioLayoutWrapper>
          <Field
            name="pricingType"
            fieldName={findFieldFromSchema('title', 'pricingType', rdQuoteSchema)}
            options={enumToRadioOptions(
              SchemaUtils.getAuthorizedValuesByFieldName(
                rdQuoteSchema,
                'pricingType',
                discountingRequest.rd.requestType,
                discountingRequest.rd.discountingType
              ),
              undefined,
              undefined,
              {
                [PricingType.AllIn]: 'All in pricing'
              }
            )}
            component={SimpleRadioController}
          />
        </HorizontalRadioLayoutWrapper>

        <PricingTypeField
          pricingType={values.pricingType}
          formik={formik}
          defaultCurrency={discountingRequest.rd.currency}
          labelStyle={{ fontWeight: 'bold', display: 'block' }}
          divContainerStyle={{ marginBottom: '10px' }}
          inputStyle={{ width: '50%' }}
        />
      </FieldGrouping>

      <FieldGrouping>
        {QuoteInputFieldLogic.shouldShowRiskCoverFields(
          discountingRequest.rd.requestType,
          discountingRequest.rd.discountingType
        ) && <QuoteNumberField formik={formik} fieldName="numberOfDaysRiskCover" />}
        {renderProposedValues(
          discountingRequest,
          'numberOfDaysRiskCover',
          sellerName,
          dayOrDays(discountingRequest.rd.numberOfDaysRiskCover)
        )}

        {QuoteInputFieldLogic.shouldShowDiscountingFields(discountingRequest.rd.requestType) && (
          <QuoteNumberField formik={formik} fieldName="numberOfDaysDiscounting" />
        )}
        {renderProposedValues(
          discountingRequest,
          'numberOfDaysDiscounting',
          sellerName,
          dayOrDays(discountingRequest.rd.numberOfDaysDiscounting)
        )}
      </FieldGrouping>

      {QuoteInputFieldLogic.shouldShowInterestTypeFields(discountingRequest.rd.requestType) && (
        <InterestTypeFieldGroups {...props} />
      )}

      <label style={{ fontWeight: 'bold', display: 'block' }}>
        {findFieldFromSchema('title', 'comment', rdQuoteSchema)}
      </label>
      <Field component={TextAreaController} name="comment" data-test-id="comment" style={{ width: '50%' }} />
    </>
  )
}

const CounterPartyProposedInfo = styled.p`
  &&& {
    color: ${greyblue};
    margin: -10px 0 10px 0;
  }
`
