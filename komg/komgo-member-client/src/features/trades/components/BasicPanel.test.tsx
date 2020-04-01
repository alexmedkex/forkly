import * as React from 'react'
import * as renderer from 'react-test-renderer'
import BasicPanel from './BasicPanel'

it('should match snapshot', () => {
  const tree = renderer.create(<BasicPanel>OK</BasicPanel>).toJSON()

  expect(tree).toMatchSnapshot()
})
