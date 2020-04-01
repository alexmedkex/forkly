import * as React from 'react'
import { shallow } from 'enzyme'
import * as renderer from 'react-test-renderer'

import MemberMarketSelectionTable, { IMemberMarketSelectionTableProps } from './MemberMarketSelectionTable'
import { Counterparty } from '../../../../counterparties/store/types'
import { fakeCounterparty } from '../../../../letter-of-credit-legacy/utils/faker'
import MemberMarketSelectionRow from './MemberMarketSelectionRow'
import { TableBody } from 'semantic-ui-react'
import { IMemberMarketSelectionItem } from '../../../../receivable-discounting-legacy/store/types'
import { fakeMemberMarketSelectionItem } from '../../../../receivable-discounting-legacy/utils/faker'

const counterparties: Counterparty[] = [
  fakeCounterparty({ staticId: '1', commonName: 'A Company', isFinancialInstitution: true, isMember: true }),
  fakeCounterparty({ staticId: '2', commonName: 'B Company', isFinancialInstitution: true, isMember: true }),
  fakeCounterparty({ staticId: '3', commonName: 'C Company', isFinancialInstitution: true, isMember: false })
]

const data: IMemberMarketSelectionItem[] = [
  fakeMemberMarketSelectionItem({ counterparty: counterparties[0] }),
  fakeMemberMarketSelectionItem({ counterparty: counterparties[1] }),
  fakeMemberMarketSelectionItem({ counterparty: counterparties[2] })
]

const mockIsLicenseEnabledForCompany = jest.fn((_, staticId) => true)
const testProps: IMemberMarketSelectionTableProps = {
  data,
  selectedData: [],
  isLicenseEnabled: jest.fn(() => true),
  isLicenseEnabledForCompany: mockIsLicenseEnabledForCompany,
  handleCheckboxClick: jest.fn((counterparty?: Counterparty) => void 0)
}

it('renders correctly', () => {
  expect(renderer.create(<MemberMarketSelectionTable {...testProps} />).toJSON()).toMatchSnapshot()
})

it('calls handleCheckboxClick when select all/none checkbox clicked', () => {
  const wrapper = shallow(<MemberMarketSelectionTable {...testProps} />)

  const selectAllNoneCheckbox = wrapper.find({ 'data-test-id': 'checkbox-select-all-none' }).shallow()
  selectAllNoneCheckbox.simulate('click')
  expect(testProps.handleCheckboxClick).toBeCalled()
})

it('shows 2 counterparty rows', () => {
  const wrapper = shallow(<MemberMarketSelectionTable {...testProps} />)

  const counterpartyTableRows = wrapper
    .find(TableBody)
    .shallow()
    .find(MemberMarketSelectionRow)

  expect(counterpartyTableRows.length === 2)
})

it('shows 1 counterparty row if only one counterparty has RD license', () => {
  mockIsLicenseEnabledForCompany.mockImplementation((_, staticId) => staticId === 2)
  const wrapper = shallow(<MemberMarketSelectionTable {...testProps} />)

  const counterpartyTableRows = wrapper
    .find(TableBody)
    .shallow()
    .find(MemberMarketSelectionRow)

  expect(counterpartyTableRows.length === 1)
})
