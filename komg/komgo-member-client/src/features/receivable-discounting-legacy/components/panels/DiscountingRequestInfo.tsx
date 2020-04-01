import { IHistory, IReceivablesDiscountingInfo, IReceivablesDiscounting } from '@komgo/types'
import React, { Fragment } from 'react'
import styled from 'styled-components'
import { grey } from '../../../../styles/colors'
import { capitalize } from '../../../../utils/casings'
import { displayDate } from '../../../../utils/date'
import { displayQuantity } from '../../../trades/utils/displaySelectors'
import { DiscountingRequestInfoField } from '../fields/DiscountingRequestInfoField'
import {
  displayRequestType,
  supportingInstrumentToSentenceList,
  financialInstrumentDisplayValue
} from '../../utils/displaySelectors'
import { FormSectionLabel } from '../generics/FormSectionLabel'
import { Dimensions } from '../../resources/dimensions'

export interface IDiscountingRequestInfoProps {
  discountingRequest: IReceivablesDiscountingInfo
  history: IHistory<IReceivablesDiscounting>
}

const StyledFormSectionLabel: React.FC<any> = ({ text }) => (
  <FormSectionLabel text={text} width={Dimensions.DiscountingRequestInfoFieldLabelWidth} textAlign={'right'} />
)

export const DiscountingRequestInfo: React.FC<IDiscountingRequestInfoProps> = props => {
  const { discountingRequest, history } = props
  return (
    <>
      <StyledFormSectionLabel text="General information" />

      <DiscountingRequestInfoField
        fieldName={'requestType'}
        value={displayRequestType(discountingRequest.rd.requestType, discountingRequest.rd.discountingType)}
        history={history}
        rd={discountingRequest.rd}
      />
      <DiscountingRequestInfoField
        fieldName={'invoiceAmount'}
        value={
          <>
            {displayQuantity(discountingRequest.rd.invoiceAmount, discountingRequest.rd.currency)}
            <Note>{capitalize(discountingRequest.rd.invoiceType)}</Note>
          </>
        }
        history={history}
        rd={discountingRequest.rd}
      />
      {discountingRequest.rd.advancedRate && (
        <DiscountingRequestInfoField
          fieldName={'advancedRate'}
          value={discountingRequest.rd.advancedRate && displayQuantity(discountingRequest.rd.advancedRate, '%')}
          history={history}
          rd={discountingRequest.rd}
        />
      )}

      {discountingRequest.rd.dateOfPerformance && (
        <DiscountingRequestInfoField
          fieldName={'dateOfPerformance'}
          value={displayDate(discountingRequest.rd.dateOfPerformance)}
          history={history}
          rd={discountingRequest.rd}
        />
      )}

      {(discountingRequest.rd.riskCoverDate || discountingRequest.rd.numberOfDaysRiskCover) && (
        <RiskCoverSection {...props} />
      )}

      {(discountingRequest.rd.discountingDate || discountingRequest.rd.numberOfDaysDiscounting) && (
        <DiscountingSection {...props} />
      )}

      {(discountingRequest.rd.supportingInstruments.length > 0 || discountingRequest.rd.comment) && (
        <SupportingSection {...props} />
      )}
    </>
  )
}

const RiskCoverSection: React.FC<IDiscountingRequestInfoProps> = ({ discountingRequest, history }) => (
  <>
    <StyledFormSectionLabel text={'Risk cover information'} />

    {discountingRequest.rd.riskCoverDate && (
      <DiscountingRequestInfoField
        fieldName={'riskCoverDate'}
        value={displayDate(discountingRequest.rd.riskCoverDate)}
        history={history}
        rd={discountingRequest.rd}
      />
    )}

    {discountingRequest.rd.numberOfDaysRiskCover && (
      <DiscountingRequestInfoField
        fieldName={'numberOfDaysRiskCover'}
        value={discountingRequest.rd.numberOfDaysRiskCover}
        history={history}
        rd={discountingRequest.rd}
      />
    )}
  </>
)

const DiscountingSection: React.FC<IDiscountingRequestInfoProps> = ({ discountingRequest, history }) => (
  <>
    <StyledFormSectionLabel text={'Discounting information'} />

    {discountingRequest.rd.discountingDate && (
      <DiscountingRequestInfoField
        fieldName={'discountingDate'}
        value={displayDate(discountingRequest.rd.discountingDate)}
        history={history}
        rd={discountingRequest.rd}
      />
    )}

    {discountingRequest.rd.numberOfDaysDiscounting && (
      <DiscountingRequestInfoField
        fieldName={'numberOfDaysDiscounting'}
        value={discountingRequest.rd.numberOfDaysDiscounting}
        history={history}
        rd={discountingRequest.rd}
      />
    )}
  </>
)

const SupportingSection: React.FC<IDiscountingRequestInfoProps> = ({ discountingRequest, history }) => (
  <>
    <StyledFormSectionLabel text={'Supporting information'} />

    {discountingRequest.rd.supportingInstruments.length > 0 && (
      <DiscountingRequestInfoField
        fieldName={'supportingInstruments'}
        value={supportingInstrumentToSentenceList(discountingRequest.rd.supportingInstruments)}
        history={history}
        rd={discountingRequest.rd}
      />
    )}

    {discountingRequest.rd.financialInstrumentInfo && (
      <Fragment>
        <DiscountingRequestInfoField
          fieldName={'financialInstrumentInfo.financialInstrument'}
          value={financialInstrumentDisplayValue(discountingRequest.rd.financialInstrumentInfo)}
          history={history}
          rd={discountingRequest.rd}
        />

        <DiscountingRequestInfoField
          fieldName={'financialInstrumentInfo.financialInstrumentIssuerName'}
          value={discountingRequest.rd.financialInstrumentInfo.financialInstrumentIssuerName}
          history={history}
          rd={discountingRequest.rd}
        />
      </Fragment>
    )}

    {discountingRequest.rd.guarantor && (
      <DiscountingRequestInfoField
        fieldName={'guarantor'}
        value={discountingRequest.rd.guarantor}
        history={history}
        rd={discountingRequest.rd}
      />
    )}

    {discountingRequest.rd.comment && (
      <DiscountingRequestInfoField
        fieldName={'comment'}
        value={discountingRequest.rd.comment}
        history={history}
        rd={discountingRequest.rd}
        historyInModal={true}
      />
    )}
  </>
)

const Note = styled.span`
  &&& {
    border-bottom: 1px dashed ${grey};
    padding-bottom: 3px;
    margin-left: 5px;
  }
`
