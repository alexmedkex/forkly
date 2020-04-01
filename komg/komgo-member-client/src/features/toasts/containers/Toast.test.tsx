import { shallow, mount } from 'enzyme'
import * as React from 'react'
import Toast from './Toast'

const setupTest = () => {
  const rootElement = document.createElement('div')
  rootElement.id = 'toast'
  document.body.appendChild(rootElement)
}

describe('Toast', () => {
  beforeEach(() => setupTest())
  it('renders Toast', () => {
    const wrapper = shallow(<Toast text={'BOOOM!'} closeToast={() => undefined} />)
    expect(wrapper).toHaveStyleRule('background-color', '#1c2936 !important')
    expect(wrapper).toHaveStyleRule('min-height', '40px !important')
    expect(wrapper).toHaveStyleRule('border-radius', '2px !important')
    expect(wrapper).toHaveStyleRule('border', 'none')
    expect(wrapper).toHaveStyleRule('display', 'flex !important')
    expect(wrapper).toHaveStyleRule('align-items', 'center !important')
  })
})
