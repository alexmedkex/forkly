import { shallow } from 'enzyme'
import * as React from 'react'
import { Accordion, Header, Segment } from 'semantic-ui-react'
import { AccordionWrapper, StyledAccordion } from './AccordionWrapper'

describe('AccordionWrapper', () => {
  let defaultProps

  beforeEach(() => {
    defaultProps = {
      title: 'title',
      active: true,
      index: 'INDEX',
      handleClick: jest.fn(),
      children: null
    }
  })

  it('should render Accordion correctly', () => {
    const component = shallow(<AccordionWrapper {...defaultProps} />)

    const accordion = component.find(StyledAccordion)

    expect(accordion.prop('fluid')).toEqual(true)
  })

  it('should render Accordion.Title correctly', () => {
    const component = shallow(<AccordionWrapper {...defaultProps} />)

    const title = component
      .find(StyledAccordion)
      .shallow()
      .find(Accordion.Title)

    expect(title.prop('active')).toEqual(defaultProps.active)
    expect(title.prop('index')).toEqual(defaultProps.index)
    expect(title.prop('onClick')).toEqual(defaultProps.handleClick)
  })

  it('should render Header correctly', () => {
    const component = shallow(<AccordionWrapper {...defaultProps} />)

    const header = component
      .find(StyledAccordion)
      .shallow()
      .find(Accordion.Title)
      .shallow()
      .find(Header)

    expect(header.prop('block')).toEqual(true)
  })

  it('should render Accordion.Content correctly', () => {
    const component = shallow(<AccordionWrapper {...defaultProps} />)

    const content = component
      .find(StyledAccordion)
      .shallow()
      .find(Accordion.Content)

    expect(content.prop('active')).toEqual(true)
    expect(content.prop('style')).toEqual({ marginBottom: '20px' })
  })

  it('should render Accordion.Content correctly', () => {
    const childrenProps = 'test'
    const component = shallow(<AccordionWrapper {...defaultProps} children={childrenProps} />)

    const contentSegment = component
      .find(StyledAccordion)
      .shallow()
      .find(Accordion.Content)
      .shallow()
      .find(Segment)

    expect(contentSegment.prop('children')).toEqual(childrenProps)
  })
})
