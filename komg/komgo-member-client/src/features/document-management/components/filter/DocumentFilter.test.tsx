import * as React from 'react'
import { shallow } from 'enzyme'
import * as renderer from 'react-test-renderer'

import { DocumentFilter, IDocumentFilterProps } from './DocumentFilter'
import { mockCategories } from '../../store/categories/mock-data'
import { mockDocumentTypes } from '../../store/document-types/mock-data'
import { fakeCounterparty } from '../../../letter-of-credit-legacy/utils/faker'
import { DocumentListFilter } from '../../store'

describe('DocumentFilter', () => {
  const defaultProps: IDocumentFilterProps = {
    categories: mockCategories,
    types: mockDocumentTypes,
    counterparties: [fakeCounterparty()],
    filter: {},
    onChange: jest.fn()
  }

  it('should match default snapshot', () => {
    expect(renderer.create(<DocumentFilter {...defaultProps} />).toJSON()).toMatchSnapshot()
  })

  it('should send appropriate filter props to filter wrapper - default filter value', () => {
    const wrapper = shallow(<DocumentFilter {...defaultProps} />)

    const filters = wrapper.prop('filters')

    expect(filters[0].label).toBe('Type')
    expect(filters[0].filterKey).toBe('type')
    expect(filters[0].data({})).toEqual([])
    expect(filters[0].content({})).toMatchSnapshot()
    expect(filters[0].calculateApplied([])).toBe(0)

    expect(filters[1].label).toBe('Shared with')
    expect(filters[1].filterKey).toBe('sharedWith')
    expect(filters[1].data({})).toEqual([])
    expect(filters[1].content({})).toMatchSnapshot()
    expect(filters[1].calculateApplied([])).toBe(0)
  })

  it('should send appropriate filter props when filter is active', () => {
    const filter = { type: ['certificate-of-incorporation'], sharedWith: [] }
    const wrapper = shallow(
      <DocumentFilter {...defaultProps} filter={{ type: ['certificate-of-incorporation'], sharedWith: [] }} />
    )

    const filters = wrapper.prop('filters')

    expect(filters[0].data(filter)).toEqual(['certificate-of-incorporation'])
    expect(filters[1].data(filter)).toEqual([])
  })

  it('should call onChange with appropriate props when handleClear is called', () => {
    const wrapper = shallow(<DocumentFilter {...defaultProps} />)

    const instance = wrapper.instance() as DocumentFilter

    instance.handleClear()

    expect(defaultProps.onChange).toHaveBeenLastCalledWith(null)
  })

  it('should call onChange with appropriate props when handleApply is called', () => {
    const wrapper = shallow(<DocumentFilter {...defaultProps} />)

    const instance = wrapper.instance() as DocumentFilter

    const filter: DocumentListFilter = {
      type: ['1234']
    }

    instance.handleApply(filter)

    expect(defaultProps.onChange).toHaveBeenLastCalledWith(filter)
  })
})
