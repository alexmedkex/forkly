import React from 'react'
import { ILetterOfCreditBase, IDataLetterOfCreditBase } from '@komgo/types'
import { findCounterpartyByStatic } from '../../letter-of-credit-legacy/utils/selectors'
import { Counterparty } from '../../counterparties/store/types'
import { IMember } from '../../members/store/types'
import { SPACES } from '@komgo/ui-components'

interface ConfirmStandbyLetterOfCreditSubmissionProps {
  buyerEtrmId: string
  letterOfCredit: ILetterOfCreditBase<IDataLetterOfCreditBase>
  issuingBanks: Counterparty[]
  beneficiary: IMember
}
export const ConfirmStandbyLetterOfCreditSubmission: React.FC<ConfirmStandbyLetterOfCreditSubmissionProps> = ({
  buyerEtrmId,
  letterOfCredit,
  issuingBanks,
  beneficiary
}: ConfirmStandbyLetterOfCreditSubmissionProps) => {
  return (
    <div style={{ paddingTop: SPACES.DEFAULT }}>
      <p>
        You are about to submit an application for the financing of trade <b>{buyerEtrmId}</b>.
      </p>
      <p>
        The application will be shared on komgo with :
        <br />
        <b>
          {letterOfCredit &&
            findCounterpartyByStatic(issuingBanks, letterOfCredit.templateInstance.data.issuingBank.staticId).x500Name
              .CN}
        </b>
        {beneficiary.isMember && (
          <>
            <br />
            <b>{beneficiary.x500Name.CN}</b>
          </>
        )}
      </p>
      {!beneficiary.isMember && (
        <p>
          Please note that <b>{beneficiary.x500Name.CN}</b> is not currently registered as a komgo member and will have
          to be reached via other media.
        </p>
      )}
    </div>
  )
}
