import React from 'react'
import { Header } from 'semantic-ui-react'
import { ICompany, IDataLetterOfCredit, ILetterOfCredit } from '@komgo/types'
import styled from 'styled-components'
import { ButtonLink } from '../../../components/button-link/ButtonLink'
import { formatPrice } from '../../trades/utils/displaySelectors'
import { SPACES, coolGrey } from '@komgo/ui-components'
import { Spacer } from '../../../components/spacer/Spacer'
import { Status } from './Status'
import { hasSomeCounterpartiesOffPlatform } from '../utils/hasSomeCounterpartiesOffPlatform'
import { findRole } from '../utils/findRole'

const Label = styled.span`
  font-weight: bold;
  text-align: left;
  padding-right: 20px;
`

const Panel = styled.div`
  padding: 30px 0px 30px 0px;
  display: grid;
  grid-template-columns: 50% 50%;
  grid-row-gap: 8px;
`

const Note = styled.p`
  font-style: italic;
  color: ${coolGrey};
  margin-top: auto;
`

const Counterparty = ({ role, member }: { role: string; member: ICompany }) => {
  const { isMember } = member
  return (
    <span data-test-id={role}>
      {member.x500Name.CN}
      {!isMember && <span data-test-id="is-not-member"> * </span>}
    </span>
  )
}

export interface ViewLetterOfCreditDetailsProps {
  letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>
  companyStaticId: string
}

export const ViewLetterOfCreditDetails = ({
  letterOfCredit,
  letterOfCredit: {
    templateInstance: { data },
    reference,
    status,
    staticId
  }
}: ViewLetterOfCreditDetailsProps) => {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: SPACES.DEFAULT }}>
        <Header>Application summary</Header>
      </div>
      <br />
      <ButtonLink to={`/letters-of-credit/${staticId}/trade`} target="_blank">
        View trade details
      </ButtonLink>
      <Panel>
        <Label>Status</Label>
        <Status data-test-id="status" status={status} />
        <Label>Reference</Label>
        <span data-test-id="reference">{reference}</span>
        <Label>Expiry date</Label>
        <span data-test-id="expire-date">
          {hasSomeCounterpartiesOffPlatform(letterOfCredit) ? '-' : data.expiryDate}
        </span>
        <Label>Amount</Label>
        <span data-test-id="amount">
          {hasSomeCounterpartiesOffPlatform(letterOfCredit) ? (
            '-'
          ) : (
            <>
              <span data-test-id="amount-currency">{data.currency}</span>{' '}
              <span data-test-id="amount-price">{formatPrice(data.amount)}</span>
            </>
          )}
        </span>
        <Label />
        <Spacer margin={SPACES.EXTRA_SMALL} />
        <Label>Applicant</Label>
        <Counterparty role={findRole(letterOfCredit, data.applicant.staticId).toLowerCase()} member={data.applicant} />
        <Label>Beneficiary</Label>
        <Counterparty
          role={findRole(letterOfCredit, data.beneficiary.staticId).toLowerCase()}
          member={data.beneficiary}
        />
        <Label>Issuing bank</Label>
        <Counterparty
          role={findRole(letterOfCredit, data.issuingBank.staticId).toLowerCase()}
          member={data.issuingBank}
        />
        <Label>Issuing bank ref.</Label>
        <span data-test-id="issuing-bank-reference">
          {typeof data.issuingBankReference === 'string' ? data.issuingBankReference : 'N/A'}
        </span>
      </Panel>
      {hasSomeCounterpartiesOffPlatform(letterOfCredit) && (
        <Note data-test-id="off-platform">
          * Please note that these counterparties are currently not registered as Komgo members and will need to be
          reached via other media
        </Note>
      )}
    </>
  )
}
