import * as React from 'react'
import { shallow } from 'enzyme'
import Filters from './Filters'
import { fakeLetterOfCredit } from '../../utils/faker'
import { initialDocumentsFilters } from '../../../document-management/store/documents/reducer'

describe('Filters component', () => {
  let defaultProps: any

  beforeEach(() => {
    defaultProps = {
      filters: initialDocumentsFilters,
      letterOfCredit: fakeLetterOfCredit(),
      categories: [],
      filterDocuments: jest.fn()
    }
  })

  it('sould render component successfully', () => {
    const wrapper = shallow(<Filters {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })
})
