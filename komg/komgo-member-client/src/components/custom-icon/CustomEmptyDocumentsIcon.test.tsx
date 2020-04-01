import * as React from 'react'
import * as renderer from 'react-test-renderer'

import { CustomEmptyDocumentsIcon } from './CustomEmptyDocumentsIcon'

describe('CustomEmptyDocumentsIcon', () => {
  it('should render an empty documents icon.', () => {
    expect(renderer.create(<CustomEmptyDocumentsIcon />).toJSON()).toMatchSnapshot()
  })
})
