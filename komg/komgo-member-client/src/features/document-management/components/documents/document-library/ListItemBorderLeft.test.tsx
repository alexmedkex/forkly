import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { ListItemBorderLeft, Props } from './ListItemBorderLeft'

describe('ListItemBorderLeft', () => {
  it('renders', () => {
    expect(renderer.create(<ListItemBorderLeft categoryId="company-details" />).toJSON()).toMatchSnapshot()
  })
})
