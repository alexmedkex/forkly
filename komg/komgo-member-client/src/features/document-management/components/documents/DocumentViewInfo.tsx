import moment from 'moment'
import * as React from 'react'
import { Tab } from 'semantic-ui-react'

import { Document, SharedWithFull } from '../../store/types'
import EvaluationInfoTable from '../../../review-documents/containers/evaluation/EvaluationInfoTable'
import SharedDocumentInfo from './SharedDocumentInfo'

interface Props {
  loadedDocument: Document
  sharedWith: SharedWithFull[]
  isSharedDocument: boolean
}

const DocumentInfoView: React.FC<Props> = (props: Props) => {
  return <Tab panes={getPanes(props)} />
}

function getPanes(props: Props) {
  if (!props.isSharedDocument) {
    return [documentInfoPane(props), sharedInfoPane(props)]
  }
  return [documentInfoPane(props)]
}

function documentInfoPane(props: Props) {
  const epochDate = new Date(0)
  return {
    menuItem: 'Information',
    render: () => (
      <EvaluationInfoTable
        type={props.loadedDocument.type.name}
        title={props.loadedDocument.name}
        expiry={
          moment(epochDate).isSame(props.loadedDocument.registrationDate)
            ? props.loadedDocument.receivedDate
            : props.loadedDocument.registrationDate
        }
        metadata={props.loadedDocument.metadata.map(x => x.value)}
        parcelId={
          props.loadedDocument.context && props.loadedDocument.context.parcelId
            ? props.loadedDocument.context.parcelId
            : undefined
        }
        comment={
          props.loadedDocument.comment && props.loadedDocument.comment !== '' ? props.loadedDocument.comment : undefined
        }
      />
    )
  }
}

function sharedInfoPane(props: Props) {
  return { menuItem: 'Shared with', render: () => <SharedDocumentInfo sharedWith={props.sharedWith} /> }
}

export default DocumentInfoView
