import React from 'react'
import { render } from '@testing-library/react'
import { ViewLetterOfCreditDetails, ViewLetterOfCreditDetailsProps } from './ViewLetterOfCreditDetails'
import { v4 } from 'uuid'
import { buildFakeLetterOfCredit } from '@komgo/types'
import { MemoryRouter as Router } from 'react-router-dom'

const applicantId = v4()

const testProps: ViewLetterOfCreditDetailsProps = {
  companyStaticId: applicantId,
  letterOfCredit: buildFakeLetterOfCredit()
}
testProps.letterOfCredit.templateInstance.data.applicant.staticId = applicantId

describe('ViewLetterOfCreditDetails', () => {
  it('matches snapshot', () => {
    const { asFragment } = render(
      <Router>
        <ViewLetterOfCreditDetails {...testProps} />
      </Router>
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it('marks not member counterpaty', () => {
    const { letterOfCredit } = testProps
    const updateLetterOfCredit = {
      ...letterOfCredit,
      templateInstance: {
        ...letterOfCredit.templateInstance,
        data: {
          ...letterOfCredit.templateInstance.data,
          issuingBank: {
            ...letterOfCredit.templateInstance.data.issuingBank,
            isMember: false
          }
        }
      }
    }
    const { asFragment } = render(
      <Router>
        <ViewLetterOfCreditDetails {...testProps} letterOfCredit={updateLetterOfCredit} />
      </Router>
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
