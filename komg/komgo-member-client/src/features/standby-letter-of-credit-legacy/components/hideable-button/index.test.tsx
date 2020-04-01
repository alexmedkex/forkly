import * as React from 'react'
import renderer from 'react-test-renderer'
import { HideableButton } from '.'

describe('HideableButton', () => {
  it('returns null if hidden', () => {
    expect(renderer.create(<HideableButton hidden={true} />).toJSON()).toMatchSnapshot()
  })
  it('returns a normal semantic button if not hidden', () => {
    expect(renderer.create(<HideableButton hidden={false} />).toJSON()).toMatchSnapshot()
  })
})
