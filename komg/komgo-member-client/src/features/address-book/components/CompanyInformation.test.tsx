import * as React from 'react'
import * as renderer from 'react-test-renderer'

jest.mock('formik', () => ({
  Field: props => <div {...props} />
}))

jest.mock('i18n-iso-countries', () => ({
  getNames: () => ({ AF: 'Afghanistan' })
}))

import { objectToDropdownOptions, CompanyInformation } from './CompanyInformation'
import { mount } from 'enzyme'

const props = {
  isModification: true,
  errors: {},
  touched: false,
  values: {
    x500Name: {
      O: 'O',
      C: 'C',
      L: 'L',
      STREET: 'STREET',
      PC: 'PC'
    },
    isMember: true,
    memberType: 'SMS'
  },
  clearError: jest.fn()
}

describe('CompanyInformation', () => {
  it('should match snapshot', () => {
    const tree = renderer.create(<CompanyInformation {...props} />).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('should return DropdownOptions', () => {
    const errors = objectToDropdownOptions({ a: 'option1', b: 'option2' })
    expect(errors).toEqual([
      {
        value: 'a',
        content: 'option1',
        text: 'option1'
      },
      {
        value: 'b',
        content: 'option2',
        text: 'option2'
      }
    ])
  })

  it('should call clearError on focus', () => {
    const component = mount(<CompanyInformation {...props} />)
    component.find('Field#company-admin-email').simulate('focus')
    component.find('Field#company-admin-email').simulate('blur')
    expect(props.clearError).toHaveBeenCalled()
  })
})
