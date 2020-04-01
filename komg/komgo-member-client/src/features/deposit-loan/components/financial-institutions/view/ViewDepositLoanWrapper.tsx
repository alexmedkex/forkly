import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { CreditAppetiteDepositLoanFeature, IExtendedDepositLoanResponse } from '../../../store/types'
import { ROUTES } from '../../../routes'
import CounterpartyBox from '../../../../credit-line/components/credit-appetite-shared-components/CounterpartyBox'
import { LightHeaderWrapper } from '../../../../../components/styled-components'
import FieldDisplay from '../../../../credit-line/components/credit-appetite-shared-components/FieldDisplay'
import { percentFormat } from '../../../../credit-line/utils/formatters'
import SharedDepositLoanRow from './SharedDepositLoanRow'
import CurrencyAndTenorTextInfo from '../common/CurrencyAndTenorTextInfo'
import SharedWithCounterpartiesTextInfo from '../common/SharedWithCounterpartiesTextInfo'
import ActionTimeInfo from '../../../../credit-line/components/credit-appetite-shared-components/ActionTimeInfo'

export interface IProps {
  depositLoan: IExtendedDepositLoanResponse
  feature: CreditAppetiteDepositLoanFeature
  canCrudCreditAppetite: boolean
}
const ViewDepositLoanWrapper: React.FC<IProps> = (props: IProps) => {
  const { depositLoan, feature, canCrudCreditAppetite } = props

  return (
    <Fragment>
      {canCrudCreditAppetite ? (
        <RedirectToEditLink
          to={`${ROUTES[feature].financialInstitution.dashboard}/${depositLoan.staticId}/edit`}
          className="ui button"
          data-test-id="edit-information-btn"
        >
          Edit information
        </RedirectToEditLink>
      ) : null}

      <CounterpartyBox>
        <LightHeaderWrapper>
          <CurrencyAndTenorTextInfo />
        </LightHeaderWrapper>

        <FieldDisplay label="Appetite">
          <span data-test-id="appetite">{depositLoan.appetite ? 'Yes' : 'No'}</span>
        </FieldDisplay>
        <FieldDisplay label="Pricing per annum">
          <span data-test-id="pricing">{percentFormat(depositLoan.pricing, '-')}</span>
          {depositLoan.pricingUpdatedAt && (
            <ActionTimeInfo time={depositLoan.pricingUpdatedAt} fieldName="pricing" prefix="Last updated" />
          )}
        </FieldDisplay>
      </CounterpartyBox>

      <CompanyWrapper>
        <LightHeaderWrapper>
          <SharedWithCounterpartiesTextInfo />
        </LightHeaderWrapper>

        {depositLoan.sharedWith
          ? depositLoan.sharedWith.map(item => <SharedDepositLoanRow key={item.staticId} sharedDepositLoan={item} />)
          : null}
      </CompanyWrapper>
    </Fragment>
  )
}

export default ViewDepositLoanWrapper

const CompanyWrapper = styled.div`
  margin-top: 40px;
  ${LightHeaderWrapper} {
    margin-bottom: 20px;
  }
`

const RedirectToEditLink = styled(Link)`
  &&& {
    margin-bottom: 25px;
  }
`
