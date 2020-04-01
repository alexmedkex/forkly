import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { PanelItemColorIcon } from './PanelItemColorIcon'

describe('PanelItemColorIcon', () => {
  it('renders', () => {
    expect(renderer.create(<PanelItemColorIcon categoryId="company-details" />).toJSON()).toMatchSnapshot()
  })
})
