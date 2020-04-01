import * as React from 'react'
import { Prompt } from 'react-router-dom'

export interface IProps {
  when: boolean
  message: string
}

export class LeavingPageConfirmation extends React.Component<IProps> {
  componentDidMount(): void {
    if (this.props.when) {
      window.addEventListener('beforeunload', this.handleBeforeUnload)
    }
  }

  componentDidUpdate(): void {
    if (this.props.when) {
      window.addEventListener('beforeunload', this.handleBeforeUnload)
    } else {
      window.removeEventListener('beforeunload', this.handleBeforeUnload)
    }
  }

  componentWillUnmount(): void {
    window.removeEventListener('beforeunload', this.handleBeforeUnload)
  }

  handleBeforeUnload = (event: BeforeUnloadEvent) => {
    const { message } = this.props

    if (event) {
      event.returnValue = message
    }
    return message
  }

  render() {
    const { when, message } = this.props

    return <Prompt when={when} message={message} />
  }
}

export default LeavingPageConfirmation
