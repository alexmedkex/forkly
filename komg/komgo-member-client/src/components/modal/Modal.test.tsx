import { mount } from 'enzyme'
import * as React from 'react'
import Modal from './Modal'

describe('Modal component', () => {
  const rootElement = document.createElement('div')
  rootElement.id = 'modal-root'
  document.body.appendChild(rootElement)
  // Arrange
  const modalProps = {
    className: 'anonClass',
    rootElementId: 'modal-root'
  }

  const mountOptions = {
    attachTo: rootElement
  }
  const mockOnOpen = jest.fn(() => void 0)

  it('should render a modal component containing expected children', () => {
    // Act
    const wrapper = mount(
      <Modal {...modalProps} onOpen={mockOnOpen}>
        <div id="modal-content" />
      </Modal>,
      mountOptions
    )

    // Assert
    expect(wrapper.find('#modal-content')).toHaveLength(1)
  })

  it('should call onOpen when mounted', () => {
    // Act
    mount(
      <div id="modal-root">
        <Modal {...modalProps} onOpen={mockOnOpen}>
          <div id="modal-content">hello world</div>
        </Modal>
      </div>,
      mountOptions
    )
    // Assert
    expect(mockOnOpen).toHaveBeenCalled()
  })
})
