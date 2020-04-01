import * as React from 'react'
import { ErrorMessage } from './'
import * as renderer from 'react-test-renderer'

describe('ErrorMessage', () => {
  it('matches the snapshot', () => {
    const tree = renderer.create(<ErrorMessage title="error title" error="error message" />).toJSON()

    expect(tree).toMatchSnapshot()
  })
})
