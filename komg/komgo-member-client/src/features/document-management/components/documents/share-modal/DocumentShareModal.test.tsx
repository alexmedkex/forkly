import { shallow } from 'enzyme'
import * as React from 'react'
import { DocumentShareModal } from './DocumentShareModal'

import { mockDocuments } from '../../../store/documents/mock-data'
import { CompanyInfo } from '../../../../counterparties/store/types'

const company: CompanyInfo = {
  CN: 'CN',
  O: 'O',
  C: 'C',
  L: 'L',
  STREET: 'STREET',
  PC: 'PC'
}

describe('DocumentShareModal component', () => {
  const mockFunc = jest.fn(() => void 0)

  const mockProps = {
    documents: [mockDocuments[0]],
    counterparties: [
      {
        isFinancialInstitution: true,
        staticId: 'id-1',
        isMember: true,
        x500Name: company,
        covered: true
      },
      {
        isFinancialInstitution: true,
        staticId: 'id-2',
        isMember: true,
        x500Name: company,
        covered: true
      }
    ],
    handleShareUpdate: mockFunc,
    toggleVisible: mockFunc,
    isLicenseEnabledForCompany: jest.fn(),
    isLicenseEnabled: jest.fn(() => true)
  }

  it('should render a DocumentShareModal item with props', () => {
    const wrapper = shallow(<DocumentShareModal {...mockProps} open={true} />)
    expect(wrapper.find('DocumentShareModal').exists).toBeTruthy()
  })

  it('should render a DocumentShareModal item with props', () => {
    const wrapper = shallow(<DocumentShareModal {...mockProps} open={false} />)
    expect(wrapper.find('DocumentShareModal').exists).toBeTruthy()
  })

  it('should render a counterparties list', () => {
    const props = { ...mockProps, isLicenseEnabledForCompany: jest.fn(() => true), open: true }
    const counterparties: any[] = shallow(<DocumentShareModal {...props} />)
      .find('SelectedCounterparties')
      .prop('counterparties')
    expect(counterparties.length).toEqual(2)
  })

  it('should render an empty counterparties list', () => {
    const props = { ...mockProps, isLicenseEnabledForCompany: jest.fn(() => false), open: true }
    const wrapper = shallow(<DocumentShareModal {...props} />).find('SelectedCounterparties')
    expect(wrapper.prop('counterparties')).toEqual([])
  })
})
