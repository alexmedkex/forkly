import * as React from 'react'
import { IStandbyLetterOfCredit, buildFakeStandByLetterOfCredit } from '@komgo/types'
import { Grid } from 'semantic-ui-react'
import Numeral from 'numeral'
import styled, { consolidateStreamedStyles } from 'styled-components'
import SimpleButton from '../../../../components/buttons/SimpleButton'
import { displayDate } from '../../../../utils/date'
import { IMember } from '../../../members/store/types'
import { Document } from '../../../document-management'
import { initiateFileDownload } from '../../../document-management/utils/downloadDocument'
import { sentenceCaseWithLC } from '../../../letter-of-credit-legacy/utils/casings'
import { TRADE_FINANCE_BASE_ENDPOINT } from '../../../../utils/endpoints'

interface IProps {
  standbyLetterOfCredit: IStandbyLetterOfCredit
  documents: Document[]
  applicant: IMember
  beneficiary: IMember
}

const StandbyLetterOfCreditDetails: React.FC<IProps> = (props: IProps) => {
  const { standbyLetterOfCredit, documents, beneficiary, applicant } = props
  const isBeneficiaryKomgoMember = beneficiary && beneficiary.isMember
  const [issuanceDocument] = documents.filter(d => d.hash === standbyLetterOfCredit.documentHash)
  const downloadIssuanceDocument = () => {
    if (issuanceDocument) {
      const contentUrl = `${
        process.env.REACT_APP_API_GATEWAY_URL
      }/api${TRADE_FINANCE_BASE_ENDPOINT}/standby-letters-of-credit/documents/${issuanceDocument.id}/content/`
      initiateFileDownload(issuanceDocument, contentUrl)
    }
  }
  return (
    <React.Fragment>
      <StyledGrid>
        <SblcInfoGroup>
          <ColumnWithPadding width={8}>
            <strong>Status</strong>
          </ColumnWithPadding>
          <ColumnWithPadding width={8} data-test-id="status">
            {sentenceCaseWithLC(standbyLetterOfCredit.status)}
          </ColumnWithPadding>
        </SblcInfoGroup>

        {standbyLetterOfCredit.issuingBankReference && (
          <SblcInfoGroup>
            <ColumnWithPadding width={8}>
              <strong>Issuing bank reference</strong>
            </ColumnWithPadding>
            <ColumnWithPadding width={8} data-test-id="issuingBankReference">
              {standbyLetterOfCredit.issuingBankReference}
            </ColumnWithPadding>
            {!isBeneficiaryKomgoMember &&
              issuanceDocument && (
                <React.Fragment>
                  <ColumnWithPadding width={8}>
                    <strong>Issuance document</strong>
                  </ColumnWithPadding>
                  <ColumnWithPadding width={8}>
                    <SimpleButton
                      onClick={downloadIssuanceDocument}
                      style={{ textDecoration: 'underline', padding: 0 }}
                      data-test-id="issuanceDocument"
                    >
                      {issuanceDocument.name}
                    </SimpleButton>
                  </ColumnWithPadding>
                </React.Fragment>
              )}
          </SblcInfoGroup>
        )}

        <SblcInfoGroup>
          <ColumnWithPadding width={8}>
            <strong>SBLC reference</strong>
          </ColumnWithPadding>
          <ColumnWithPadding width={8} data-test-id="sblcReference">
            {standbyLetterOfCredit.reference}
          </ColumnWithPadding>
          <ColumnWithPadding width={8}>
            <strong>Applicant</strong>
          </ColumnWithPadding>
          <ColumnWithPadding width={8} data-test-id="applicant">
            {applicant.x500Name && applicant.x500Name.CN}
          </ColumnWithPadding>
          <ColumnWithPadding width={8}>
            <strong>Beneficiary</strong>
          </ColumnWithPadding>
          <ColumnWithPadding width={8} data-test-id="beneficiary">
            {applicant.x500Name && beneficiary.x500Name.CN}
          </ColumnWithPadding>
          <ColumnWithPadding width={8}>
            <strong>Expiry</strong>
          </ColumnWithPadding>
          <ColumnWithPadding width={8} data-test-id="expiry">
            {displayDate(standbyLetterOfCredit.expiryDate)}
          </ColumnWithPadding>
          <ColumnWithPadding width={8}>
            <strong>Amount</strong>
          </ColumnWithPadding>
          <ColumnWithPadding width={8} data-test-id="amount">{`${standbyLetterOfCredit.currency} ${Numeral(
            standbyLetterOfCredit.amount
          ).format('0,0.00')}`}</ColumnWithPadding>
        </SblcInfoGroup>
      </StyledGrid>

      {standbyLetterOfCredit.additionalInformation && (
        <AdditionalInfo>
          <strong>Additional information</strong>
          <p data-test-id="additionalInformation">{standbyLetterOfCredit.additionalInformation}</p>
        </AdditionalInfo>
      )}
    </React.Fragment>
  )
}

const StyledGrid = styled(Grid)`
  &&& {
    margin-top: 0;
    margin-bottom: 0;
  }
`

const ColumnWithPadding = styled(Grid.Column)`
  &&&&& {
    padding-top: 0.3rem;
    padding-bottom: 0.3rem;
  }
`

export const SblcInfoGroup = styled(Grid.Row)`
  &&&&& {
    padding-top: 0.7rem;
    padding-bottom: 0.7rem;
  }
`

export const AdditionalInfo = styled.div`
  margin-top: 1rem;
  margin-bottom: 1rem;
`

export default StandbyLetterOfCreditDetails
