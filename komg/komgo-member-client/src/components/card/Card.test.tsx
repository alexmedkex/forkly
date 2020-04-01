import { mount, shallow } from 'enzyme'
import * as React from 'react'
import Card from './Card'

const setupTest = () => {
  const rootElement = document.createElement('div')
  rootElement.id = 'card-root'
  document.body.appendChild(rootElement)
}

describe('Card component', () => {
  beforeEach(() => setupTest())

  const cardPropsWithCustomStyling = {
    className: 'anonClass',
    minHeight: '100px',
    maxHeight: '150px',
    minWidth: '60px',
    maxWidth: '120px',
    boxShadow: '2px 2px 6px blue',
    children: 'test'
  }

  const cardPropsWithNoClassName = {
    children: 'test'
  }

  const cardPropsNoCustomStyling = {
    className: 'anonClass',
    children: 'test'
  }

  it('should render a child div with Card item', () => {
    const wrapper = shallow(
      <Card {...cardPropsWithCustomStyling}>
        <div>hello world</div>
      </Card>
    )
    const cardContent = wrapper.find('div').exists()
    expect(cardContent).toEqual(true)
  })

  it('should render a child div with Card item (no class name)', () => {
    expect(
      shallow(
        <Card {...cardPropsWithNoClassName}>
          <div>hello world</div>
        </Card>
      ).hasClass('')
    ).toBe(true)
  })

  it('should render Card with custom styling', () => {
    const wrapper = mount(
      <Card {...cardPropsWithCustomStyling}>
        <div>hello world</div>
      </Card>
    )
    expect(wrapper).toHaveStyleRule('min-height', '100px')
    expect(wrapper).toHaveStyleRule('max-height', '150px')
    expect(wrapper).toHaveStyleRule('min-width', '60px')
    expect(wrapper).toHaveStyleRule('max-width', '120px')
    expect(wrapper).toHaveStyleRule('box-shadow', '2px 2px 6px blue')
  })

  it('should render Card with no custom styling (i.e. use default/fallback styling)', () => {
    const wrapper = mount(
      <Card {...cardPropsNoCustomStyling}>
        <div>hello world</div>
      </Card>
    )
    expect(wrapper).toHaveStyleRule('min-height', '50px')
    expect(wrapper).toHaveStyleRule('max-height', '200px')
    expect(wrapper).toHaveStyleRule('min-width', '50px')
    expect(wrapper).toHaveStyleRule('max-width', '200px')
    expect(wrapper).toHaveStyleRule('box-shadow', '3px 3px 5px black')
  })
})
