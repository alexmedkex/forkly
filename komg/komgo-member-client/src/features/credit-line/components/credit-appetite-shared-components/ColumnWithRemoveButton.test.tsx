import * as React from 'react'
import * as renderer from 'react-test-renderer'

import ColumnWithRemoveButton from './ColumnWithRemoveButton'

describe('ColumnWithRemoveButton', () => {
  it('should match default snapshot', () => {
    expect(renderer.create(<ColumnWithRemoveButton />).toJSON()).toMatchSnapshot()
  })
})
