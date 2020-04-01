import * as React from 'react'
import { Button } from 'semantic-ui-react'

interface ModalFooterButtonProps {
  toStep: number
  type: 'primary' | 'default'
  text: string
  onClick(step: number): void
}

const ModalFooterButton = (props: ModalFooterButtonProps) => {
  return (
    <Button primary={props.type === 'primary'} onClick={(e: any) => props.onClick(props.toStep)}>
      {props.text}
    </Button>
  )
}

export default ModalFooterButton
