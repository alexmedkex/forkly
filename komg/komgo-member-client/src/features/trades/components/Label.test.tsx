import * as React from 'react'
import Label from './Label'
import * as renderer from 'react-test-renderer'

it('should match snapshot', () => {
  const tree = renderer.create(<Label>OK</Label>).toJSON()

  expect(tree).toMatchSnapshot()
})
