import * as React from 'react'
import { shallow } from 'enzyme'
import { CounterpartiesContainer } from './CounterpartiesContainer'
import {
  Counterparty,
  NotConnectedCounterparty,
  CouneterpartyStatus,
  CounterpartyProfile,
  RiskLevel
} from '../store/types'
import { ErrorMessage, LoadingTransition } from '../../../components'
import { fakeCounterparty } from '../../letter-of-credit-legacy/utils/faker'
import ConnectedCounterparties, {
  FirstCellStyled
} from '../components/connected-counterparties/ConnectedCounterparties'
import {
  TableHeaderStyled,
  TypeCounterTable,
  ConnectedCountepartiesHeader
} from '../components/connected-counterparties/ConnectedCounterpartiesHeader'

const counterpartiesMock: Counterparty[] = [
  fakeCounterparty({ staticId: '1', commonName: 'A Company' }),
  fakeCounterparty({ staticId: '2', commonName: 'A Company 2', status: CouneterpartyStatus.WAITING }),
  fakeCounterparty({ staticId: '3', commonName: 'A Company 3', status: CouneterpartyStatus.PENDING })
]

const notConnected: NotConnectedCounterparty[] = [
  fakeCounterparty({ staticId: '1', commonName: 'A Company' }) as NotConnectedCounterparty,
  fakeCounterparty({ staticId: '2', commonName: 'B Company' }) as NotConnectedCounterparty
]

const counterpartyProfiles = new Map<string, CounterpartyProfile>()

describe('Counterparties container', () => {
  let defaultProps: any
  let printCounterpartyStatus: any

  beforeEach(() => {
    counterpartyProfiles.set(counterpartiesMock[0].staticId, {
      id: '1',
      counterpartyId: counterpartiesMock[0].staticId,
      riskLevel: RiskLevel.unspecified,
      renewalDate: '',
      managedById: ''
    })
    counterpartyProfiles.set(counterpartiesMock[1].staticId, {
      id: '2',
      counterpartyId: counterpartiesMock[1].staticId,
      riskLevel: RiskLevel.unspecified,
      renewalDate: '',
      managedById: ''
    })
    counterpartyProfiles.set(counterpartiesMock[2].staticId, {
      id: '2',
      counterpartyId: counterpartiesMock[2].staticId,
      riskLevel: RiskLevel.unspecified,
      renewalDate: '',
      managedById: ''
    })
    printCounterpartyStatus = jest.fn()
    defaultProps = {
      isAddModalOpen: false,
      addCounterparties: [],
      tasks: [],
      counterparties: counterpartiesMock,
      counterpartiesFiltered: counterpartiesMock,
      notConnectedCounterpartiesFiltred: notConnected,
      fetchingConnectedCounterparties: false,
      fetchingConnectedCounterpartiesError: null,
      typeCounterTable: TypeCounterTable.MANAGEMENT,
      counterpartyProfiles,
      error: null,
      setAddCounterpartyModal: jest.fn(),
      setAddCounterparties: jest.fn(),
      fetchConnectedCounterpartiesAsync: jest.fn(),
      getConnectedCounterpartiesWithRequestsAsync: jest.fn(),
      isAuthorized: jest.fn(),
      renderPopup: jest.fn(),
      renderMenu: jest.fn(),
      fetchNotConnectedCompaniesAsync: () => jest.fn(),
      getTasks: jest.fn(),
      searchCounterparty: jest.fn(),
      sortConnectedCounterparties: jest.fn(),
      addCounterpartyAsync: jest.fn(),
      responseOnCounterpartyRequestAsync: () => jest.fn(),
      actionCallback: jest.fn(),
      counterpartiesSort: { column: '', order: '' },
      handleSort: jest.fn()
    }
  })

  it('should render CounterpartiesContainer', () => {
    const wrapper = shallow(<CounterpartiesContainer {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should not render error on page', () => {
    const wrapper = shallow(<CounterpartiesContainer {...defaultProps} />)

    const error = wrapper.find(ErrorMessage)

    expect(error.exists()).toBe(false)
  })

  it('should render error on page', () => {
    const wrapper = shallow(<CounterpartiesContainer {...defaultProps} fetchingConnectedCounterpartiesError="Test" />)

    const error = wrapper.find(ErrorMessage)

    expect(error.exists()).toBe(true)
  })

  it('should render loader on page', () => {
    const wrapper = shallow(<CounterpartiesContainer {...defaultProps} fetchingConnectedCounterparties={true} />)

    const loader = wrapper.find(LoadingTransition)

    expect(loader.exists()).toBeTruthy()
  })

  it('should call fetchConnectedCounterpartiesAsync when component is mounted', () => {
    const wrapper = shallow(<CounterpartiesContainer {...defaultProps} />)

    wrapper.exists()

    expect(defaultProps.getConnectedCounterpartiesWithRequestsAsync).toHaveBeenCalledTimes(1)
  })

  it('should call getTasks when component is mounted', () => {
    const wrapper = shallow(<CounterpartiesContainer {...defaultProps} />)

    wrapper.exists()

    expect(defaultProps.getTasks).toHaveBeenCalledTimes(1)
  })

  it('should call counterpartiesSort when table header is pressed with name param', () => {
    const wrapper = shallow(
      <ConnectedCountepartiesHeader {...defaultProps} counterpartiesSort={{ column: 'O', order: 'ascending' }} />
    )

    wrapper
      .find(TableHeaderStyled)
      .first()
      .simulate('click')

    expect(defaultProps.handleSort).toHaveBeenCalledWith('O', 'descending')
  })

  it('should render first counterparty with name: A Company', () => {
    const props = {
      ...defaultProps,
      extended: true
    }
    const wrapper = shallow(<ConnectedCounterparties {...props} />)

    const firstCounterparty = wrapper
      .find(FirstCellStyled)
      .first()
      .shallow()
      .childAt(0)

    expect(firstCounterparty.text()).toBe('A Company ltd')
  })
})
