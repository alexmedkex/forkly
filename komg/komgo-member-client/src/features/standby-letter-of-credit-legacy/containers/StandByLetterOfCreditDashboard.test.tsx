import * as React from 'react'
import { shallow } from 'enzyme'
import { StandByLetterOfCreditDashboard } from './StandByLetterOfCreditDashboard'
import { buildFakeStandByLetterOfCredit } from '@komgo/types'
import { Table } from 'semantic-ui-react'

describe('StandByLetterOfCreditDashboard', () => {
  let defaultProps

  beforeEach(() => {
    defaultProps = {
      isActive: false,
      tasks: [],
      standByLettersOfCredit: [buildFakeStandByLetterOfCredit({ staticId: '123' })],
      errors: [],
      isFetching: false,
      getTasks: jest.fn(),
      fetchStandByLettersOfCredit: jest.fn()
    }
  })

  it('should match snapshot', () => {
    const wrapper = shallow(<StandByLetterOfCreditDashboard {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should call with default params', () => {
    const wrapper = shallow(<StandByLetterOfCreditDashboard {...defaultProps} />)

    expect(defaultProps.fetchStandByLettersOfCredit).toHaveBeenCalledWith({
      filter: {
        options: { sort: { updatedAt: -1 }, skip: 0, limit: 200 }
      }
    })
  })

  it('should find LoadingTransition when isFetching is true ', () => {
    const wrapper = shallow(<StandByLetterOfCreditDashboard {...defaultProps} isFetching={true} />)

    const loadingTransition = wrapper.find('LoadingTransition')

    expect(loadingTransition.length).toBe(1)
  })

  it('should find ErrorMessage when isFetching is true ', () => {
    const wrapper = shallow(<StandByLetterOfCreditDashboard {...defaultProps} errors={[{ message: 'Test' }]} />)

    const error = wrapper.find('ErrorMessage')

    expect(error.length).toBe(1)
  })

  it('should find Table component with one row when there is one sblc ', () => {
    const wrapper = shallow(<StandByLetterOfCreditDashboard {...defaultProps} />)

    const letters = wrapper
      .find(Table)
      .find(Table.Body)
      .find(Table.Row)

    expect(letters.length).toBe(1)
  })

  it('should set state when user sort table', () => {
    const wrapper = shallow(<StandByLetterOfCreditDashboard {...defaultProps} />)

    const issuingBankHeaderCol = wrapper
      .find(Table)
      .find(Table.Header)
      .find({ 'data-test-id': 'issuingBankReference' })

    issuingBankHeaderCol.simulate('click')

    expect(wrapper.state()).toEqual({ column: 'issuingBankReference', direction: 'descending' })
    expect(defaultProps.fetchStandByLettersOfCredit).toHaveBeenCalledWith({
      filter: {
        options: { sort: { issuingBankReference: -1 }, skip: 0, limit: 200 }
      }
    })
  })
})
