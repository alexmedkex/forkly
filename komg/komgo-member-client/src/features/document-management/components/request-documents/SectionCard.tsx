import * as React from 'react'
import styled from 'styled-components'
import { Card } from 'semantic-ui-react'

interface Props {
  title: React.ReactNode
  children: React.ReactNode
  style?: { [index: string]: string }
  height?: string
}

export const SectionCard = (props: Props) => {
  return (
    <StyledCard height={props.height} style={{ ...props.style }}>
      <StyledCardContent>
        <HeaderStyle content={props.title} />
        <StyledContentCard content={props.children} />
      </StyledCardContent>
    </StyledCard>
  )
}

const StyledCardContent = styled(Card.Content)`
  &&&&&&&&&&& {
    margin: 0px;
    padding: 16px 30px 30px 30px;
  }
`

const StyledContentCard = styled(Card.Description)`
  &&&&&&&&&&& {
  }
`

const StyledCard =
  styled(Card) <
  { height: string } >
  `
  &&&&&&&&&&& {
    height: ${props => (props.height ? `${props.height}` : '325px')};
    width: unset;
    margin: 30px;
    padding-left: 0px;
    padding-rigth: 0px;
    -webkit-box-shadow: 0px 1px 11px -4px rgba(0, 0, 0, 0.75);
    -moz-box-shadow: 0px 1px 11px -4px rgba(0, 0, 0, 0.75);
    box-shadow: 0px 1px 11px -4px rgba(0, 0, 0, 0.75);
  }
`

const HeaderStyle = styled(Card.Header)`
  &&&&&&&&&&& {
    font-size: 11px;
    height: 21px;
    width: 549px;
    color: #1c2936;
    font-weight: 600;
    line-height: 21px;
  }
`
