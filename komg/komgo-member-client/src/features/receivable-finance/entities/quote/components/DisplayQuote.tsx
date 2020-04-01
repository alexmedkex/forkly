import { IQuote, PricingType, IHistory, RequestType, DiscountingType, IHistoryChange } from '@komgo/types'
import * as React from 'react'
import _ from 'lodash'
import { sentenceCase } from '../../../../../utils/casings'
import BasicPanel from '../../../../trades/components/BasicPanel'
import { displayPercentage, displayQuantity } from '../../../../trades/utils/displaySelectors'
import { rdQuoteSchema } from '../../../../receivable-discounting-legacy/utils/constants'
import { QuoteField } from '../../../../receivable-discounting-legacy/components/fields/QuoteField'
import { findFieldFromSchema } from '../../../../../store/common/selectors/displaySelectors'
import {
  interestTypeDisplayValue,
  displayMaturity
} from '../../../../receivable-discounting-legacy/utils/displaySelectors'
import { Dimensions } from '../../../../receivable-discounting-legacy/resources/dimensions'
import { QuoteInputFieldLogic } from '../../../../receivable-discounting-legacy/presentation/QuoteInputFieldLogic'
import { enumValueToString } from '../../../../receivable-discounting-legacy/resources/enumValueToString'

export const INTEREST_TYPE_VIEW_FIELD_NAME = 'interestType'
export const MATURITY_VIEW_FIELD_NAME = 'daysUntilMaturity'
export const COF_VIEW_FIELD_NAME = 'indicativeCof'

export const PRICING_TYPE_VIEW_FIELD_NAME = 'pricingType'
export const FLAT_FEE__AMOUNT_VIEW_FIELD_NAME = 'pricingFlatFeeAmount'

export const ADD_ON_VALUE_FIELD_NAME = 'addOnValue'

export interface IDisplayQuoteProps {
  quote: IQuote
  comment?: string
  replyDate?: string
  provider?: string
  agreedTermsHistory?: IHistory<IQuote>
  sectionName: string
  requestType: RequestType
  discountingType?: DiscountingType
}

const DAYS_RISK_COVER_VIEW_FIELD_NAME = 'numberOfDaysRiskCover'

const historyWithAddedComment = (props: IDisplayQuoteProps) => {
  const { agreedTermsHistory, comment, replyDate } = props
  if (agreedTermsHistory && agreedTermsHistory.historyEntry) {
    const historyClone = _.cloneDeep(agreedTermsHistory) // Need to clone to avoid side effects
    const commentHistory = historyClone.historyEntry.comment as Array<IHistoryChange<string>>
    commentHistory.push({ updatedAt: replyDate, value: comment })

    return historyClone
  }
}

const getComment = (props: IDisplayQuoteProps) => {
  if (
    props.agreedTermsHistory &&
    props.agreedTermsHistory.historyEntry &&
    props.agreedTermsHistory.historyEntry.comment
  ) {
    return props.quote.comment || '-'
  }

  return props.quote.comment || props.comment
}

export const DisplayQuote: React.FC<IDisplayQuoteProps> = props => {
  const { quote, provider, agreedTermsHistory, sectionName, requestType, discountingType } = props

  const displayComment = getComment(props)

  return (
    <BasicPanel padding={Dimensions.ViewRequestSectionBasicPanelPadding}>
      {provider && <QuoteField label={'Provider'} value={provider} fieldName="provider" sectionName={sectionName} />}
      <QuoteField
        fieldName={'advanceRate'}
        label={findFieldFromSchema('title', 'advanceRate', rdQuoteSchema)}
        value={displayPercentage(quote.advanceRate)}
        history={agreedTermsHistory}
        sectionName={sectionName}
      />
      <PricingDisplayFields quote={quote} agreedTermsHistory={agreedTermsHistory} sectionName={sectionName} />
      {QuoteInputFieldLogic.shouldShowRiskCoverFields(requestType, discountingType) && (
        <QuoteField
          fieldName={DAYS_RISK_COVER_VIEW_FIELD_NAME}
          label={findFieldFromSchema('title', DAYS_RISK_COVER_VIEW_FIELD_NAME, rdQuoteSchema)}
          value={
            quote.numberOfDaysRiskCover > 1
              ? displayQuantity(quote.numberOfDaysRiskCover, 'days', '-')
              : displayQuantity(quote.numberOfDaysRiskCover, 'day', '-')
          }
          history={agreedTermsHistory}
          sectionName={sectionName}
        />
      )}
      {QuoteInputFieldLogic.shouldShowDiscountingFields(requestType) && (
        <QuoteField
          fieldName={'numberOfDaysDiscounting'}
          label={findFieldFromSchema('title', 'numberOfDaysDiscounting', rdQuoteSchema)}
          value={
            quote.numberOfDaysDiscounting > 1
              ? displayQuantity(quote.numberOfDaysDiscounting, 'days', '-')
              : displayQuantity(quote.numberOfDaysDiscounting, 'day', '-')
          }
          history={agreedTermsHistory}
          sectionName={sectionName}
        />
      )}
      {QuoteInputFieldLogic.shouldShowInterestTypeFields(requestType) && (
        <InterestDisplayFields quote={quote} agreedTermsHistory={agreedTermsHistory} sectionName={sectionName} />
      )}
      {displayComment && (
        <QuoteField
          fieldName={'comment'}
          label={'Comment'}
          value={displayComment}
          sectionName={sectionName}
          history={historyWithAddedComment(props)}
          historyInModal={true}
        />
      )}
    </BasicPanel>
  )
}

