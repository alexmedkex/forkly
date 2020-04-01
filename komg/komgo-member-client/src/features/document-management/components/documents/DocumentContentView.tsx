import { ErrorMessage } from '../../../../components'
import { PERMITTED_MIME_TYPES } from '../../../document-management/utils/permittedMimeTypes'
import * as React from 'react'
import { Dimmer, Loader, Image } from 'semantic-ui-react'

import PdfContentView from './PdfContentView'

interface Props {
  documentContent: string
  documentType: string
  isLoadingContent: boolean
}

const DocumentContentView: React.SFC<Props> = (props: Props) => {
  if (props.isLoadingContent) {
    return (
      <Dimmer active={true}>
        <Loader indeterminate={true}>Loading</Loader>
      </Dimmer>
    )
  }

  if (!Object.values(PERMITTED_MIME_TYPES).includes(props.documentType)) {
    return <ErrorMessage title="Cannot view document" error="Document type not permitted" />
  }

  if (props.documentType === PERMITTED_MIME_TYPES.PDF_MIME_TYPE) {
    return <PdfContentView documentContent={props.documentContent} />
  }
  if (
    props.documentType === PERMITTED_MIME_TYPES.JPEG_MIME_TYPE ||
    props.documentType === PERMITTED_MIME_TYPES.PNG_MIME_TYPE
  ) {
    return <Image src={`data:${props.documentType};base64, ${props.documentContent}`} />
  }
  return <iframe height="500em" width="100%" src={`data:${props.documentType};base64, ${props.documentContent}`} />
}

export default DocumentContentView
