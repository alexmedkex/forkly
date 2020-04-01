import { shallow } from 'enzyme'
import * as React from 'react'
import ModalFooterButtons from './ModalFooterButtons'

const setupTest = () => {
  const rootElement = document.createElement('div')
  rootElement.id = 'modal-button-root'
  document.body.appendChild(rootElement)
}
function stringLit<a>(val: a): a {
  return val
}

describe('ModalFooterButtons component', () => {
  beforeEach(() => setupTest())

  const mockOnClick = jest.fn(() => void 0)

  const modalButtonPropsPrimary = {
    toStep: 0,
    type: stringLit<'primary'>('primary'),
    text: 'test',
    onClick: mockOnClick
  }

  it('should render a child div with ModalFooterButtons item with modalButtonPropsPrimary props', () => {
    const wrapper = shallow(<ModalFooterButtons {...modalButtonPropsPrimary} />)
    expect(wrapper.find('ModalFooterButtons').exists).toBeTruthy()
  })

  it('should call onClick on click action (first button)', () => {
    // Act
    const wrapper = shallow(<ModalFooterButtons {...modalButtonPropsPrimary} />)
    wrapper
      .find('Button')
      .first()
      .simulate('click')
    // Assert
    expect(modalButtonPropsPrimary.onClick).toBeCalled()
  })
})
