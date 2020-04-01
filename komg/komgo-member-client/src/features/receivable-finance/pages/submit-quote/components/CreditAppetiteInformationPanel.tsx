import React from 'react'
import { CounterpartyCreditLineDataView } from '../../../../credit-line/components/financial-institution/credit-line-view/CounterpartyCreditLineDataView'
import { CreditLineType, IExtendedCreditLine, IExtendedSharedCreditLine } from '../../../../credit-line/store/types'
import { BoldHeaderWrapper } from '../../../../../components/styled-components'
import styled from 'styled-components'
import { grey, SPACES } from '@komgo/ui-components'
import { SharedCreditLineDataView } from '../../../../credit-line/components/financial-institution/credit-line-view/SharedCreditLineDataView'

export interface ICreditAppetiteInformationPanelProps {
  creditLine: IExtendedCreditLine
  buyerName: string
  sellerName: string
  sellerStaticId: string
}

export const CreditAppetiteInformationPanel: React.FC<ICreditAppetiteInformationPanelProps> = props => {
  const { creditLine, buyerName, sellerName, sellerStaticId } = props

  if (!creditLine) {
    return (
      <>
        <BoldHeaderWrapper data-test-id="credit-appetite-header-empty">
          <h3>No credit appetite information on {buyerName}</h3>
          <p>To enter information, go to the appetite section and add {buyerName}.</p>
        </BoldHeaderWrapper>
      </>
    )
  }

  const buyerTitle = `${buyerName} information`
  const buyerText = 'Internal information relating to the buyer'

  const sellerTitle = `${sellerName} information`
  const sellerText = 'Information you have shared with specific sellers'

  const sellerSharedCreditLines = creditLine.sharedCreditLines.filter(
    (v: IExtendedSharedCreditLine) => v.sharedWithStaticId === sellerStaticId
  )
  const hasSellerSharedCreditLine = sellerSharedCreditLines.length > 0

  return (
    <>
      <BoldHeaderWrapper data-test-id="credit-appetite-header-buyer">
        <h3>{buyerTitle}</h3>
        <p>{buyerText}</p>
      </BoldHeaderWrapper>
      <CounterpartyCreditLineDataView
        creditLine={creditLine}
        feature={CreditLineType.RiskCover}
        showFieldVerticalDisplay={true}
        hideOptionalLabel={true}
        data-test-id="credit-appetite-data-buyer"
      />
      {hasSellerSharedCreditLine && (
        <SellerSection>
          <BoldHeaderWrapper data-test-id="credit-appetite-header-seller">
            <h3>{sellerTitle}</h3>
            <p>{sellerText}</p>
          </BoldHeaderWrapper>
          <SharedDataSection>
            <SharedCreditLineDataView
              sharedCreditLine={sellerSharedCreditLines[0]}
              feature={CreditLineType.RiskCover}
              data-test-id="credit-appetite-data-seller"
            />
          </SharedDataSection>
        </SellerSection>
      )}
    </>
  )
}

const SellerSection = styled.div`
  border-top: 1px solid ${grey};
  padding: 20px 0;

  && {
    .column:not(.grid) {
      padding-bottom: 10px;
    }
  }
`

const SharedDataSection = styled.div`
  margin-top: ${SPACES.SMALL};
`
