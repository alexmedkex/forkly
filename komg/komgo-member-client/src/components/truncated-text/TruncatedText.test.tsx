import * as React from 'react'

import { TruncatedText, TruncatedTextProps } from './TruncatedText'
import { mount, shallow } from 'enzyme'
import { PortalInner, Popup } from 'semantic-ui-react'

const len = 30
const text = 'A'.repeat(len + 1)
const testProps: TruncatedTextProps = {
  text,
  maxLength: len
}
describe('TruncatedText', () => {
  it('should truncate the text to maxLength with ellipses', () => {
    const component = mount(<TruncatedText {...testProps} />)

    expect(component.text()).toEqual('A'.repeat(len) + '...')
  })

  it("shouldn't add ellipsis if not up to maxLength", () => {
    const component = shallow(<TruncatedText {...testProps} text="hi" />)

    expect(component.text()).toEqual('hi')
  })
})
