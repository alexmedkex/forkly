import * as React from 'react'
import { shallow } from 'enzyme'
import { Dropdown } from 'semantic-ui-react'
import DocumentsList, { StyledDropdown } from './DocumentsList'
import { fakePresentation, fakeDocument } from '../../utils/faker'

describe('DocumentList', () => {
  let defaultProps

  beforeEach(() => {
    defaultProps = {
      documents: [
        fakeDocument({ context: { productId: 'tradeFinance', subProductId: 'lc', lcPresentationStaticId: '123' } })
      ],
      presentation: fakePresentation({ staticId: '123', reference: '123' }),
      showActions: true,
      removeDeleteButton: false,
      openDeleteDocumentConfirm: jest.fn(),
      viewClickHandler: jest.fn()
    }
  })

  it('should render component successfully', () => {
    const wrapper = shallow(<DocumentsList {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should find StyledDropdown when showAction is true', () => {
    const wrapper = shallow(<DocumentsList {...defaultProps} />)

    const dropdownActions = wrapper.find(StyledDropdown)

    expect(dropdownActions.length).toBe(1)
  })

  it('should not find StyledDropdown when showAction is false', () => {
    const wrapper = shallow(<DocumentsList {...defaultProps} showActions={false} />)

    const dropdownActions = wrapper.find(StyledDropdown)

    expect(dropdownActions.length).toBe(0)
  })

  it('should find 2 item in dropdown when removeDeleteButton is set to true', () => {
    const wrapper = shallow(<DocumentsList {...defaultProps} removeDeleteButton={true} />)

    const dropdownActionsItems = wrapper
      .find(StyledDropdown)
      .shallow()
      .find(Dropdown.Menu)
      .shallow()
      .find(Dropdown.Item)

    expect(dropdownActionsItems.length).toBe(2)
  })
})
