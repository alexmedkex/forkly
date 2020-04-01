import { IReceivablesDiscountingInfo } from '@komgo/types'
import React, { Fragment } from 'react'
import styled from 'styled-components'
import { grey } from '../../../../../styles/colors'
import { capitalize } from '../../../../../utils/casings'
import { displayDate } from '../../../../../utils/date'
import { displayQuantity } from '../../../../trades/utils/displaySelectors'
import {
  displayRequestType,
  supportingInstrumentToSentenceList,
  financialInstrumentDisplayValue
} from '../../../../receivable-discounting-legacy/utils/displaySelectors'
import { FormSectionLabel } from '../../../../receivable-discounting-legacy/components/generics/FormSectionLabel'
import { RDInfoField } from '../../../../receivable-discounting-legacy/components/panels/RDInfoField'

export interface IDiscountingRequestInfoPaneProps {
  discountingRequest: IReceivablesDiscountingInfo
}

export const DiscountingRequestInfoPane: React.FC<IDiscountingRequestInfoPaneProps> = props => {
  const { discountingRequest } = props
  return (
    <>
      <FormSectionLabel text={'General information'} />

      <RDInfoField
        fieldName={'requestType'}
        value={displayRequestType(discountingRequest.rd.requestType, discountingRequest.rd.discountingType)}
      />
      <RDInfoField
        fieldName={'invoiceAmount'}
        value={
          <>
            {displayQuantity(discountingRequest.rd.invoiceAmount, discountingRequest.rd.currency)}
            <Note>{capitalize(discountingRequest.rd.invoiceType)}</Note>
          </>
        }
      />
      {discountingRequest.rd.advancedRate && (
        <RDInfoField
          fieldName={'advancedRate'}
          value={discountingRequest.rd.advancedRate && displayQuantity(discountingRequest.rd.advancedRate, '%')}
        />
      )}

      {discountingRequest.rd.dateOfPerformance && (
        <RDInfoField fieldName={'dateOfPerformance'} value={displayDate(discountingRequest.rd.dateOfPerformance)} />
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

const RiskCoverSection: React.FC<IDiscountingRequestInfoPaneProps> = ({ discountingRequest }) => (
  <>
    <FormSectionLabel text={'Risk cover information'} />

    <FieldGroup>
      {discountingRequest.rd.riskCoverDate && (
        <RDInfoField fieldName={'riskCoverDate'} value={displayDate(discountingRequest.rd.riskCoverDate)} />
      )}

      {discountingRequest.rd.numberOfDaysRiskCover && (
        <RDInfoField fieldName={'numberOfDaysRiskCover'} value={discountingRequest.rd.numberOfDaysRiskCover} />
      )}
    </FieldGroup>
  </>
)

const DiscountingSection: React.FC<IDiscountingRequestInfoPaneProps> = ({ discountingRequest }) => (
  <>
    <FormSectionLabel text={'Discounting information'} />

    <FieldGroup>
      {discountingRequest.rd.discountingDate && (
        <RDInfoField fieldName={'discountingDate'} value={displayDate(discountingRequest.rd.discountingDate)} />
      )}

      {discountingRequest.rd.numberOfDaysDiscounting && (
        <RDInfoField fieldName={'numberOfDaysDiscounting'} value={discountingRequest.rd.numberOfDaysDiscounting} />
      )}
    </FieldGroup>
  </>
)

const SupportingSection: React.FC<IDiscountingRequestInfoPaneProps> = ({ discountingRequest }) => (
  <>
    <FormSectionLabel text={'Supporting information'} />

    {discountingRequest.rd.supportingInstruments.length > 0 && (
      <RDInfoField
        fieldName={'supportingInstruments'}
        value={supportingInstrumentToSentenceList(discountingRequest.rd.supportingInstruments)}
      />
    )}

    {discountingRequest.rd.financialInstrumentInfo && (
      <Fragment>
        <RDInfoField
          fieldName={'financialInstrumentInfo.financialInstrument'}
          value={financialInstrumentDisplayValue(discountingRequest.rd.financialInstrumentInfo)}
        />

        <RDInfoField
          fieldName={'financialInstrumentInfo.financialInstrumentIssuerName'}
          value={discountingRequest.rd.financialInstrumentInfo.financialInstrumentIssuerName}
        />
      </Fragment>
    )}

    {discountingRequest.rd.guarantor && <RDInfoField fieldName={'guarantor'} value={discountingRequest.rd.guarantor} />}

    {discountingRequest.rd.comment && <RDInfoField fieldName={'comment'} value={discountingRequest.rd.comment} />}
  </>
)

const Note = styled.span`
  &&& {
    border-bottom: 1px dashed ${grey};
    padding-bottom: 3px;
    margin-left: 5px;
  }
`

const FieldGroup = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  flex-wrap: wrap;
`
