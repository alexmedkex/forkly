import React from 'react'
import { blueGrey } from '../../../../../styles/colors'
import styled from 'styled-components'
import { Field, FormikProps } from 'formik'
import { findFieldFromSchema } from '../../../../../store/common/selectors/displaySelectors'
import { rdQuoteSchema } from '../../../../receivable-discounting-legacy/utils/constants'
import {
  GridTextController,
  TextAreaController,
  enumToRadioOptions
} from '../../../../letter-of-credit-legacy/components'
import { getFieldConfiguration } from '../../../../trades/utils/getFieldConfiguration'
import { PricingType, InterestType, IQuote, IReceivablesDiscounting, LiborType, Currency } from '@komgo/types'
import { ISubmitQuoteFormDetails } from '../../../../receivable-discounting-legacy/store/types'
import { PercentageInputField } from '../../../../receivable-discounting-legacy/components/fields/PercentageInputField'
import { isEqual } from 'lodash'
import { GenericInputFieldWithLabel } from '../../../../receivable-discounting-legacy/components/fields/GenericInputFieldWithLabel'
import { HorizontalRadioLayoutWrapper, FieldGrouping } from '../../../../../components/styled-components'
import { SimpleRadioController } from '../../../../letter-of-credit-legacy/components/InputControllers/SimpleRadioController'
import {
  displayQuoteInterestType,
  displayMaturity
} from '../../../../receivable-discounting-legacy/utils/displaySelectors'
import { displayDate } from '../../../../../utils/date'
import { displayPercentage } from '../../../../trades/utils/displaySelectors'
import { sentenceCase } from '../../../../../utils/casings'
import { enumValueToString } from '../../../../receivable-discounting-legacy/resources/enumValueToString'
import { MonetaryAmountField } from '../../../../receivable-discounting-legacy/components/fields/MonetaryAmountField'
import { formatMonetaryAmount } from '../../../../receivable-discounting-legacy/utils/formatters'
import { SchemaUtils } from '../../../../receivable-discounting-legacy/utils/SchemaUtils'
import { QuoteInputFieldLogic } from '../../../../receivable-discounting-legacy/presentation/QuoteInputFieldLogic'
import { StatusText } from '../../../../receivable-discounting-legacy/components/generics/StatusText'
import { SPACES } from '@komgo/ui-components'

export interface IAcceptQuoteFieldsProps {
  formik: FormikProps<ISubmitQuoteFormDetails>
  bank: string
  quote: IQuote
  rd: IReceivablesDiscounting
}

export interface IFeeCalculationBasedOnDataProps {
  quote: IQuote
}

const FeeCalculationBasedOnData: React.FC<IFeeCalculationBasedOnDataProps> = ({ quote }) => (
  <>
    <FieldLabel>{findFieldFromSchema('title', 'feeCalculationType', rdQuoteSchema)}</FieldLabel>
    <p data-test-id="feeCalculationType-data">
      {enumValueToString[quote.feeCalculationType] || sentenceCase(quote.feeCalculationType)}
    </p>
  </>
)

const InterestData: React.FC<IAcceptQuoteFieldsProps> = ({ quote }) => (
  <>
    <FieldGrouping>
      <FieldLabel>Interest</FieldLabel>
      <InterestTerms data-test-id="interest-data">
        <InterestTerm>
          <DisplayHeader>{findFieldFromSchema('title', 'interestType', rdQuoteSchema)}</DisplayHeader>
          <p>{displayQuoteInterestType(quote)}</p>
        </InterestTerm>
        {quote.indicativeCof ? (
          <InterestTerm>
            <DisplayHeader>{`Indicative COF as of ${displayDate(new Date(quote.createdAt))}`}</DisplayHeader>
            <p>{displayPercentage(quote.indicativeCof)}</p>
          </InterestTerm>
        ) : null}
        {quote.addOnValue ? (
          <InterestTerm>
            <DisplayHeader>{`${findFieldFromSchema('title', 'addOnValue', rdQuoteSchema)} as of ${displayDate(
              new Date(quote.createdAt)
            )}`}</DisplayHeader>
            <p>{displayPercentage(quote.addOnValue)}</p>
          </InterestTerm>
        ) : null}
        {quote.daysUntilMaturity ? (
          <InterestTerm>
            <DisplayHeader>{findFieldFromSchema('title', 'maturity', rdQuoteSchema)}</DisplayHeader>
            <p>{displayMaturity(quote.daysUntilMaturity)}</p>
          </InterestTerm>
        ) : null}
      </InterestTerms>
    </FieldGrouping>

    <FieldGrouping>
      <FeeCalculationBasedOnData quote={quote} />
    </FieldGrouping>
  </>
)

