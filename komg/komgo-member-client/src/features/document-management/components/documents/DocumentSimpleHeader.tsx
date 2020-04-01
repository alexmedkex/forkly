import * as React from 'react'
import { Button } from 'semantic-ui-react'
import styled from 'styled-components'

import { Document } from '../../store/types'
import { FlexHeader } from './DocumentViewHeader'

interface IProps {
  document: Document
  actions: {
    close(): void
  }
}

const StyledFlexHeader = styled(FlexHeader)`
  && {
    justify-content: flex-end;
  }
`

const DocumentSimpleHeader: React.FC<IProps> = (props: IProps) => {
  return (
    <StyledFlexHeader>
      <Button content="Close" onClick={props.actions.close} data-test-id="close-view-document" />
    </StyledFlexHeader>
  )
}

export default DocumentSimpleHeader
