import styled from 'styled-components'
import * as React from 'react'
import { READABLE_LOC_STATUS } from '../../features/trades/constants'

const Container = styled.ul`
  list-style: none;
  margin: 7px;
  padding: 0;
  border-left: 7px solid lightgray;
`

interface StatusProps {
  currentStatus: string
  status: string[]
}

const Status = styled.li`
  display: flex;
  padding: 10px 0 10px 0;

  &:first-child {
    padding-top: 0;
  }

  &:last-child {
    padding-bottom: 0;
  }

  span {
    padding: 0 0 0 10px;
    width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 12px;
    text-transform: capitalize;
  }

  &:before {
    content: '';
    display: inline-block;
    background-color: ${(props: StatusProps) => (props.status.includes(props.currentStatus) ? 'green' : 'white')};
    border: 2px solid black;
    height: 21px;
    border-radius: 50%;
    min-width: 21px;
    margin-left: -14px;
  }
`

export interface LetterOfCreditWorkflowProps {
  status: string
}

export const LetterOfCreditWorkflow: React.SFC<LetterOfCreditWorkflowProps> = (props: LetterOfCreditWorkflowProps) => (
  <Container>
    {Object.entries(READABLE_LOC_STATUS).map(([key, value]) => (
      <Status key={key} currentStatus={props.status} status={value}>
        <span>{key.toLocaleLowerCase().replace(/_/g, ' ')}</span>
      </Status>
    ))}
  </Container>
)
