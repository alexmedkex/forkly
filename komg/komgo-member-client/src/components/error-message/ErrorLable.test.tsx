import * as React from 'react'
import { ErrorLabel } from './'
import * as renderer from 'react-test-renderer'

describe('ErrorLabel', () => {
  it('matches the snapshot', () => {
    const tree = renderer.create(<ErrorLabel message="error message" />).toJSON()

    expect(tree).toMatchSnapshot()
  })
})
