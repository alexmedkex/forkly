import * as React from 'react'
import { RequirementsListHeader } from './RequirementsListHeader'
import * as renderer from 'react-test-renderer'

describe('RequirementsListHeader component', () => {
  it('renders', () => {
    expect(renderer.create(<RequirementsListHeader />).toJSON()).toMatchSnapshot()
  })
})
