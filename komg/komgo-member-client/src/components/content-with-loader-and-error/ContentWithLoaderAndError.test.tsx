import * as React from 'react'
import { shallow } from 'enzyme'
import ContentWithLoaderAndError from './ContentWithLoaderAndError'
import renderer from 'react-test-renderer'

describe('ContentWithLoaderAndError', () => {
  let defaultProps

  beforeEach(() => {
    defaultProps = {
      isLoading: false,
      loadingProps: { title: 'test' },
      errors: [],
      errorTitle: 'Test error',
      children: <div id="content">ok</div>
    }
  })

  it('should math default snapshot', () => {
    const tree = renderer.create(<ContentWithLoaderAndError {...defaultProps} />).toJSON()

    expect(tree).toMatchSnapshot()
  })

  it('should find ErrorMessage if error exists and not LoadingTransition', () => {
    const wrapper = shallow(<ContentWithLoaderAndError {...defaultProps} errors={[{ message: 'Error' }]} />)

    const errorMessage = wrapper.find('ErrorMessage')
    const loadingTransition = wrapper.find('LoadingTransition')

    expect(errorMessage.length).toBe(1)
    expect(loadingTransition.length).toBe(0)
  })

  it('should find LoadingTransition if loading is true and not ErrorMessage', () => {
    const wrapper = shallow(<ContentWithLoaderAndError {...defaultProps} isLoading={true} />)

    const loadingTransition = wrapper.find('LoadingTransition')
    const errorMessage = wrapper.find('ErrorMessage')

    expect(loadingTransition.length).toBe(1)
    expect(errorMessage.length).toBe(0)
  })
})
