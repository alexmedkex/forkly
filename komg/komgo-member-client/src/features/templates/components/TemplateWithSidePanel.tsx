import React from 'react'
import { ViewContainer } from './ViewContainer'
import { SidePanel, SidePanelInner } from './SidePanel'
import { Preview } from './Preview'
import { Template, ITemplateOptions } from '@komgo/ui-components'
import { ReactNode } from 'react-redux'
import DocumentContentView from '../../document-management/components/documents/DocumentContentView'
import { ImmutableMap } from '../../../utils/types'
import { Document, DocumentStateFields } from '../../document-management'

export interface TemplateWithSidePanelProps extends ITemplateOptions {
  children?: ReactNode
  issuanceDocument?: ImmutableMap<DocumentStateFields>
  issuanceDocumentMetadata?: Document
}

export const TemplateWithSidePanel = ({
  children,
  issuanceDocument,
  issuanceDocumentMetadata,
  ...rest
}: TemplateWithSidePanelProps) => {
  return (
    <ViewContainer>
      {children && (
        <SidePanel>
          <SidePanelInner>{children}</SidePanelInner>
        </SidePanel>
      )}

      <Preview height={'80px'}>
        {issuanceDocumentMetadata ? (
          <DocumentContentView
            documentContent={issuanceDocument.get('documentRaw')}
            isLoadingContent={issuanceDocument.get('isLoadingContent')}
            documentType={issuanceDocument.get('documentType')}
          />
        ) : (
          <Template {...rest} />
        )}
      </Preview>
    </ViewContainer>
  )
}
