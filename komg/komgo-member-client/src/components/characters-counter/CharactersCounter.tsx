import * as React from 'react'

interface CharactersCounterProps {
  counter: number
  maxChars: number
  hidden: boolean
}

export const CharactersCounter: React.SFC<CharactersCounterProps> = (props: CharactersCounterProps) => (
  <p hidden={props.hidden}>
    Used {props.counter} / {props.maxChars} character limit
  </p>
)
