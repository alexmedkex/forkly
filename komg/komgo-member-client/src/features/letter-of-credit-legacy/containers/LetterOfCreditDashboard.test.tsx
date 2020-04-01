import * as React from 'react'
import { shallow } from 'enzyme'
import * as renderer from 'react-test-renderer'
import { MemoryRouter as Router } from 'react-router-dom'
import {
  ILetterOfCreditDashboardProps,
  LetterOfCreditDashboard
} from '../../letter-of-credit-legacy/containers/LetterOfCreditDashboard'
import { fakeLetterOfCreditEnriched } from '../../letter-of-credit-legacy/utils/faker'

const props: ILetterOfCreditDashboardProps = {
  lettersOfCredit: [fakeLetterOfCreditEnriched()],
  errors: [],
  isFetching: false,
  tasks: [],
  companyStaticId: '123',
  isActive: true,
  fetchLettersOfCredit: jest.fn(),
  getTasks: jest.fn(),
  setTaskInModal: jest.fn()
}

describe('LetterOfCreditDashboard', () => {
  it('renders', () => {
    expect(
      renderer
        .create(
          <Router>
            <LetterOfCreditDashboard {...props} />
          </Router>
        )
        .toJSON()
    ).toMatchSnapshot()
  })

  describe('orderBy', () => {
    const defaultSort = 'reference'
    describe('defaults', () => {
      it(defaultSort, () => {
        const table = shallow<LetterOfCreditDashboard>(<LetterOfCreditDashboard {...props} />)
        table.find(`#${defaultSort}`).simulate('click')

        expect(props.fetchLettersOfCredit).toHaveBeenCalledWith({
          filter: {
            options: {
              sort: { 'referenceObject.trigram': -1, 'referenceObject.value': -1, 'referenceObject.year': -1 }
            }
          }
        })
      })
    })

    const COLUMNS = ['issuingBankReference', 'expiryDate', 'latestShipment', 'role', 'amount', 'status']
    describe('DESC', () => {
      COLUMNS.forEach(column =>
        it(column, () => {
          const table = shallow<LetterOfCreditDashboard>(<LetterOfCreditDashboard {...props} />)
          table.find(`#${column}`).simulate('click')

          expect(props.fetchLettersOfCredit).toHaveBeenCalledWith({ filter: { options: { sort: { [column]: -1 } } } })
        })
      )
    })

    describe('ASC', () => {
      COLUMNS.forEach(column =>
        it(column, () => {
          const table = shallow<LetterOfCreditDashboard>(<LetterOfCreditDashboard {...props} />)
          table.find(`#${column}`).simulate('click')
          table.find(`#${column}`).simulate('click')

          expect(props.fetchLettersOfCredit).toHaveBeenCalledWith({ filter: { options: { sort: { [column]: 1 } } } })
        })
      )
    })

    describe('componentDidMount', () => {
      it('calls fetchLettersOfCredit', () => {
        props.fetchLettersOfCredit = jest.fn()
        shallow<LetterOfCreditDashboard>(<LetterOfCreditDashboard {...props} />)

        expect(props.fetchLettersOfCredit).toHaveBeenCalledTimes(1)
        expect(props.fetchLettersOfCredit).toHaveBeenCalledWith({ filter: { options: { sort: { updatedAt: -1 } } } })
      })
    })
  })
})
