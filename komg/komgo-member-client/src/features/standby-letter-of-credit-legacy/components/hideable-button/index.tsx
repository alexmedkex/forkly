import * as React from 'react'
import { Button, ButtonProps } from 'semantic-ui-react'

interface HideableButtonProps extends ButtonProps {
  hidden: boolean
}
export const HideableButton: React.FC<HideableButtonProps> = ({ hidden, ...props }) => !hidden && <Button {...props} />
