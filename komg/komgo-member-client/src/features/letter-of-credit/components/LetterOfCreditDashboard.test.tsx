import React from 'react'
import { buildFakeLetterOfCredit, LetterOfCreditTaskType } from '@komgo/types'
import { render, wait, fireEvent, cleanup, act } from '@testing-library/react'
import { MemoryRouter as Router } from 'react-router-dom'
import { fakeTask, mockDate } from '../../letter-of-credit-legacy/utils/faker'
import { LetterOfCreditDashboard, LetterOfCreditDashboardProps } from './LetterOfCreditDashboard'
import { buildLetterOfCreditEnriched } from '../utils/buildLetterOfCreditEnriched'
import { LETTER_OF_CREDIT_TYPE_LABELS } from '../store/types'
import { TaskStatus } from '../../tasks/store/types'

jest.mock('semantic-ui-react/dist/commonjs/addons/Portal/Portal', () => ({ children }) => children)

describe('LetterOfCreditDashboard', () => {
  const defaultProps: LetterOfCreditDashboardProps = {
    tasks: [],
    standbyLetters: 0,
    documentaryLetters: 0,
    lettersOfCredit: [],
    history: { push: jest.fn() } as any,
    location: {
      pathname: '',
      search: 'tradeId=123',
      state: '',
      hash: ''
    },
    match: {
      isExact: true,
      path: '',
      url: '',
      params: null
    },
    staticContext: undefined
  }
  beforeEach(() => {
    mockDate().freeze('Tue Nov 13 2018 00:00:00 GMT+0000 (UTC)')
    jest.resetAllMocks()
  })

  afterEach(() => {
    afterEach(cleanup)
  })

  it('renders an empty UI', () => {
    const { asFragment } = render(
      <Router>
        <LetterOfCreditDashboard {...defaultProps} />
      </Router>
    )

    expect(asFragment()).toMatchSnapshot()
  })

  describe('Standby', () => {
    it('renders', () => {
      const tasks = []
      const companyStaticId = 'cf63c1f8-1165-4c94-a8f8-9252eb4f0016' // copied from buildLetterOfCreditEnriched
      const offPlatformLetterOfCredit = buildLetterOfCreditEnriched(buildFakeLetterOfCredit(), tasks, companyStaticId)
      offPlatformLetterOfCredit.templateInstance.data.beneficiary.isMember = false
      const lettersOfCredit = [
        buildLetterOfCreditEnriched(buildFakeLetterOfCredit(), tasks, companyStaticId),
        buildLetterOfCreditEnriched(buildFakeLetterOfCredit(), tasks, companyStaticId),
        offPlatformLetterOfCredit
      ]
      const { asFragment } = render(
        <Router>
          <LetterOfCreditDashboard {...defaultProps} lettersOfCredit={lettersOfCredit} />
        </Router>
      )

      expect(asFragment()).toMatchSnapshot()
    })

    it('opens a standby letter of credit', async () => {
      const tasks = []
      const letterStaticId = 'cf5bb000-0e55-43f5-b0f4-34e72201f414'
      const reference = 'ref-123'
      const companyStaticId = 'cf63c1f8-1165-4c94-a8f8-9252eb4f0016' // copied from buildLetterOfCreditEnriched
      const lettersOfCredit = [
        buildLetterOfCreditEnriched(
          buildFakeLetterOfCredit({ staticId: letterStaticId, reference }),
          tasks,
          companyStaticId
        )
      ]
      const component = render(
        <Router>
          <LetterOfCreditDashboard {...defaultProps} lettersOfCredit={lettersOfCredit} />
        </Router>
      )

      await wait(() => {
        fireEvent.click(component.getByTestId(`${reference}-dropdown`))
      })
      await wait(() => {
        fireEvent.click(component.getByText('View SBLC'))
      })

      expect(defaultProps.history.push).toHaveBeenCalledWith(`/letters-of-credit/${letterStaticId}`)
    })

    it('review a standby letter of credit', async () => {
      const letterStaticId = 'cf5bb000-0e55-43f5-b0f4-34e72201f414'
      const reference = 'ref-123'
      const companyStaticId = 'cf63c1f8-1165-4c94-a8f8-9252eb4f0016' // copied from buildLetterOfCreditEnriched
      const task = fakeTask({
        type: LetterOfCreditTaskType.ReviewRequested as any,
        context: { staticId: letterStaticId }
      })
      const lettersOfCredit = [
        buildLetterOfCreditEnriched(
          buildFakeLetterOfCredit({ staticId: letterStaticId, reference }),
          [task],
          companyStaticId
        )
      ]
      const component = render(
        <Router>
          <LetterOfCreditDashboard {...defaultProps} lettersOfCredit={lettersOfCredit} tasks={[task]} />
        </Router>
      )

      await wait(() => {
        fireEvent.click(component.getByTestId(`${reference}-dropdown`))
      })
      await wait(() => {
        fireEvent.click(component.getByText(LETTER_OF_CREDIT_TYPE_LABELS[task.taskType]))
      })

      expect(defaultProps.history.push).toHaveBeenCalledWith(`/letters-of-credit/${letterStaticId}`)
    })

    it('opens a standby letter of credit when a ReviewRequested is done', async () => {
      const letterStaticId = 'cf5bb000-0e55-43f5-b0f4-34e72201f414'
      const reference = 'ref-123'
      const companyStaticId = 'cf63c1f8-1165-4c94-a8f8-9252eb4f0016' // copied from buildLetterOfCreditEnriched
      const task = fakeTask({
        type: LetterOfCreditTaskType.ReviewRequested as any,
        status: TaskStatus.Done,
        context: { staticId: letterStaticId }
      })
      const lettersOfCredit = [
        buildLetterOfCreditEnriched(
          buildFakeLetterOfCredit({ staticId: letterStaticId, reference }),
          [task],
          companyStaticId
        )
      ]
      const component = render(
        <Router>
          <LetterOfCreditDashboard {...defaultProps} lettersOfCredit={lettersOfCredit} tasks={[task]} />
        </Router>
      )

      await wait(() => {
        fireEvent.click(component.getByTestId(`${reference}-dropdown`))
      })
      await wait(() => {
        fireEvent.click(component.getByText('View SBLC'))
      })

      expect(defaultProps.history.push).toHaveBeenCalledWith(`/letters-of-credit/${letterStaticId}`)
    })

    it('opens a standby letter of credit when a ReviewIssued is done', async () => {
      const letterStaticId = 'cf5bb000-0e55-43f5-b0f4-34e72201f414'
      const reference = 'ref-123'
      const companyStaticId = 'cf63c1f8-1165-4c94-a8f8-9252eb4f0016' // copied from buildLetterOfCreditEnriched
      const task = fakeTask({
        type: LetterOfCreditTaskType.ReviewIssued as any,
        status: TaskStatus.Done,
        context: { staticId: letterStaticId }
      })
      const lettersOfCredit = [
        buildLetterOfCreditEnriched(
          buildFakeLetterOfCredit({ staticId: letterStaticId, reference }),
          [task],
          companyStaticId
        )
      ]
      const component = render(
        <Router>
          <LetterOfCreditDashboard {...defaultProps} lettersOfCredit={lettersOfCredit} tasks={[task]} />
        </Router>
      )

      await wait(() => {
        fireEvent.click(component.getByTestId(`${reference}-dropdown`))
      })
      await wait(() => {
        fireEvent.click(component.getByText('View SBLC'))
      })

      expect(defaultProps.history.push).toHaveBeenCalledWith(`/letters-of-credit/${letterStaticId}`)
    })
  })
})
