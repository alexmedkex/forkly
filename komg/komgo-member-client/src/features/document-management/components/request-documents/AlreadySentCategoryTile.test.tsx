import { shallow } from 'enzyme'
import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { mockCategories } from '../../store/categories/mock-data'
import { AlreadySentCategoryTile } from './AlreadySentCategoryTile'

describe('AlreadySentCategoryTile', () => {
  const defaultProps = {
    category: mockCategories[0],
    countDocumentTypes: 3
  }

  it('should match default snapshot', () => {
    expect(renderer.create(<AlreadySentCategoryTile {...defaultProps} />).toJSON()).toMatchSnapshot()
  })

  it('should find the chevron icon to expand/collapse', () => {
    const wrapper = shallow(<AlreadySentCategoryTile {...defaultProps} />)

    const counter = wrapper.find(`[data-test-id="category-tile-document-count-${defaultProps.category.id}"]`)

    expect(counter.props().children).toEqual('[ 3 ]')
  })
})
