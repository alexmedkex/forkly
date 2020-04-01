import * as React from 'react'
import { shallow } from 'enzyme'
import { createMemoryHistory } from 'history'

import { LetterOfCreditAuthorization, LetterOfCreditAuthorizationProps } from './LetterOfCreditAuthorization'

const defaultChildren: string = 'children'

describe('LetterOfCreditAuthorization', () => {
  const defaultProps: LetterOfCreditAuthorizationProps = {
    children: defaultChildren,
    history: createMemoryHistory(),
    match: {
      isExact: true,
      path: '',
      url: '',
      params: null
    },
    staticContext: undefined,
    location: {
      pathname: '',
      search: '',
      state: '',
      hash: ''
    },
    isLicenseEnabled: jest.fn(),
    isLicenseEnabledForCompany: jest.fn()
  }

  it('returns authorized with proper user access', () => {
    const el = shallow(<LetterOfCreditAuthorization {...defaultProps} isLicenseEnabled={() => true} />)
    expect(el.text()).toEqual(defaultChildren)
  })

  it('returns unauthorized with wrong user access', () => {
    const el = shallow(<LetterOfCreditAuthorization {...defaultProps} isLicenseEnabled={() => false} />)
    expect(el.text()).not.toEqual(defaultChildren)
  })
})
