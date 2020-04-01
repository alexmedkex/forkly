import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { shallow } from 'enzyme'
import { MemoryRouter as Router } from 'react-router-dom'

import ActionMenu from './ActionMenu'

describe('ActionMenu', () => {
  const defaultProps = {
    item: { staticId: '1' } as any,
    canCrud: true,
    baseFeatureUrl: '/deposits',
    handleRemove: jest.fn()
  }

  it('should match snapshot with edit,remove and view options', () => {
    expect(
      renderer
        .create(
          <Router>
            <ActionMenu {...defaultProps} />
          </Router>
        )
        .toJSON()
    ).toMatchSnapshot()
  })

  it('should match snapshot with view only', () => {
    expect(
      renderer
        .create(
          <Router>
            <ActionMenu {...defaultProps} canCrud={false} />
          </Router>
        )
        .toJSON()
    ).toMatchSnapshot()
  })

  it('should call handleRemove with item from props', () => {
    const wrapper = shallow(<ActionMenu {...defaultProps} />)

    const removeDropdownItem = wrapper.find('[data-test-id="remove"]')

    removeDropdownItem.simulate('click')

    expect(defaultProps.handleRemove).toBeCalledWith(defaultProps.item)
  })
})
