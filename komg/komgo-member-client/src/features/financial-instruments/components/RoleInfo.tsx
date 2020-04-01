import { Popup } from 'semantic-ui-react'
import { startCase } from 'lodash'
import { List } from 'semantic-ui-react'
import { sentenceCase, truncate } from '../../../utils/casings'
import * as React from 'react'
import { ILetterOfCreditEnriched } from '../../letter-of-credit-legacy/containers/LetterOfCreditDashboard'
import styled from 'styled-components'
import { IStandByLetterOfCreditEnriched } from '../../standby-letter-of-credit-legacy/containers/StandByLetterOfCreditDashboard'

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
  letter: ILetterOfCreditEnriched | IStandByLetterOfCreditEnriched
}

const RoleInfo: React.FC<IProps> = ({ letter }) => {
  return (
    <Popup
      on="hover"
      position="bottom right"
      trigger={<a href="#">{startCase(letter.role)}</a>}
      content={
        <List style={{ width: '300px' }}>
          <List.Item>
            <ApplicantLabel>Applicant:</ApplicantLabel>
            <Applicant>{truncate(letter.applicant, 20)}</Applicant>
          </List.Item>
          <List.Item>
            <ApplicantLabel>Beneficiary:</ApplicantLabel>
            <Applicant>{truncate(letter.beneficiary, 20)}</Applicant>
          </List.Item>
          <List.Item>
            <ApplicantLabel>Issuing Bank:</ApplicantLabel>
            <Applicant>{truncate(letter.issuingBank, 20)}</Applicant>
          </List.Item>
          {letter.beneficiaryBank ? (
            <List.Item>
              <ApplicantLabel>Advising Bank:</ApplicantLabel>
              {truncate(letter.beneficiaryBank, 20)}
            </List.Item>
          ) : null}
        </List>
      }
    />
  )
}

export default RoleInfo
