import * as React from 'react'
import { Message } from 'semantic-ui-react'
import styled from 'styled-components'
import { errorRed } from '../../styles/colors'

interface IProps {
  title: string
  messages: string[]
  dataTestId?: string
}

interface IState {
  open: boolean
}

export class MultiErrorMessage extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      open: false
    }
  }

  toggleSeeAll = () => {
    this.setState({
      open: !this.state.open
    })
  }

  render() {
    const { title, messages, dataTestId } = this.props
    const { open } = this.state
    return (
      <Message negative={true} data-test-id={dataTestId}>
        <Message.Header>{title}</Message.Header>
        {messages.map((message, index) => (index < 3 || open ? <Error key={message}>{message}</Error> : null))}
        {messages.length > 3 ? <Button onClick={this.toggleSeeAll}>{open ? 'Less' : 'More'}</Button> : null}
      </Message>
    )
  }
}

export const Button = styled.button`
  color: inherit;
  border: none;
  cursor: pointer;
  &:focus {
    outline-color: ${errorRed};
  }
  background-color: transparent;
  text-decoration: underline;
  padding-left: 0;
  padding-right: 0;
`

export const Error = styled.p`
  &&&&& {
    margin: 0.25rem 0;
  }
`
