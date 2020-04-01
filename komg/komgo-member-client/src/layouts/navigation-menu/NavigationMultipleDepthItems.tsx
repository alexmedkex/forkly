import * as React from 'react'
import { Accordion, Menu, Icon } from 'semantic-ui-react'
import styled from 'styled-components'
import { pinkPurple } from '../../styles/colors'

interface Props {
  menuName: string
  active: string
  children: React.ReactNode[] | React.ReactNode
}

interface State {
  open: boolean
}

class NavigationMultipleDepthItems extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      open: false
    }
  }

  componentDidUpdate(oldProps: Props) {
    if (oldProps.active !== this.props.active) {
      const open = this.props.active === this.props.menuName
      this.setState({ open })
    }
  }

  toggleMenu = () => {
    this.setState({ open: !this.state.open })
  }

  render() {
    const { open } = this.state
    const { menuName, children } = this.props
    return (
      <StyledAccordion as={Menu} vertical={true} open={this.state.open}>
        <Menu.Item>
          <Accordion.Title active={open} data-test-id={`navigation-${menuName}`} onClick={this.toggleMenu}>
            <span>{menuName}</span>
            <Icon name="chevron down" />
          </Accordion.Title>
          <Accordion.Content active={open} content={children} />
        </Menu.Item>
      </StyledAccordion>
    )
  }
}

interface IStyledAccordionProps {
  open: boolean
}

const StyledAccordion: any = styled(Accordion)`
  &&&&& {
    margin-top: 22px;
    margin-bottom: ${(props: IStyledAccordionProps) => (props.open ? '22px' : '30px')};
    padding-left: 0;
    width: 100%;
    .title {
      font-size: 12px;
      line-height: 17px;
      color: ${pinkPurple};
      text-transform: uppercase;
      padding: 0 30px;
      display: flex;
      justify-content: space-between;
      &.active {
        .chevron.down.icon {
          margin-top: -1px;
          margin-left: 2px;
        }
      }
      .chevron.down.icon {
        position: absolute;
        left: 198px;
        margin: 0;
        margin-top: 2px;
        color: ${pinkPurple};
        font-size: 10px;
      }
    }
    .content {
      .item {
        padding: 0;
        a {
          display: block;
          padding-left: 38px;
        }
      }
    }
    min-height: 17px;
    > .item {
      padding: 0;
    }
    border: none;
    box-shadow: none;
  }
`

export default NavigationMultipleDepthItems
