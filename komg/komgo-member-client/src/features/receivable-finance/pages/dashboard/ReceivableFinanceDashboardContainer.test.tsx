import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { MemoryRouter as Router } from 'react-router'

import { fakeMember } from '../../../letter-of-credit-legacy/utils/faker'
import { createMemoryHistory } from 'history'
import {
  ReceivableFinanceDashboardContainer,
  IReceivableFinanceDashboardContainerProps
} from './ReceivableFinanceDashboardContainer'
import { IMember } from '../../../members/store/types'
import {
  fakeReceivablesDiscounting,
  fakeReceivableDiscountingDashboardTrader,
  fakeReceivableDiscountingDashboardBank
} from '../../../receivable-discounting-legacy/utils/faker'
import { shallow } from 'enzyme'
import { Unauthorized, LoadingTransition, ErrorMessage } from '../../../../components'
import { tradeFinanceManager } from '@komgo/permissions'
import { IReceivablesDiscountingInfo } from '@komgo/types'
import RFDashboardTraderTable, { IRFDashboardTraderTableProps } from './components/RFDashboardTraderTable'
import RFDashboardBankTable from './components/RFDashboardBankTable'
import { buildFakeError } from '../../../../store/common/faker'
import { SortDirection } from '../../../../store/common/types'

const fakeMembers: IMember[] = [fakeMember(), fakeMember()]

const fakeRds: IReceivablesDiscountingInfo[] = [fakeReceivablesDiscounting(), fakeReceivablesDiscounting()]

let testProps: IReceivableFinanceDashboardContainerProps

describe('ReceivableFinanceDashboardContainer', () => {
  beforeEach(() => {
    testProps = {
      members: fakeMembers,
      rds: fakeRds,
      data: [],
      isFinancialInstitution: undefined,
      company: 'company',
      isFetching: false,
      fetchConnectedCounterpartiesAsync: jest.fn(),
      fetchRdsByStaticIds: jest.fn(),
      fetchTradesWithRd: jest.fn(),
      fetchMembers: jest.fn(),
      isAuthorized: jest.fn(() => true),
      isLicenseEnabled: jest.fn(() => true),
      isLicenseEnabledForCompany: jest.fn(() => true),
      localErrors: [],
      errors: [],
      history: createMemoryHistory(),
      staticContext: undefined,
      location: {
        pathname: '/receivable-discounting',
        search: '',
        state: '',
        hash: ''
      },
      match: {
        isExact: false,
        path: '',
        url: '',
        params: {
          id: 1
        }
      }
    }
  })

  it('should render unauthorized if not authorized', () => {
    const wrapper = shallow(<ReceivableFinanceDashboardContainer {...testProps} isAuthorized={() => false} />)

    expect(wrapper.find(Unauthorized).length).toBe(1)
  })

  it('should show loading message if fetching', () => {
    const wrapper = shallow(<ReceivableFinanceDashboardContainer {...testProps} isFetching={true} />)

    expect(wrapper.find(LoadingTransition).length).toBe(1)
  })

  it('should render error message if errors are present', () => {
    const wrapper = shallow(<ReceivableFinanceDashboardContainer {...testProps} errors={[buildFakeError()]} />)

    expect(wrapper.find(ErrorMessage).length).toBe(1)
  })

  it('should render error message if local errors are present', () => {
    const wrapper = shallow(<ReceivableFinanceDashboardContainer {...testProps} localErrors={['Some error']} />)

    expect(wrapper.find(ErrorMessage).length).toBe(1)
  })

  it('renders correctly', () => {
    expect(
      renderer
        .create(
          <Router>
            <ReceivableFinanceDashboardContainer {...testProps} />
          </Router>
        )
        .toJSON()
    ).toMatchSnapshot()
  })

  it('fetches connected counterparties', () => {
    shallow(<ReceivableFinanceDashboardContainer {...testProps} />)

    expect(testProps.fetchConnectedCounterpartiesAsync).toHaveBeenCalled()
  })

  it('updates url with sort parameters', () => {
    const wrapper = shallow(<ReceivableFinanceDashboardContainer {...testProps} />)
    const instance = wrapper.instance() as ReceivableFinanceDashboardContainer

    instance.handleSorting({ key: 'some-key' })
    expect(testProps.history.location.search).toContain('key=some-key&direction=descending')
    instance.handleSorting({ key: 'some-key' })
    expect(testProps.history.location.search).toContain('key=some-key&direction=ascending')
  })

  it('sorts based on url params', () => {
    const mockLocation = {
      pathname: '',
      search: `key=counterparty&direction=ascending`,
      state: '',
      hash: ''
    }
    const wrapper = shallow(<ReceivableFinanceDashboardContainer {...testProps} location={mockLocation} />)

    const table = wrapper.find(RFDashboardTraderTable)
    const props = table.props() as IRFDashboardTraderTableProps

    expect(props.sort).toEqual({ key: 'counterparty', direction: SortDirection.Ascending })
  })

  describe('as a trader', () => {
    let props: IReceivableFinanceDashboardContainerProps

    beforeEach(() => {
      props = {
        ...testProps,
        data: [{ ...fakeReceivableDiscountingDashboardTrader() }, fakeReceivableDiscountingDashboardTrader()],
        isFinancialInstitution: false
      }
    })

    it('creates a table specific to the trader', () => {
      const wrapper = shallow(<ReceivableFinanceDashboardContainer {...props} />)

      const traderTable = wrapper.find(RFDashboardTraderTable)

      expect(traderTable.exists()).toBeTruthy()
      expect(traderTable.props().data).toBeDefined()
    })

    it('fetches trades with Rds', () => {
      shallow(<ReceivableFinanceDashboardContainer {...props} />)

      expect(props.fetchTradesWithRd).toHaveBeenCalled()
    })

    it('should be authorized for tradeFinance.canReadRD', () => {
      shallow(<ReceivableFinanceDashboardContainer {...props} />)

      expect(props.isAuthorized).toHaveBeenCalledWith(tradeFinanceManager.canReadRD)
      expect(props.isAuthorized).not.toHaveBeenCalledWith(tradeFinanceManager.canReadRDRequests)
    })
  })

  describe('as a bank', () => {
    let props: IReceivableFinanceDashboardContainerProps

    beforeEach(() => {
      props = {
        ...testProps,
        data: [{ ...fakeReceivableDiscountingDashboardBank() }, fakeReceivableDiscountingDashboardBank()],
        isFinancialInstitution: true
      }
    })

    it('creates a table specific to the bank', () => {
      const wrapper = shallow(<ReceivableFinanceDashboardContainer {...props} />)

      const bankTable = wrapper.find(RFDashboardBankTable)

      expect(bankTable.exists()).toBeTruthy()
      expect(bankTable.props().data).toBeDefined()
    })

    it('fetches all rds only', () => {
      shallow(<ReceivableFinanceDashboardContainer {...props} />)

      expect(props.fetchRdsByStaticIds).toHaveBeenCalled()
      expect(props.fetchTradesWithRd).not.toHaveBeenCalled()
    })

    it('should be authorized for tradeFinance.canReadRDRequests', () => {
      shallow(<ReceivableFinanceDashboardContainer {...props} />)

      expect(props.isAuthorized).toHaveBeenCalledWith(tradeFinanceManager.canReadRDRequests)
      expect(props.isAuthorized).not.toHaveBeenCalledWith(tradeFinanceManager.canReadRD)
    })
  })
})
