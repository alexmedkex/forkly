import React from 'react'
import styled from 'styled-components'
import { blueGrey } from '../../../../styles/colors'
import { dark } from '@komgo/ui-components'

interface IQuoteTermProps {
  header: string
  values: string[]
  prompt?: string // for view comment button
  handlePromptClicked?: () => void // for view comment button
}

const QuoteTerm: React.FC<IQuoteTermProps> = (props: IQuoteTermProps) => (
  <QuoteTermWrapper>
    <TermHeader data-test-id={`column-${props.header}`}>{props.header}</TermHeader>
    <QuoteTermsList>
      {props.values.map(value => <li key={value}>{value}</li>)}
      {props.prompt ? (
        <li data-test-id="prompt" onClick={() => props.handlePromptClicked()}>
          <a>{props.prompt}</a>
        </li>
      ) : null}
    </QuoteTermsList>
  </QuoteTermWrapper>
)

const QuoteTermWrapper = styled.div`
  display: block;
`

const TermHeader = styled.span`
  color: ${blueGrey};
  text-transform: uppercase;
  font-size: 0.8rem;
`

const QuoteTermsList = styled.ul`
  list-style-type: none;
  padding: 0px;
  margin: 0px;

  & li a:hover {
    cursor: pointer;
    color: ${dark};
  }
`

export default QuoteTerm
