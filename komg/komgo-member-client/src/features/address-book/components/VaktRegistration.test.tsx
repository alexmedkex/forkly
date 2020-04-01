import * as React from 'react'
import { shallow } from 'enzyme'
import * as renderer from 'react-test-renderer'
import { MemberType } from '@komgo/types'

import { VaktRegistration, IProps } from './VaktRegistration'
import { Checkbox } from 'semantic-ui-react'

const defaultProps: IProps = {
  isModification: true,
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
    memberType: MemberType.Empty,
    vakt: {
      staticId: '',
      mnid: '',
      messagingPublicKey: undefined
    }
  },
  errors: {},
  touched: {},
  resetVakt: jest.fn()
}

describe('VaktRegistration', () => {
  it('should render VaktRegistration component sucessfully', () => {
    const wrapper = shallow(<VaktRegistration {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should match shapshop', () => {
    const tree = renderer.create(<VaktRegistration {...defaultProps} />).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('should find Checkbox which is unchecked', () => {
    const wrapper = shallow(<VaktRegistration {...defaultProps} />)
    const checkbox = wrapper.find(Checkbox)

    expect(checkbox.prop('checked')).toBe(false)
  })

  it('should not call resetVakt when checkbox is checked', () => {
    const wrapper = shallow(<VaktRegistration {...defaultProps} />)

    wrapper
      .find('Checkbox')
      .at(0)
      .simulate('change', {}, { checked: true })

    expect(defaultProps.resetVakt).not.toHaveBeenCalled()
  })

  it('should call resetVakt when checkbox is unchecked', () => {
    const wrapper = shallow(<VaktRegistration {...defaultProps} />)

    wrapper
      .find('Checkbox')
      .at(0)
      .simulate('change', {}, { checked: false })

    expect(defaultProps.resetVakt).toHaveBeenCalled()
  })
})
