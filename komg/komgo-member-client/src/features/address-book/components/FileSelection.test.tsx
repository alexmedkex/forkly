import { MemberType } from '@komgo/types'
import * as React from 'react'
import { shallow } from 'enzyme'
import * as renderer from 'react-test-renderer'

import { FileSelection, IProps } from './FileSelection'
import { FileUpload } from '../../../components/form'

const defaultProps: IProps = {
  values: {
    x500Name: {
      CN: 'CN',
      PC: 'PC',
      C: 'C',
      STREET: 'STREET',
      L: 'L',
      O: 'O'
    },
    isFinancialInstitution: true,
    hasSWIFTKey: false,
    isMember: true,
    memberType: MemberType.Empty
  },
  setFieldValue: jest.fn()
}

describe('FileSelection', () => {
  it('should render FileSelection component sucessfully', () => {
    const wrapper = shallow(<FileSelection {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should match shapshop', () => {
    const tree = renderer.create(<FileSelection {...defaultProps} />).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('should find a file upload field', () => {
    const wrapper = shallow(<FileSelection {...defaultProps} />)
    const field = wrapper.find(FileUpload)

    expect(field.length).toBe(1)
  })
})
