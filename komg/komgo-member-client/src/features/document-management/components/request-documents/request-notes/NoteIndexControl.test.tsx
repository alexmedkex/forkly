import * as React from 'react'
import * as renderer from 'react-test-renderer'

import { NoteIndexControl, Props } from './NoteIndexControl'

describe('NoteIndexControl', () => {
  it('should match default snapshot', () => {
    const props: Props = {
      currentIndex: 0,
      maxIndex: 1,
      setIndex: jest.fn((toIndex: number) => void 0)
    }
    expect(renderer.create(<NoteIndexControl {...props} />).toJSON()).toMatchSnapshot()
  })
})
