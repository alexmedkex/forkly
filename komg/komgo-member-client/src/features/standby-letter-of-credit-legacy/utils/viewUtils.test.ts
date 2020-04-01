import * as React from 'react'
import uuid from 'uuid'
import { fakeMember } from '../../letter-of-credit-legacy/utils/faker'
import { IssueFormValues, ReviewDecision } from '../components/issue-form'
import { buildFakeStandByLetterOfCredit, StandbyLetterOfCreditTaskType } from '@komgo/types'
import { isSubmitResponseEnabled, viewSubmitHandler } from './viewUtils'

let beneficiary = fakeMember({ isMember: true })
const values: IssueFormValues = {
  standbyLetterOfCredit: buildFakeStandByLetterOfCredit(),
  reviewDecision: ReviewDecision.ApproveApplication
}
const document = new File([''], 'filename', { type: 'text/html' })

describe('isSubmitResponseEnabled', () => {
  describe('task SBLC.ReviewRequested', () => {
    describe('decision ReviewDecision.RejectApplication', () => {
      beforeAll(() => {
        values.reviewDecision = ReviewDecision.RejectApplication
      })
      it('returns true', () => {
        expect(isSubmitResponseEnabled(values, beneficiary, StandbyLetterOfCreditTaskType.ReviewRequested)).toEqual(
          true
        )
      })
    })
    describe('decision ReviewDecision.ApproveApplication', () => {
      beforeAll(() => {
        values.reviewDecision = ReviewDecision.ApproveApplication
      })
      describe('beneficiary is member', () => {
        beforeAll(() => {
          beneficiary = fakeMember({ isMember: true })
        })
        it('returns true with faker sblc', () => {
          expect(isSubmitResponseEnabled(values, beneficiary, StandbyLetterOfCreditTaskType.ReviewRequested)).toEqual(
            true
          )
        })
        it('return false without an issuing bank ref', () => {
          expect(
            isSubmitResponseEnabled(
              { ...values, standbyLetterOfCredit: buildFakeStandByLetterOfCredit({ issuingBankReference: '' }) },
              beneficiary,
              StandbyLetterOfCreditTaskType.ReviewRequested
            )
          ).toEqual(false)
        })
        it('return false without an issuing bank postal address', () => {
          expect(
            isSubmitResponseEnabled(
              { ...values, standbyLetterOfCredit: buildFakeStandByLetterOfCredit({ issuingBankPostalAddress: '' }) },
              beneficiary,
              StandbyLetterOfCreditTaskType.ReviewRequested
            )
          ).toEqual(false)
        })
      })
      describe('beneficiary is not member', () => {
        beforeAll(() => {
          beneficiary = fakeMember({ isMember: false })
        })
        it('returns false with faker sblc', () => {
          expect(isSubmitResponseEnabled(values, beneficiary, StandbyLetterOfCreditTaskType.ReviewRequested)).toEqual(
            false
          )
        })
        it('returns true with a document set', () => {
          expect(
            isSubmitResponseEnabled({ ...values, document }, beneficiary, StandbyLetterOfCreditTaskType.ReviewRequested)
          ).toEqual(true)
        })
      })
    })
  })
})

describe('viewSubmitHandler', () => {
  describe('task SBLC.ReviewRequested', () => {
    describe('decision ReviewDecision.ApproveApplication', () => {
      beforeAll(() => {
        values.reviewDecision = ReviewDecision.ApproveApplication
      })
      it('calls issueStandbyLetterOfCredit with correct args', () => {
        const issue = jest.fn()
        const reject = jest.fn()

        viewSubmitHandler({ ...values, document }, StandbyLetterOfCreditTaskType.ReviewRequested, issue, reject)

        expect(issue).toHaveBeenCalledWith(values.standbyLetterOfCredit, document)
      })
      it('does not call rejectStandbyLetterOfCreditRequest', () => {
        const issue = jest.fn()
        const reject = jest.fn()

        viewSubmitHandler(values, StandbyLetterOfCreditTaskType.ReviewRequested, issue, reject)

        expect(reject).not.toHaveBeenCalled()
      })
    })
    describe('decision ReviewDecision.RejectApplication', () => {
      beforeAll(() => {
        values.reviewDecision = ReviewDecision.RejectApplication
      })
      it('calls rejectStandbyLetterOfCreditRequest with correct args', () => {
        const issue = jest.fn()
        const reject = jest.fn()

        const rejectionReference = uuid.v4()

        viewSubmitHandler(
          { ...values, rejectionReference },
          StandbyLetterOfCreditTaskType.ReviewRequested,
          issue,
          reject
        )

        expect(reject).toHaveBeenCalledWith(values.standbyLetterOfCredit.staticId, rejectionReference)
      })
      it('does not call issueStandbyLetterOfCredit', () => {
        const issue = jest.fn()
        const reject = jest.fn()

        viewSubmitHandler(values, StandbyLetterOfCreditTaskType.ReviewRequested, issue, reject)

        expect(issue).not.toHaveBeenCalled()
      })
    })
  })
})
