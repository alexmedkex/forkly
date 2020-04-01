import * as React from 'react'
import { shallow } from 'enzyme'
import { Table } from 'semantic-ui-react'
import ConnectedCounterparties, { FirstCellStyled } from './ConnectedCounterparties'
import { TableHeaderStyled, TypeCounterTable, ConnectedCountepartiesHeader } from './ConnectedCounterpartiesHeader'
import { Counterparty, CounterpartyProfile, RiskLevel } from '../../store/types'
import { fakeCounterparty } from '../../../letter-of-credit-legacy/utils/faker'

const counterparties: Counterparty[] = [
  fakeCounterparty({ staticId: '1', commonName: 'A Company' }),
  fakeCounterparty({ staticId: '2', commonName: 'C Company' })
]

const counterpartyProfiles = new Map<string, CounterpartyProfile>()

describe('ConnectedCounterparties component', () => {
  let defaultProps: any

  beforeEach(() => {
    counterpartyProfiles.set(counterparties[0].staticId, {
      id: '1',
      counterpartyId: counterparties[0].staticId,
      riskLevel: RiskLevel.unspecified,
      renewalDate: '',
      managedById: ''
    })
    counterpartyProfiles.set(counterparties[1].staticId, {
      id: '2',
      counterpartyId: counterparties[1].staticId,
      riskLevel: RiskLevel.unspecified,
      renewalDate: '',
      managedById: ''
    })
    defaultProps = {
      counterpartyProfiles,
      counterparties,
      typeCounterTable: TypeCounterTable.COUNTERPARTY_DOCS,
      counterpartiesSort: { column: '', order: '' },
      handleSort: jest.fn()
    }
  })

  it('should render ConnectedCounterparties component successfully', () => {
    const wrapper = shallow(<ConnectedCounterparties {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should render two column with counterparties', () => {
    const wrapper = shallow(<ConnectedCounterparties {...defaultProps} />)

    expect(wrapper.find(Table.Row).length).toBe(2)
  })

  it('should render first counterparty with name: A Company', () => {
    const wrapper = shallow(<ConnectedCounterparties {...defaultProps} />)

    const firstCounterparty = wrapper
      .find(FirstCellStyled)
      .first()
      .shallow()
      .childAt(0)

    expect(firstCounterparty.text()).toBe('A Company ltd')
  })

  it('should render first counterparty with location: A Location', () => {
    const wrapper = shallow(<ConnectedCounterparties {...defaultProps} />)

    const firstCounterparty = wrapper
      .find(Table.Cell)
      .first()
      .shallow()
      .childAt(0)

    expect(firstCounterparty.text()).toBe('city')
  })

  it('should call counterpartiesSort when table header is pressed with name param', () => {
    const wrapper = shallow(
      <ConnectedCountepartiesHeader {...defaultProps} counterpartiesSort={{ column: 'O', order: '' }} />
    )

    wrapper
      .find(TableHeaderStyled)
      .first()
      .simulate('click')

    expect(defaultProps.handleSort).toHaveBeenCalledWith('O', 'ascending')
  })

  it('should call counterpartiesSort when table header is pressed with name location param', () => {
    const wrapper = shallow(<ConnectedCountepartiesHeader {...defaultProps} />)

    wrapper
      .find(TableHeaderStyled)
      .at(1)
      .simulate('click')

    expect(defaultProps.handleSort).toHaveBeenCalled()
  })
})
