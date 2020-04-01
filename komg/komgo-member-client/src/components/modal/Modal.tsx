import * as React from 'react'
import * as ReactDOM from 'react-dom'
import styled from 'styled-components'

interface Props {
  className?: string
  rootElementId: string
  onOpen?(): void
}
class Modal extends React.Component<Props> {
  private rootElement: HTMLElement
  private targetElement: HTMLElement

  constructor(props: Props) {
    super(props)
    this.rootElement = document.getElementById(this.props.rootElementId)!
    this.targetElement = document.createElement('div')
    this.targetElement.className = this.props.className || ''
  }

  componentDidMount() {
    if (this.props.rootElementId) {
      this.rootElement = document.getElementById(this.props.rootElementId)!
      this.targetElement = this.rootElement.appendChild(this.targetElement)
    }

    if (this.props.onOpen && typeof this.props.onOpen === 'function') {
      this.props.onOpen()
    }
  }

  componentWillUnmount() {
    if (this.targetElement) {
      Array.from(this.rootElement.children).forEach(el => this.rootElement.removeChild(el))
    }
  }

  render() {
    return this.targetElement ? ReactDOM.createPortal(this.props.children, this.targetElement) : null
  }
}

// export default Modal
export default styled(Modal)`
  position: relative;
  left: -300px;
  top: 30px;
`
