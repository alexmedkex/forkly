import * as React from 'react'
import { Document } from '../../../../components/document/Document'
import { Segment } from 'semantic-ui-react'
import { ErrorMessage, LoadingTransition } from '../../../../components'

export interface LCDocumentOrErrorOrLoadingProps {
  document?: string
  error?: string
}

export const LCDocumentOrErrorOrLoading: React.SFC<LCDocumentOrErrorOrLoadingProps> = (
  props: LCDocumentOrErrorOrLoadingProps
) => {
  if (props.error) {
    return <ErrorMessage error={props.error} title="Error while generating PDF document" />
  } else if (props.document) {
    return <Document base64Content={props.document} />
  } else {
    return (
      <Segment padded="very">
        <LoadingTransition title="Loading document" marginTop="0" />
      </Segment>
    )
  }
}
