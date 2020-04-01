import * as React from 'react'
import { truncate } from '../../utils/casings'
import { Popup } from 'semantic-ui-react'

export interface TruncatedTextProps {
  maxLength?: number
  text?: string
}

export const TruncatedText: React.SFC<TruncatedTextProps> = ({ maxLength = 30, text = '' }) =>
  text.length >= maxLength ? (
    <Popup trigger={<span>{truncate(text, maxLength)}</span>}>{text}</Popup>
  ) : (
    <React.Fragment>{text}</React.Fragment>
  )
