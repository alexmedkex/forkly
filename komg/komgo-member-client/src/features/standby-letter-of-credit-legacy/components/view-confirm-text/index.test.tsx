import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { ViewConfirm } from '.'
import { ReviewDecision } from '../issue-form'
import { fakeMember } from '../../../letter-of-credit-legacy/utils/faker'
import { buildFakeStandByLetterOfCredit, StandbyLetterOfCreditTaskType } from '@komgo/types'

describe('view confirm text', () => {
  it('matches snapshot on rejection', () => {
    expect(
      renderer
        .create(
          <ViewConfirm
            taskType={StandbyLetterOfCreditTaskType.ReviewRequested}
            reviewDecision={ReviewDecision.RejectApplication}
            applicant={fakeMember({ commonName: 'BP' })}
            standbyLetterOfCredit={buildFakeStandByLetterOfCredit()}
          />
        )
        .toJSON()
    ).toMatchSnapshot()
  })
  it('matches snapshot on approval', () => {
    expect(
      renderer
        .create(
          <ViewConfirm
            taskType={StandbyLetterOfCreditTaskType.ReviewRequested}
            reviewDecision={ReviewDecision.ApproveApplication}
            applicant={fakeMember({ commonName: 'BP' })}
            standbyLetterOfCredit={buildFakeStandByLetterOfCredit()}
          />
        )
        .toJSON()
    ).toMatchSnapshot()
  })
})
