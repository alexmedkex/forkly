import * as React from 'react'
import { mount } from 'enzyme'
import { Button } from 'semantic-ui-react'
import Masonry from './Masonry'

describe('Masonry component', () => {
  let defaultProps: any

  beforeEach(() => {
    defaultProps = {
      gap: 10,
      colWidth: 200,
      children: [<Button key={1} />]
    }
  })

  it('Should render Masonry', () => {
    const wrapper = mount(<Masonry {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('calls componentDidMount', () => {
    const spy = jest.spyOn(Masonry.prototype, 'componentDidMount')
    mount(<Masonry {...defaultProps} />)
    expect(spy).toHaveBeenCalled()
    spy.mockReset()
    spy.mockRestore()
  })
})
