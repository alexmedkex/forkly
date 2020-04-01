import { shallow } from 'enzyme'
import * as React from 'react'

import mockCounterparties from '../../../../counterparties/store/mockData'
import { mockDocuments } from '../../../store/documents/mock-data'
import ConfirmShareStep, { ConfirmShareProps } from './ConfirmShareStep'

describe('ConfirmShareStep component', () => {
  const mockProps: ConfirmShareProps = {
    documents: mockDocuments,
    selectedCounterparties: mockCounterparties.counterparties,
    onCancel: jest.fn(),
    onShare: jest.fn()
  }

  it('should render a ConfirmShareStep', () => {
    const wrapper = shallow(<ConfirmShareStep {...mockProps} />)
    expect(wrapper.find('ConfirmShareStep').exists).toBeTruthy()
  })
})
