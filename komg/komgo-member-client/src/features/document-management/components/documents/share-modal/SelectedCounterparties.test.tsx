import { shallow } from 'enzyme'
import * as React from 'react'
import * as renderer from 'react-test-renderer'

import mockCounterparties from '../../../../counterparties/store/mockData'
import { mockDocuments } from '../../../store/documents/mock-data'
import SelectedCounterparties, { ISelectedCounterpartiesProps } from './SelectedCounterparties'

describe('ConfirmShareStep component', () => {
  const mockProps: ISelectedCounterpartiesProps = {
    counterparties: mockCounterparties.counterparties.map(cp => ({
      counterparty: cp,
      documents: mockDocuments,
      isSelected: false
    })),
    setSelectedCounterparties: jest.fn(),
    onCancel: jest.fn(),
    onConfirm: jest.fn()
  }

  it('should match default snapshot', () => {
    expect(renderer.create(<SelectedCounterparties {...mockProps} />).toJSON()).toMatchSnapshot()
  })

  it('should filter company in state when handleSearchChanged is called', () => {
    const wrapper = shallow(<SelectedCounterparties {...mockProps} />)

    const instance = wrapper.instance() as SelectedCounterparties

    instance.handleSearchChanged('TestTest')

    expect(wrapper.state('companies')).toEqual([])
  })

  it('next button should be disabled if at least one counterpary is not selected', () => {
    const wrapper = shallow(<SelectedCounterparties {...mockProps} />)

    const nextButton = wrapper.find('[data-test-id="next-button"]')

    expect(nextButton.prop('disabled')).toBe(true)
  })

  it('next button should be enabled if at least one counterpary is selected', () => {
    const counterparties = [...mockProps.counterparties, { ...mockProps.counterparties[0], isSelected: true }]

    const wrapper = shallow(<SelectedCounterparties {...mockProps} counterparties={counterparties} />)

    const nextButton = wrapper.find('[data-test-id="next-button"]')

    expect(nextButton.prop('disabled')).toBe(false)
  })
})
