import * as React from 'react'
import * as renderer from 'react-test-renderer'

import { CheckboxWrapper, CheckboxColumn, CheckboxGrid } from './CheckboxStyledComponents'

describe('CheckboxStyledComponents', () => {
  it('CheckboxWrapper should match snapshot', () => {
    expect(renderer.create(<CheckboxWrapper />).toJSON()).toMatchSnapshot()
  })

  it('CheckboxColumn should match snapshot', () => {
    expect(renderer.create(<CheckboxColumn />).toJSON()).toMatchSnapshot()
  })

  it('CheckboxGrid should match snapshot', () => {
    expect(renderer.create(<CheckboxGrid />).toJSON()).toMatchSnapshot()
  })
})
