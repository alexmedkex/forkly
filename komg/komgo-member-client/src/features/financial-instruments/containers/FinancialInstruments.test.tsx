import * as React from 'react'
import { shallow } from 'enzyme'
import { TableProps } from 'semantic-ui-react'
import { tradeFinanceManager } from '@komgo/permissions'

import { FinancialInstruments, SBLC } from './FinancialInstruments'

describe('FinancialInstruments', () => {
  let defaultProps

  beforeEach(() => {
    defaultProps = {
      location: {
        search: '',
        pathname: 'test'
      },
      history: {
        push: jest.fn()
      },
      numberOfLC: 1,
      numberOfSBLC: 2,
      isAuthorized: jest.fn(() => true),
      isLicenseEnabled: jest.fn(() => true)
    }
  })

  it('should render without crashing', () => {
    const wrapper = shallow(<FinancialInstruments {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('active index should be 0 per default', () => {
    const wrapper = shallow(<FinancialInstruments {...defaultProps} />)

    expect(wrapper.state().activeTab).toBe(0)
  })

  it('active index should be 1 if we have SBLC in url', () => {
    const wrapper = shallow(<FinancialInstruments {...defaultProps} location={{ search: `?tab=${SBLC}` }} />)

    expect(wrapper.state().activeTab).toBe(1)
  })

  it('should change activeTab in state when handleTabChanges is called', () => {
    const wrapper = shallow(<FinancialInstruments {...defaultProps} />)

    const instance = wrapper.instance() as FinancialInstruments

    instance.handleTabChanges({} as React.MouseEvent<HTMLDivElement>, { activeIndex: 1 } as TableProps)

    expect(wrapper.state().activeTab).toBe(1)
    expect(defaultProps.history.push).toHaveBeenLastCalledWith('test?tab=Standby%20Letters%20of%20Credit')
  })

  it('active index should be 0 if we have SBLC in url but user is not authorized for sblc', () => {
    const isAuthorized = jest.fn(() => false)
    const wrapper = shallow(
      <FinancialInstruments {...defaultProps} location={{ search: `?tab=${SBLC}` }} isAuthorized={isAuthorized} />
    )

    expect(wrapper.state().activeTab).toBe(0)
  })

  it('should find Unauthorized component when user do not have permission for lc or sblc', () => {
    const isAuthorized = jest.fn(() => false)
    const wrapper = shallow(<FinancialInstruments {...defaultProps} isAuthorized={isAuthorized} />)

    const unauthorized = wrapper.find('Unauthorized')

    expect(unauthorized.length).toBe(1)
  })

  it('getPanes should return empty array when user do not have permission to see lc or sblc', () => {
    const isAuthorized = jest.fn(() => false)
    const wrapper = shallow(<FinancialInstruments {...defaultProps} isAuthorized={isAuthorized} />)

    const instance = wrapper.instance() as FinancialInstruments

    expect(instance.getPanes()).toEqual([])
  })

  it('getPanes should return empty array when user do not have license to see lc or sblc', () => {
    const isLicenseEnabled = jest.fn(() => false)
    const wrapper = shallow(<FinancialInstruments {...defaultProps} isLicenseEnabled={isLicenseEnabled} />)

    expect(wrapper.text()).toContain('Unauthorized')
  })

  it('getPanes should return array with one tab', () => {
    const isAuthorized = jest.fn(permission => {
      return tradeFinanceManager.canReadReviewIssuedLC === permission ? true : false
    })
    const wrapper = shallow(<FinancialInstruments {...defaultProps} isAuthorized={isAuthorized} />)

    const instance = wrapper.instance() as FinancialInstruments

    expect(instance.getPanes().length).toBe(1)
  })
})
