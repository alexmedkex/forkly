import React from 'react'
import { IMember } from '../../members/store/types'
import { SPACES } from '@komgo/ui-components'
import { ReviewDecision } from '../constants'

interface ConfirmStandbyLetterOfCreditReviewProps {
  beneficiary: IMember
  applicant: IMember
  reviewDecision: ReviewDecision
}

export const ConfirmStandbyLetterOfCreditReview: React.FC<ConfirmStandbyLetterOfCreditReviewProps> = ({
  beneficiary,
  applicant,
  reviewDecision
}: ConfirmStandbyLetterOfCreditReviewProps) => {
  return (
    <>
      {reviewDecision === ReviewDecision.IssueSBLC ? (
        <div style={{ paddingTop: SPACES.DEFAULT }}>
          <p>
            You are about to issue the SBLC by order of <b>{applicant.x500Name.CN}</b> in favour of{' '}
            <b>{beneficiary.x500Name.CN}</b>.
          </p>
          <p>
            The issued SBLC will be shared on komgo with :
            <br />
            <b>{applicant.x500Name.CN}</b>
            {beneficiary.isMember && (
              <>
                <br />
                <b>{beneficiary.x500Name.CN}</b>
              </>
            )}
          </p>
          {!beneficiary.isMember && (
            <p>
              Please note that <b>{beneficiary.x500Name.CN}</b> is not currently registered as a komgo member and will
              have to be reached via other media.
            </p>
          )}
        </div>
      ) : (
        <div style={{ paddingTop: SPACES.DEFAULT }}>
          <p>
            You are about to reject the SBLC submitted by <b>{applicant.x500Name.CN}</b> in favour of{' '}
            <b>{beneficiary.x500Name.CN}</b>.
          </p>
          <p>
            The rejection notification will be shared on komgo with :
            <br />
            <b>{applicant.x500Name.CN}</b>
            {beneficiary.isMember && (
              <>
                <br />
                <b>{beneficiary.x500Name.CN}</b>
              </>
            )}
          </p>
          {!beneficiary.isMember && (
            <p>
              Please note that <b>{beneficiary.x500Name.CN}</b> is not currently registered as a komgo member and will
              have to be reached via other media.
            </p>
          )}
        </div>
      )}
    </>
  )
}
