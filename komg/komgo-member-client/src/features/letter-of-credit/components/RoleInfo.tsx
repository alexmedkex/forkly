import { Popup } from 'semantic-ui-react'
import { startCase } from 'lodash'
import { List } from 'semantic-ui-react'
import { truncate } from '../../../utils/casings'
import * as React from 'react'
import styled from 'styled-components'
import { ILetterOfCreditEnriched } from '../store/types'
import { findRole } from '../utils/findRole'

const ApplicantLabel = styled.span`
  display: inline-block;
  font-weight: bold;
  width: 120px;
`

const Applicant = styled.span`
  margin: 0;
  line-height: 2;
  white-space: nowrap;
`
interface IProps {
  letter: ILetterOfCreditEnriched
}

const RoleInfo: React.FC<IProps> = ({ letter }) => {
  const { applicant, beneficiary, issuingBank, beneficiaryBank } = letter.templateInstance.data
  const applicantCommonName = applicant.x500Name.CN
  const beneficiaryCommonName = beneficiary.x500Name.CN
  const issuingBankCommonName = issuingBank.x500Name.CN
  const beneficiaryBankCommonName = beneficiaryBank && beneficiaryBank.x500Name.CN
  return (
    <Popup
      on="hover"
      position="bottom right"
      hoverable={true}
      trigger={<a href="#">{startCase(letter.role)}</a>}
      content={
        <List style={{ width: '300px' }}>
          <List.Item>
            <ApplicantLabel>Applicant:</ApplicantLabel>
            <Applicant>{truncate(applicantCommonName, 20)}</Applicant>
          </List.Item>
          <List.Item>
            <ApplicantLabel>Beneficiary:</ApplicantLabel>
            <Applicant>{truncate(beneficiaryCommonName, 20)}</Applicant>
          </List.Item>
          <List.Item>
            <ApplicantLabel>Issuing Bank:</ApplicantLabel>
            <Applicant>{truncate(issuingBankCommonName, 20)}</Applicant>
          </List.Item>
          {beneficiaryBank ? (
            <List.Item>
              <ApplicantLabel>Advising Bank:</ApplicantLabel>
              {truncate(beneficiaryBankCommonName, 20)}
            </List.Item>
          ) : null}
        </List>
      }
    />
  )
}

export default RoleInfo
