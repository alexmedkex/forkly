import * as React from 'react'
import * as renderer from 'react-test-renderer'

import { CustomFileIcon } from './CustomFileIcon'

describe('CustomFileIcon', () => {
  it('should render a file icon.', () => {
    expect(renderer.create(<CustomFileIcon />).toJSON()).toMatchSnapshot()
  })
})
