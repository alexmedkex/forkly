import * as React from 'react'
import { Card } from 'semantic-ui-react'
import { rose } from '../../styles/colors'

export interface WarningProps {
  visible: boolean
  renderAlways?: boolean
}

export const Warning: React.FC<WarningProps> = ({ visible, children, renderAlways = true }) => {
  if (!renderAlways && !visible) {
    return null
  }
  return (
    <Card
      data-test-id="requiredFieldPrompt"
      fluid={true}
      style={{
        textAlign: 'center',
        backgroundColor: rose,
        color: 'white',
        border: 'none',
        visibility: visible ? 'visible' : 'hidden'
      }}
    >
      <Card.Content>{children}</Card.Content>
    </Card>
  )
}
