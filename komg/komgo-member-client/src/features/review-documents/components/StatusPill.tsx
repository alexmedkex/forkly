import * as React from 'react'
import { Label } from 'semantic-ui-react'

interface Props {
  status: string
}

const StatusPill: React.SFC<Props> = (props: Props) => {
  let label: any
  if (props.status === 'accepted') {
    label = (
      <Label className="approved-pill" key={props.status}>
        APPROVED
      </Label>
    )
  } else if (props.status === 'rejected') {
    label = (
      <Label color="red" key={props.status}>
        REJECTED
      </Label>
    )
  } else {
    label = ''
  }
  return label
}

export default StatusPill
