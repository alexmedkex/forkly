import * as React from 'react'
import { Accordion, Header, Icon, Segment } from 'semantic-ui-react'
import styled from 'styled-components'
import { darkViolet, indigo } from '../../styles/colors'

interface IAccordionWrapperProps {
  title: string
  active: boolean
  index: any
  handleClick?: (e: React.SyntheticEvent, titleProps: any) => void
  children: any
}

const ICON_OPEN = 'angle down'
const ICON_CLOSED = 'angle right'
const icon = (active: boolean) => (active ? ICON_OPEN : ICON_CLOSED)

export const AccordionWrapper: React.FC<IAccordionWrapperProps> = (props: IAccordionWrapperProps) => (
  <StyledAccordion fluid={true}>
    <Accordion.Title active={props.active} index={props.index} onClick={props.handleClick}>
      <Header block={true} className="komgo-accordion-title">
        {props.title} {props.handleClick ? <Icon name={icon(props.active)} /> : undefined}
      </Header>
    </Accordion.Title>
    <Accordion.Content active={props.active} style={{ marginBottom: '20px' }}>
      <Segment>{props.children}</Segment>
    </Accordion.Content>
  </StyledAccordion>
)

export const StyledAccordion = styled(Accordion)`
  &&& {
    .komgo-accordion-title {
      background-color: ${indigo} !important;
      border-radius: 5px;
      border: 1px solid ${darkViolet};
      padding: 12px 30px;
      height: 45px;
      color: white;
    }

    .active .komgo-accordion-title {
      border-radius: 5px 5px 0px 0px;
      margin-bottom: -14px;
    }

    i {
      color: white;
      margin-top: 2px;
    }
  }
`
