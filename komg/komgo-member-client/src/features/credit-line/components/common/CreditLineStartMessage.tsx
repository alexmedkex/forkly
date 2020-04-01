import * as React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { Button } from 'semantic-ui-react'

import { media } from '../../../../utils/media'
import { CreditLineType } from '../../store/types'
import CounterpartyModalPicker, { WithModalProps } from './CounterpartyModalPicker'

interface IProps {
  canCrudRiskCover: boolean
  isFinancialInstitution: boolean
  feature: CreditLineType
  withModalProps?: WithModalProps
}

const CreditLineStartMessage: React.FC<IProps> = (props: IProps) => {
  const { canCrudRiskCover, isFinancialInstitution, feature, withModalProps } = props

  const financialInstitutionRiskCoverMessage = (
    <Message>
      <p data-test-id="rc-intro-paragraph-1">
        The <b>Risk Cover</b> feature allows you to set, update and monitor your credit related information on
        counterparts in the context of risk cover and receivables discounting. By clicking "Add buyer" you can add as
        many counterparties as you wish and optionally fill information related to your risk appetite and pricing. To
        start using it, click on “Add buyer” and fill in the relevant information. You can then customise the
        information you would like to disclose to sellers.
      </p>
      <p data-test-id="rc-intro-paragraph-2">
        The disclosed information will be available to the sellers when selecting the finance providers within the risk
        cover and receivable discounting functionality.
      </p>
    </Message>
  )

  const financialInstitutionBankLineMessage = (
    <Message>
      <p data-test-id="bl-intro-paragraph-1">
        The <b>Bank Lines</b> feature allows you to set, update and monitor your credit related information on issuing
        banks in the context of bank confirmation. To start using it, click on "Add issuing bank" button and fill in the
        relevant information. You can then customize the information you would like to disclose to beneficiaries.
      </p>
    </Message>
  )

  const corporateRiskCoverMessage = (
    <Message>
      <p data-test-id="rc-intro-paragraph-1">
        The <b>Risk Cover</b> feature allows you to view credit related information shared by banks on your buyers. To
        start using it click on "Request information on a New Buyer".
      </p>
    </Message>
  )

  const corporateBankLineMessage = (
    <Message>
      <p data-test-id="bl-intro-paragraph-1">
        The <b>Bank lines</b> feature allows you to view credit related information shared by banks on your issuing
        banks. To start using it click on "Request information on an Issuing Bank"
      </p>
    </Message>
  )

  const financialInstitutionRiskCoverButton = canCrudRiskCover ? (
    <CenterText>
      <CounterpartyModalPicker
        {...withModalProps}
        renderButton={openModal => (
          <StyledButton data-test-id="rc-intro-add-buyer-btn" primary={true} onClick={openModal}>
            Add buyer
          </StyledButton>
        )}
      />
    </CenterText>
  ) : null

  const financialInstitutionBankLineButton = canCrudRiskCover ? (
    <CenterText>
      <CounterpartyModalPicker
        {...withModalProps}
        renderButton={openModal => (
          <StyledButton data-test-id="bl-intro-add-issuing-bank-btn" primary={true} onClick={openModal}>
            Add issuing bank
          </StyledButton>
        )}
      />
    </CenterText>
  ) : null

  const corporateRiskCoverButton = canCrudRiskCover ? (
    <CenterText>
      <CounterpartyModalPicker
        {...withModalProps}
        renderButton={openModal => (
          <StyledButton data-test-id="rc-intro-request-information" primary={true} onClick={openModal}>
            Request information on a New Buyer
          </StyledButton>
        )}
      />
    </CenterText>
  ) : null

  const corporateBankLineButton = canCrudRiskCover ? (
    <CenterText>
      <CounterpartyModalPicker
        {...withModalProps}
        renderButton={openModal => (
          <StyledButton data-test-id="bl-intro-request-information" primary={true} onClick={openModal}>
            Request information on a New Issuing bank
          </StyledButton>
        )}
      />
    </CenterText>
  ) : null

  const financialInstitutionMessage = {
    [CreditLineType.RiskCover]: financialInstitutionRiskCoverMessage,
    [CreditLineType.BankLine]: financialInstitutionBankLineMessage
  }

  const financialInstitutionButton = {
    [CreditLineType.RiskCover]: financialInstitutionRiskCoverButton,
    [CreditLineType.BankLine]: financialInstitutionBankLineButton
  }

  const corporateMessage = {
    [CreditLineType.RiskCover]: corporateRiskCoverMessage,
    [CreditLineType.BankLine]: corporateBankLineMessage
  }

  const corporateButton = {
    [CreditLineType.RiskCover]: corporateRiskCoverButton,
    [CreditLineType.BankLine]: corporateBankLineButton
  }

  return (
    <MessageWrapper>
      {isFinancialInstitution ? financialInstitutionMessage[feature] : corporateMessage[feature]}
      {isFinancialInstitution ? financialInstitutionButton[feature] : corporateButton[feature]}
    </MessageWrapper>
  )
}

const MessageWrapper = styled.div`
  margin: 200px auto 0 auto;
  width: 480px;
  ${(props: any) => media.desktop`width: 580px;`};
`

const Message = styled.div`
  margin-bottom: 30px;
`

const CenterText = styled.div`
  text-align: center;
`

const StyledButton = styled(Button)`
  &&&&& {
    padding-left: 80px;
    padding-right: 80px;
  }
`

export default CreditLineStartMessage
