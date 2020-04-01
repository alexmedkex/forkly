import { Label } from 'semantic-ui-react'
import { ACTION_STATUS_TO_COLOR } from '../constants'
import * as React from 'react'
import styled from 'styled-components'

interface IProps {
  actionStatus: string
}

export const ActionStatus: React.FC<IProps> = ({ actionStatus }) => {
  const color = (ACTION_STATUS_TO_COLOR as any)[actionStatus]
  const LabelWrapper = styled(Label)`
    &&& {
      background-color: ${color};
      border-color: ${color};
      color: white;
    }
  `
  return <LabelWrapper as="span">{actionStatus.toUpperCase()}</LabelWrapper>
}
