import * as React from 'react'
import { Popup } from 'semantic-ui-react'

interface Props {
  comment: string
  icon: React.ReactNode
}

const CommentTooltip: React.SFC<Props> = (props: Props) => {
  return (
    <Popup
      style={{ overflowWrap: 'break-word', wordBreak: 'break-word', hyphens: 'auto' }}
      trigger={props.icon}
      header="Rejection comment"
      inverted={true}
      wide={true}
      position="right center"
    >
      {props.comment}
    </Popup>
  )
}

export default CommentTooltip