export interface IDisplayQuoteFieldBlockProps {
  quote: IQuote
  agreedTermsHistory?: IHistory<IQuote>
  sectionName: string
}

export const InterestDisplayFields: React.FC<IDisplayQuoteFieldBlockProps> = ({
  quote,
  agreedTermsHistory,
  sectionName
}) => (
  <>
    <QuoteField
      fieldName={INTEREST_TYPE_VIEW_FIELD_NAME}
      label={findFieldFromSchema('title', INTEREST_TYPE_VIEW_FIELD_NAME, rdQuoteSchema)}
      value={interestTypeDisplayValue(quote.interestType, quote.liborType)}
      history={agreedTermsHistory}
      sectionName={sectionName}
    />
    {quote.indicativeCof && (
      <QuoteField
        fieldName={COF_VIEW_FIELD_NAME}
        label={findFieldFromSchema('title', COF_VIEW_FIELD_NAME, rdQuoteSchema)}
        value={displayPercentage(quote.indicativeCof)}
        history={agreedTermsHistory}
        sectionName={sectionName}
      />
    )}
    {quote.addOnValue && (
      <QuoteField
        fieldName={ADD_ON_VALUE_FIELD_NAME}
        label={findFieldFromSchema('title', ADD_ON_VALUE_FIELD_NAME, rdQuoteSchema)}
        value={displayPercentage(quote.addOnValue)}
        history={agreedTermsHistory}
        sectionName={sectionName}
      />
    )}
    {quote.daysUntilMaturity && (
      <QuoteField
        fieldName={MATURITY_VIEW_FIELD_NAME}
        label={findFieldFromSchema('title', MATURITY_VIEW_FIELD_NAME, rdQuoteSchema)}
        value={displayMaturity(quote.daysUntilMaturity)}
        history={agreedTermsHistory}
        sectionName={sectionName}
      />
    )}

    <QuoteField
      fieldName={'feeCalculationType'}
      label={findFieldFromSchema('title', 'feeCalculationType', rdQuoteSchema)}
      value={enumValueToString[quote.feeCalculationType] || sentenceCase(quote.feeCalculationType)}
      history={agreedTermsHistory}
      sectionName={sectionName}
    />
  </>
)

export const PricingDisplayFields: React.FC<IDisplayQuoteFieldBlockProps> = ({
  quote,
  agreedTermsHistory,
  sectionName
}) => (
  <>
    <QuoteField
      fieldName={PRICING_TYPE_VIEW_FIELD_NAME}
      label={findFieldFromSchema('title', PRICING_TYPE_VIEW_FIELD_NAME, rdQuoteSchema)}
      value={sentenceCase(quote.pricingType)}
      history={agreedTermsHistory}
      sectionName={sectionName}
    />
    {quote.pricingType === PricingType.AllIn && (
      <QuoteField
        fieldName={'pricingAllIn'}
        label={findFieldFromSchema('title', 'pricingAllIn', rdQuoteSchema)}
        value={displayPercentage(quote.pricingAllIn)}
        history={agreedTermsHistory}
        sectionName={sectionName}
      />
    )}
    {quote.pricingType === PricingType.Split && (
      <>
        <QuoteField
          fieldName={'pricingRiskFee'}
          label={findFieldFromSchema('title', 'pricingRiskFee', rdQuoteSchema)}
          value={displayPercentage(quote.pricingRiskFee)}
          history={agreedTermsHistory}
          sectionName={sectionName}
        />
        <QuoteField
          fieldName={'pricingMargin'}
          label={findFieldFromSchema('title', 'pricingMargin', rdQuoteSchema)}
          value={displayPercentage(quote.pricingMargin)}
          history={agreedTermsHistory}
          sectionName={sectionName}
        />
      </>
    )}
    {quote.pricingType === PricingType.FlatFee && (
      <QuoteField
        fieldName={FLAT_FEE__AMOUNT_VIEW_FIELD_NAME}
        label={findFieldFromSchema('title', FLAT_FEE__AMOUNT_VIEW_FIELD_NAME, rdQuoteSchema)}
        value={displayQuantity(quote.pricingFlatFeeAmount.amount, quote.pricingFlatFeeAmount.currency)}
        history={agreedTermsHistory}
        sectionName={sectionName}
        currency={quote.pricingFlatFeeAmount.currency}
      />
    )}
    {quote.pricingType === PricingType.RiskFee && (
      <QuoteField
        fieldName={'pricingRiskFee'}
        label={findFieldFromSchema('title', 'pricingRiskFee', rdQuoteSchema)}
        value={displayPercentage(quote.pricingRiskFee)}
        history={agreedTermsHistory}
        sectionName={sectionName}
      />
    )}
    {quote.pricingType === PricingType.Margin && (
      <QuoteField
        fieldName={'pricingMargin'}
        label={findFieldFromSchema('title', 'pricingMargin', rdQuoteSchema)}
        value={displayPercentage(quote.pricingMargin)}
        history={agreedTermsHistory}
        sectionName={sectionName}
      />
    )}
  </>
)
