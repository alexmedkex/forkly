import * as React from 'react'
import renderer from 'react-test-renderer'
import PopupTriggerText from './PopupTriggerText'

describe('PopupTriggerText', () => {
  it('should match snapshot', () => {
    const tree = renderer.create(<PopupTriggerText>Ok</PopupTriggerText>).toJSON()

    expect(tree).toMatchSnapshot()
  })
})
