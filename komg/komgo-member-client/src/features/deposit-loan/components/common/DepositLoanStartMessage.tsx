import * as React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

import { ROUTES } from '../../routes'
import { dictionary } from '../../dictionary'
import { media } from '../../../../utils/media'
import { CreditAppetiteDepositLoanFeature } from '../../store/types'

interface IProps {
  canCrudCreditAppetite: boolean
  isFinancialInstitution: boolean
  feature: CreditAppetiteDepositLoanFeature
}

const DepositLoanStartMessage: React.FC<IProps> = (props: IProps) => {
  const { canCrudCreditAppetite, isFinancialInstitution, feature } = props

  const financialInstitutionDepositMessage = (
    <Message>
      <p data-test-id="intro-paragraph-1">
        The <b>Deposit feature</b> allows you to set, update and promote your appetite for deposits. To start using it,
        click on "Add currency and tenor" in order to set your appetite and pricing for a given currency and tenor. You
        will then be able to select the counterparties with whom you wish to share non-binding information on a
        bilateral basis.
      </p>
    </Message>
  )

  const financialInstitutionLoanMessage = (
    <Message>
      <p data-test-id="intro-paragraph-1">
        The <b>Loan feature</b> allows you to set, update and promote your appetite for loans. To start using it, click
        on "Add currency and tenor" in order to set your appetite and pricing for a given currency and tenor. You will
        then be able to select the counterparties with whom you wish to share non-binding information on a bilateral
        basis.
      </p>
    </Message>
  )

  const corporateDepositMessage = (
    <Message>
      <p data-test-id="intro-paragraph-1">
        The <b>Deposit feature</b> allows to ask appetite for deposits and view the non-binding information shared with
        you on a bilateral basis by financial institutions on a given currency and tenor. To start using it, click on
        "Request deposit information" then select the financial institutions you want to send your request to.
      </p>
    </Message>
  )

  const corporateLoanMessage = (
    <Message>
      <p data-test-id="intro-paragraph-1">
        The <b>Loan feature</b> allows to ask appetite for loans and view the non-binding information shared with you on
        a bilateral basis by financial institutions on a given currency and tenor. To start using it, click on "Request
        loan information" then select the financial institutions you want to send your request to.
      </p>
    </Message>
  )

  const financialInstitutionButton = canCrudCreditAppetite ? (
    <CenterText>
      <LinkButton
        to={ROUTES[feature].financialInstitution.new}
        className="ui primary button"
        data-test-id="add-currency-and-tenor-intro-btn"
      >
        {dictionary[feature].financialInstitution.dashboard.linkText}
      </LinkButton>
    </CenterText>
  ) : null

  const corporateButton = canCrudCreditAppetite ? (
    <CenterText>
      <Link
        to={ROUTES[feature].corporate.requestInfoNew}
        data-test-id="request-currency-and-tenor-intro-btn"
        className="ui primary button"
      >
        {dictionary[feature].corporate.dashboard.linkText}
      </Link>
    </CenterText>
  ) : null

  const corporateMessage = {
    [CreditAppetiteDepositLoanFeature.Deposit]: corporateDepositMessage,
    [CreditAppetiteDepositLoanFeature.Loan]: corporateLoanMessage
  }

  const financialInstitutionMessage = {
    [CreditAppetiteDepositLoanFeature.Deposit]: financialInstitutionDepositMessage,
    [CreditAppetiteDepositLoanFeature.Loan]: financialInstitutionLoanMessage
  }

  return (
    <MessageWrapper>
      {isFinancialInstitution ? financialInstitutionMessage[feature] : corporateMessage[feature]}
      {isFinancialInstitution ? financialInstitutionButton : corporateButton}
    </MessageWrapper>
  )
}

const MessageWrapper = styled.div`
  margin: 200px auto 0 auto;
  width: 480px;
  ${() => media.desktop`width: 580px;`};
`

const Message = styled.div`
  margin-bottom: 30px;
`

const CenterText = styled.div`
  text-align: center;
`

const LinkButton = styled(Link)`
  &&&&& {
    padding-left: 80px;
    padding-right: 80px;
  }
`

export default DepositLoanStartMessage
