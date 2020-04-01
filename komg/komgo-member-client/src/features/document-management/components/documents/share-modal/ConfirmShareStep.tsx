import * as React from 'react'
import { Button, Modal } from 'semantic-ui-react'
import { groupBy } from 'lodash'

import { pluralize } from './utils'

import { Counterparty } from '../../../../counterparties/store/types'
import { Document, Category } from '../../../store/types'
import { intersectionOfTwoSets } from '../../../../../utils/setUtils'
import ShareDocumentsGroupByType from './ShareDocumentsGroupByType'
import { ActionsWrapper } from '../../../../credit-line/components/common/CounterpartyModalPicker'
import { SPACES } from '@komgo/ui-components'
import { CONTENT_CSS } from './SelectedCounterparties'

export interface ConfirmShareProps {
  selectedCounterparties: Counterparty[]
  documents: Document[]
  onCancel(): void
  onShare(): void
}

export interface DocumentWithAlreadyShared extends Document {
  // was it shared ever?
  isAlreadyShared: boolean
  // was it shared with all parties involved in this sharing?
  wasSharedWithAllParties: boolean
}

const ConfirmShareStep: React.FC<ConfirmShareProps> = (props: ConfirmShareProps) => {
  const documentToDocumentWithAlreadyShared = (staticIdsSharingTo: Set<string>) => (
    doc: Document
  ): DocumentWithAlreadyShared => {
    const sharedWithSet: Set<string> = new Set(doc.sharedWith.map(sw => sw.counterpartyId))
    const alreadySharedWith = intersectionOfTwoSets(sharedWithSet, staticIdsSharingTo)

    const isAlreadyShared = alreadySharedWith.size > 0
    const wasSharedWithAllParties =
      isAlreadyShared && doc.sharedWith.every(cpId => staticIdsSharingTo.has(cpId.counterpartyId))

    return { ...doc, isAlreadyShared, wasSharedWithAllParties }
  }

  const docsToDocsWithSharedFlags = (documents: Document[], counterParties: Counterparty[]) => {
    const staticIdsSharingTo: Set<string> = new Set(counterParties.map(cp => cp.staticId))
    return documents.map(documentToDocumentWithAlreadyShared(staticIdsSharingTo))
  }

  const docsByType = groupBy(
    docsToDocsWithSharedFlags(props.documents, props.selectedCounterparties),
    doc => doc.type.name
  )

  return (
    <React.Fragment>
      <Modal.Header>
        <Modal.Description as="h2" content="Share documents" style={{ marginBottom: 0 }} />
        <Modal.Description style={{ marginBlockStart: 0, fontSize: '1rem' }}>
          <p data-test-id="share-summary">
            You are sharing {props.documents.length} {pluralize('document', props.documents.length, '', 's')} with{' '}
            {props.selectedCounterparties.length}{' '}
            <b>{pluralize('counterpart', props.selectedCounterparties.length, 'y', 'ies')}</b>
          </p>
        </Modal.Description>
      </Modal.Header>
      <Modal.Content style={CONTENT_CSS}>
        <ShareDocumentsGroupByType docsByType={docsByType} />
      </Modal.Content>
      <Modal.Actions>
        <ActionsWrapper>
          <Button onClick={props.onCancel} data-test-id="back-button">
            Back
          </Button>
          <Button primary={true} onClick={props.onShare} data-test-id="share-button">
            Share now
          </Button>
        </ActionsWrapper>
      </Modal.Actions>
    </React.Fragment>
  )
}

export default ConfirmShareStep
