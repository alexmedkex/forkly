import * as React from 'react'
import { shallow } from 'enzyme'
import * as renderer from 'react-test-renderer'

import MemberMarketSelectionRow, { MemberMarketSelectionRowProps } from './MemberMarketSelectionRow'
import { Counterparty } from '../../../../counterparties/store/types'
import { Checkbox } from 'semantic-ui-react'
import { IMemberMarketSelectionItem } from '../../../../receivable-discounting-legacy/store/types'
import { fakeMemberMarketSelectionItem } from '../../../../receivable-discounting-legacy/utils/faker'

const data: IMemberMarketSelectionItem = fakeMemberMarketSelectionItem()

const testProps: MemberMarketSelectionRowProps = {
  data,
  selectedData: [],
  handleCheckboxClick: jest.fn((counterparty?: Counterparty) => void 0)
}

it('renders correctly', () => {
  expect(renderer.create(<MemberMarketSelectionRow {...testProps} />).toJSON()).toMatchSnapshot()
})

it('calls handleCheckboxClick when select all/none checkbox clicked', () => {
  const wrapper = shallow(<MemberMarketSelectionRow {...testProps} />)

  const checkbox = wrapper.find(Checkbox).shallow()
  checkbox.simulate('click')
  expect(testProps.handleCheckboxClick).toBeCalledWith(data.counterparty)
})