// TODO: Would have re-used the pricing type fields, but need to pass in the proposed values
const PricingFields: React.FC<IAcceptQuoteFieldsProps> = props => {
  const { formik, quote, rd } = props
  const { values } = formik
  return (
    <>
      <HorizontalRadioLayoutWrapper>
        <Field
          name="pricingType"
          fieldName={findFieldFromSchema('title', 'pricingType', rdQuoteSchema)}
          options={enumToRadioOptions(
            SchemaUtils.getAuthorizedValuesByFieldName(
              rdQuoteSchema,
              'pricingType',
              rd.requestType,
              rd.discountingType
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

      {values.pricingType === PricingType.AllIn ? (
        <>
          <PercentageInputField
            fieldStyle={acceptQuoteFieldStyle}
            schema={rdQuoteSchema}
            name="pricingAllIn"
            data-test-id="pricingAllIn"
            formik={formik}
          />
          <AcceptedQuoteProposedPercentageValue fieldName="pricingAllIn" {...props} />
        </>
      ) : values.pricingType === PricingType.Split ? (
        <>
          <PercentageInputField
            fieldStyle={acceptQuoteFieldStyle}
            schema={rdQuoteSchema}
            name="pricingRiskFee"
            data-test-id="riskFee"
            formik={formik}
          />
          <AcceptedQuoteProposedPercentageValue fieldName="pricingRiskFee" {...props} />
          <PercentageInputField
            fieldStyle={acceptQuoteFieldStyle}
            schema={rdQuoteSchema}
            name="pricingMargin"
            data-test-id="margin"
            formik={formik}
          />
          <AcceptedQuoteProposedPercentageValue fieldName="pricingMargin" {...props} />
        </>
      ) : values.pricingType === PricingType.FlatFee ? (
        <>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold' }}>
              {findFieldFromSchema('title', 'pricingFlatFeeAmount', rdQuoteSchema)}
            </label>
            <MonetaryAmountField
              formik={formik}
              name="pricingFlatFeeAmount"
              defaultCurrency={
                quote.pricingType === PricingType.FlatFee ? quote.pricingFlatFeeAmount.currency : Currency.USD
              }
              schema={rdQuoteSchema}
            />
          </div>
          <AcceptedQuoteProposedPercentageValue
            fieldName="pricingFlatFeeAmount"
            {...props}
            proposed={
              quote.pricingType === PricingType.FlatFee
                ? formatMonetaryAmount(quote.pricingFlatFeeAmount.amount, quote.pricingFlatFeeAmount.currency)
                : undefined
            }
          />
        </>
      ) : values.pricingType === PricingType.Margin ? (
        <>
          <PercentageInputField
            fieldStyle={acceptQuoteFieldStyle}
            schema={rdQuoteSchema}
            name="pricingMargin"
            data-test-id="margin"
            formik={formik}
          />
          <AcceptedQuoteProposedPercentageValue fieldName="pricingMargin" {...props} />
        </>
      ) : values.pricingType === PricingType.RiskFee ? (
        <>
          <PercentageInputField
            fieldStyle={acceptQuoteFieldStyle}
            schema={rdQuoteSchema}
            name="pricingRiskFee"
            data-test-id="riskFee"
            formik={formik}
          />
          <AcceptedQuoteProposedPercentageValue fieldName="pricingRiskFee" {...props} />
        </>
      ) : null}
    </>
  )
}

const AcceptQuoteFields: React.FC<IAcceptQuoteFieldsProps> = props => {
  const { formik, quote, rd } = props
  return (
    <>
      <FieldGrouping>
        <PercentageInputField
          formik={formik}
          name="advanceRate"
          schema={rdQuoteSchema}
          data-test-id="advanceRate"
          fieldStyle={acceptQuoteFieldStyle}
        />
        <AcceptedQuoteProposedPercentageValue fieldName="advanceRate" {...props} />
      </FieldGrouping>

      <FieldGrouping>
        <PricingFields {...props} />
        {QuoteInputFieldLogic.shouldShowRiskCoverFields(rd.requestType, rd.discountingType) ? (
          <>
            <GenericInputFieldWithLabel
              type="number"
              step="1"
              name="numberOfDaysRiskCover"
              fieldStyle={acceptQuoteFieldStyle}
              formik={formik}
              schema={rdQuoteSchema}
              component={GridTextController}
              configuration={getFieldConfiguration(
                findFieldFromSchema('description', 'numberOfDaysRiskCover', rdQuoteSchema)
              )}
              data-test-id="numberOfDaysRiskCover"
            />
            <AcceptedQuoteProposedPercentageValue
              fieldName="numberOfDaysRiskCover"
              {...props}
              proposed={`${quote.numberOfDaysRiskCover} ${quote.numberOfDaysRiskCover === 1 ? 'day' : 'days'}`}
            />
          </>
        ) : null}
        {QuoteInputFieldLogic.shouldShowDiscountingFields(rd.requestType) ? (
          <>
            <GenericInputFieldWithLabel
              type="number"
              step="1"
              name="numberOfDaysDiscounting"
              formik={formik}
              fieldStyle={acceptQuoteFieldStyle}
              schema={rdQuoteSchema}
              component={GridTextController}
              configuration={getFieldConfiguration(
                findFieldFromSchema('description', 'numberOfDaysDiscounting', rdQuoteSchema)
              )}
              data-test-id="numberOfDaysDiscounting"
            />
            <AcceptedQuoteProposedPercentageValue
              fieldName="numberOfDaysDiscounting"
              {...props}
              proposed={`${quote.numberOfDaysDiscounting} ${quote.numberOfDaysDiscounting === 1 ? 'day' : 'days'}`}
            />
          </>
        ) : null}
      </FieldGrouping>

      {QuoteInputFieldLogic.shouldShowInterestTypeFields(rd.requestType) ? <InterestData {...props} /> : null}

      <label style={{ fontWeight: 'bold', display: 'block' }}>
        {findFieldFromSchema('title', 'comment', rdQuoteSchema)}
      </label>
      <Field component={TextAreaController} name="comment" data-test-id="comment" style={{ width: '50%' }} />

      <StatusText data-test-id="accept-quote-section-status-text" fontSize="1rem" margin={`${SPACES.DEFAULT} 0 0 0`}>
        The agreed terms are not legally binding
      </StatusText>
    </>
  )
}

const showProposedInfo = (currentValue, proposedValue) => (isEqual(currentValue, proposedValue) ? '' : 'show')

interface IAcceptQuoteProposedValueProps extends IAcceptQuoteFieldsProps {
  fieldName: string
  proposed?: string | number
}
const AcceptedQuoteProposedPercentageValue: React.FC<IAcceptQuoteProposedValueProps> = ({
  bank,
  fieldName,
  formik,
  quote,
  proposed
}) => (
  <Proposal className={quote[fieldName] && showProposedInfo(formik.values[fieldName], quote[fieldName])}>
    <p data-test-id={`${fieldName}-proposal-label`}>{`${bank} proposed: ${proposed || `${quote[fieldName]}%`}`}</p>
  </Proposal>
)

const acceptQuoteFieldStyle = {
  marginBottom: '20px'
}

const Proposal = styled.div`
  &&& {
    -webkit-transition: 0.5s;
    -moz-transition: 0.5s;
    -o-transition: 0.5s;
    transition: 0.5s;
    opacity: 0;
    visibility: hidden;
    margin: 0px 0px 0px 0px;
    height: 0px;

    &.show {
      margin: -15px 0px 0px 0px;
      opacity: 1;
      visibility: visible;
      height: 2rem;
    }

    p {
      color: ${blueGrey};
      font-size: 14px;
      line-height: 21px;
    }
  }
`

const FieldLabel = styled.div`
  margin: 0px 0px 5px 0px;
  font-weight: bold;
`

const DisplayHeader = styled.p`
  text-transform: uppercase;
  color: ${blueGrey};
  font-size: 11px;
  margin: 0px 0px 8px 0px;
`

const InterestTerms = styled.ul`
  list-style-type: none;
  padding: 0px;
  margin: 10px 0px 0px 0px;
  display: flex;
  flex-direction: row;
`

const InterestTerm = styled.li`
  margin: 0px;
  padding: 0px 20px 0px 0px;
`

export default AcceptQuoteFields
