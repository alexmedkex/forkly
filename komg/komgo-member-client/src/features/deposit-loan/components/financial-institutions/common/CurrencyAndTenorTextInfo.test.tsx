import * as React from 'react'
import * as renderer from 'react-test-renderer'

import CurrencyAndTenorTextInfo from './CurrencyAndTenorTextInfo'

describe('CurrencyAndTenorTextInfo', () => {
  it('should match default snaptshout', () => {
    expect(renderer.create(<CurrencyAndTenorTextInfo />).toJSON()).toMatchSnapshot()
  })
})
