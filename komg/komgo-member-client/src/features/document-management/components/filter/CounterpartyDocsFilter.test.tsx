import * as React from 'react'
import { shallow } from 'enzyme'
import * as renderer from 'react-test-renderer'

import { CounterpartyDocsFilter } from './CounterpartyDocsFilter'
import { mockCategories } from '../../store/categories/mock-data'
import { mockDocumentTypes } from '../../store/document-types/mock-data'
import { CounterpartyDocumentFilter } from '../../store'

describe('CounterpartyDocsFilter', () => {
  const defaultProps = {
    categories: mockCategories,
    types: mockDocumentTypes,
    users: [],
    filter: {},
    onChange: jest.fn()
  }

  it('should match default snapshot', () => {
    expect(renderer.create(<CounterpartyDocsFilter {...defaultProps} />).toJSON()).toMatchSnapshot()
  })

  it('should send appropriate filter prop to filter wrapper', () => {
    const wrapper = shallow(<CounterpartyDocsFilter {...defaultProps} />)

    const filters = wrapper.prop('filters')

    expect(filters[0].label).toBe('Type')
    expect(filters[0].filterKey).toBe('type')
    expect(filters[0].data({})).toEqual([])
    expect(filters[0].content({})).toMatchSnapshot()
    expect(filters[0].calculateApplied([])).toBe(0)
  })

  it('should call onChange with appropriate props when handleClear is called', () => {
    const wrapper = shallow(<CounterpartyDocsFilter {...defaultProps} />)

    const instance = wrapper.instance() as CounterpartyDocsFilter

    instance.handleClear()

    expect(defaultProps.onChange).toHaveBeenLastCalledWith(null)
  })

  it('should call onChange with appropriate props when handleApply is called', () => {
    const wrapper = shallow(<CounterpartyDocsFilter {...defaultProps} />)

    const instance = wrapper.instance() as CounterpartyDocsFilter

    const filter = {
      counterpartyId: '123',
      type: ['1234']
    }

    instance.handleApply(filter)

    expect(defaultProps.onChange).toHaveBeenLastCalledWith(filter)
  })
})
