import * as React from 'react'
import * as renderer from 'react-test-renderer'

import { IncomingNotes, Props } from './IncomingNotes'

describe('IncomingNotes', () => {
  it('should match default snapshot', () => {
    const props: Props = {
      note: { content: '', sender: 'anon', date: 'Thu, 19 Sep 2021 15:06:47 GMT' },
      textAreaHasFocus: false,
      atLatestNote: false,
      noteIndex: 0,
      getCounterpartyNameById: jest.fn((cpId: string) => 'whatever')
    }
    expect(renderer.create(<IncomingNotes {...props} />).toJSON()).toMatchSnapshot()
  })
})
