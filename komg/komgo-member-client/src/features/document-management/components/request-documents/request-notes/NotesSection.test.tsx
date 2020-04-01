import * as React from 'react'
import * as renderer from 'react-test-renderer'

import { NotesSection, Props } from './NotesSection'

describe('NotesSection', () => {
  it('should match default snapshot', () => {
    const props: Props = {
      notes: [],
      noteInput: null,
      getCounterpartyNameById: jest.fn(str => 'whatever'),
      setNoteContent: jest.fn((content: string) => void 0)
    }
    expect(renderer.create(<NotesSection {...props} />).toJSON()).toMatchSnapshot()
  })
})
