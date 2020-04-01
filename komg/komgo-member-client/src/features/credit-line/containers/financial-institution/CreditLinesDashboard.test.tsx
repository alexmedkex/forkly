import * as React from 'react'
import { shallow } from 'enzyme'

import { CreditLinesDashboard } from './CreditLinesDashboard'
import CreditLinesTable from '../../components/financial-institution/dashboard/CreditLinesTable'
import { buildFakeRiskCover } from '@komgo/types'
import { Products } from '../../../document-management/constants/Products'
import { SubProducts } from '../../../document-management/constants/SubProducts'
import { CreditLineType } from '../../store/types'
import { tradeFinanceManager } from '@komgo/permissions'

describe('CreditLineDashboard', () => {
  let defaultProps

  beforeEach(() => {
    defaultProps = {
      extendedCreditLines: [],
      isFetching: false,
      errors: [],
      isAuthorized: jest.fn(() => true),
      fetchCreditLines: jest.fn(),
      removeCreditLine: jest.fn(),
      clearError: jest.fn(),
      removingErrors: [],
      isRemoving: false,
      productId: Products.TradeFinance,
      subProductId: SubProducts.ReceivableDiscounting,
      feature: CreditLineType.RiskCover
    }
  })

  it('should render successfully', () => {
    const wrapper = shallow(<CreditLinesDashboard {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should find message-empty credit lines when there are not any credit lines set yet and not find table with credit lines', () => {
    const wrapper = shallow(<CreditLinesDashboard {...defaultProps} />)

    const emptyMessage = wrapper.find('CreditLineStartMessage')
    const table = wrapper.find(CreditLinesTable)

    expect(emptyMessage.length).toBe(1)
    expect(table.length).toBe(0)
  })

  it('should find table with credit lines and not find message-empty credit lines when there are credit lines', () => {
    const wrapper = shallow(<CreditLinesDashboard {...defaultProps} extendedCreditLines={[buildFakeRiskCover()]} />)

    const riskCoverZeroBuyersMessage = wrapper.find('CreditLineStartMessage')
    const buyersRiskCoverTable = wrapper.find(CreditLinesTable)

    expect(riskCoverZeroBuyersMessage.length).toBe(0)
    expect(buyersRiskCoverTable.length).toBe(1)
  })

  it('should find LoadingTransition and not find ErrorMessage if isFetching is equal to true', () => {
    const wrapper = shallow(<CreditLinesDashboard {...defaultProps} isFetching={true} />)

    const loadingTransition = wrapper.find('LoadingTransition')
    const errorMessage = wrapper.find('ErrorMessage')

    expect(errorMessage.length).toBe(0)
    expect(loadingTransition.length).toBe(1)
  })

  it('should find LoadingTransition and not find ErrorMessage if isFetching is equal to true and errors is not empty array', () => {
    const wrapper = shallow(<CreditLinesDashboard {...defaultProps} isFetching={true} errors={[{ message: 'Test' }]} />)

    const loadingTransition = wrapper.find('LoadingTransition')
    const errorMessage = wrapper.find('ErrorMessage')

    expect(errorMessage.length).toBe(0)
    expect(loadingTransition.length).toBe(1)
  })

  it('should find ErrorMessage and not LoadingTransition', () => {
    const wrapper = shallow(<CreditLinesDashboard {...defaultProps} errors={[{ message: 'Test' }]} />)

    const errorMessage = wrapper.find('ErrorMessage')
    const loadingTransition = wrapper.find('LoadingTransition')

    expect(errorMessage.length).toBe(1)
    expect(loadingTransition.length).toBe(0)
  })

  it('should render unauthorized message', () => {
    const wrapper = shallow(<CreditLinesDashboard {...defaultProps} isAuthorized={jest.fn(() => false)} />)

    const unauthorized = wrapper.find('Unauthorized')

    expect(unauthorized.length).toBe(1)
  })

  it('should render unauthorized message when user is authorized for risk cover and page is for bank line', () => {
    const isAuthorized = jest.fn(role => {
      if (role === tradeFinanceManager.canReadBankLine) {
        return false
      }
      return true
    })

    const wrapper = shallow(
      <CreditLinesDashboard {...defaultProps} isAuthorized={isAuthorized} feature={CreditLineType.BankLine} />
    )

    const unauthorized = wrapper.find('Unauthorized')

    expect(unauthorized.length).toBe(1)
  })

  it('should set removeCreditLine in state when handleCreditLine is called', () => {
    const riskCover = buildFakeRiskCover() as any
    const wrapper = shallow(<CreditLinesDashboard {...defaultProps} />)

    const instance = wrapper.instance() as CreditLinesDashboard

    instance.handleRemoveCreditLine(riskCover)

    expect(wrapper.state('removeCreditLine')).toEqual(riskCover)
  })

  it('should set unefined for removeCreditLine in state when handleCloseRemove is called', () => {
    const riskCover = buildFakeRiskCover() as any
    const wrapper = shallow(<CreditLinesDashboard {...defaultProps} />)
    wrapper.setState({ removeCreditLine: riskCover })

    const instance = wrapper.instance() as CreditLinesDashboard

    instance.handleCloseRemove()

    expect(wrapper.state('removeCreditLine')).toBeFalsy()
    expect(defaultProps.clearError).not.toHaveBeenCalled()
  })

  it('should reset removing error when handleCloseRemove is called and error exists', () => {
    const riskCover = buildFakeRiskCover() as any
    const wrapper = shallow(<CreditLinesDashboard {...defaultProps} removingErrors={[{ message: 'Test' }]} />)
    wrapper.setState({ removeCreditLine: riskCover })

    const instance = wrapper.instance() as CreditLinesDashboard

    instance.handleCloseRemove()

    expect(defaultProps.clearError).toHaveBeenCalled()
  })

  it('should call removeCreditLine when handleConfirmRemoveCreditLine is called', () => {
    const riskCover = buildFakeRiskCover() as any
    const wrapper = shallow(<CreditLinesDashboard {...defaultProps} />)
    wrapper.setState({ removeCreditLine: riskCover })

    const instance = wrapper.instance() as CreditLinesDashboard

    instance.handleConfirmRemoveCreditLine()

    expect(defaultProps.removeCreditLine).toHaveBeenCalled()
  })

  it('should call fetchCreditLines when feature is changed', () => {
    const wrapper = shallow(<CreditLinesDashboard {...defaultProps} />)
    wrapper.setProps({ feature: CreditLineType.BankLine })

    expect(defaultProps.fetchCreditLines).toHaveBeenCalledTimes(2)
  })

  it('should pass appropriate props to header component', () => {
    const wrapper = shallow(<CreditLinesDashboard {...defaultProps} />)

    const header = wrapper.find('PageHeader')

    expect(header.prop('headerContent')).toBe('Risk cover')
  })

  it('should pass appropriate props to header component', () => {
    const wrapper = shallow(<CreditLinesDashboard {...defaultProps} feature={CreditLineType.BankLine} />)

    const header = wrapper.find('PageHeader')

    expect(header.prop('headerContent')).toBe('Bank lines')
  })
})
