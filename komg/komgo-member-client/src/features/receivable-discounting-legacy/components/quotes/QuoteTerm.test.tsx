import * as React from 'react'
import renderer from 'react-test-renderer'
import QuoteTerm from './QuoteTerm'
import { shallow } from 'enzyme'

describe('QuoteTerm', () => {
  let defaultProps
  beforeEach(() => {
    defaultProps = {
      header: 'Pricing',
      values: ['Margin', '20%', 'Indicative'],
      prompt: 'View all comments',
      handlePromptClicked: jest.fn()
    }
  })

  it('should match snapshot', () => {
    const tree = renderer.create(<QuoteTerm {...defaultProps} />).toJSON()

    expect(tree).toMatchSnapshot()
  })

  it('should list out values and prompt', () => {
    const wrapper = shallow(<QuoteTerm {...defaultProps} />)

    expect(wrapper.find('li').length).toBe(4)
  })

  it('should call handlePromptClicked when prompt is clicked', () => {
    const wrapper = shallow(<QuoteTerm {...defaultProps} />)

    wrapper.find('[data-test-id="prompt"]').simulate('click')

    expect(defaultProps.handlePromptClicked).toHaveBeenCalled()
  })

  it('should hides prompt if no prompt is passed', () => {
    const { prompt: _, ...defaultPropsWithoutPrompt } = defaultProps
    const wrapper = shallow(<QuoteTerm {...defaultPropsWithoutPrompt} />)

    const prompt = wrapper.find('[data-test-id="prompt"]')

    expect(prompt.exists()).toBeFalsy()
  })
})
