import * as React from 'react'
import styled from 'styled-components'

import { SectionCard } from '../SectionCard'
import { DocumentType, Document } from '../../../store'

import { RequirementsListHeader } from './RequirementsListHeader'
import { RequirementsTile } from './RequirementsTile'
import { blueGrey, violetBlue } from '../../../../../styles/colors'
import { CountWrap } from '../../filter/FilterItem'

export interface Props {
  selectedDocumentTypes: Set<string>
  documentTypesById: Map<string, DocumentType[]>
  documentsByTypeId: Map<string, Document[]>
  attachedDocumentsByDocumentTypeId: Map<string, Set<Document>>
  toggleSelectionDocType(docTypeId: string): void
  toggleAddDocumentModalVisible(documentType: DocumentType): void
  toggleAutomatchModalVisible(documentType: DocumentType): void
  removeAttachedDocument(documentTypeId: string, documentId: string): void
  toggleSelectionDocumentType(documentTypeId: string): void
  openViewDocument(documentId: string): void
}

enum TabItems {
  REQUESTED = 'Requested',
  DISMISSED = 'Dismissed',
  RECEIVED = 'Received',
  DEFAULT = REQUESTED
}

const SECTION_TITLE = `SELECT REQUIREMENTS AND ATTACH DOCUMENTS`

interface State {
  selectedTab: TabItems
}

export class RequirementsSection extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      selectedTab: TabItems.DEFAULT
    }
  }

  render() {
    return (
      <SectionCard style={{ height: '405px' }} title={renderSectionTitle()} data-test-id="requirements-section-card">
        <StyledContent>
          <StyledTab>
            <StyledTabItem
              data-test-id={'request-documents-tab-requested'}
              active={this.state.selectedTab === TabItems.REQUESTED}
              onClick={() => this.selectTab(TabItems.REQUESTED)}
            >
              Requested <CountWrap>({this.props.selectedDocumentTypes.size})</CountWrap>
            </StyledTabItem>
            <StyledTabItem
              data-test-id={'request-documents-tab-dismissed'}
              active={false}
              // TBC in a different ticket
              // active={this.state.selectedTab === TabItems.DISMISSED}
              // onClick={() => this.selectTab(TabItems.DISMISSED)}
            >
              Received <CountWrap>(0)</CountWrap>
            </StyledTabItem>
            <StyledTabItem
              data-test-id={'request-documents-tab-received'}
              active={false}
              // TBC in a different ticket
              // active={this.state.selectedTab === TabItems.RECEIVED}
              // onClick={() => this.selectTab(TabItems.RECEIVED)}
            >
              Dismissed <CountWrap>(0)</CountWrap>
            </StyledTabItem>
          </StyledTab>
        </StyledContent>

        <RequirementsListHeader />
        {this.renderBody()}
      </SectionCard>
    )
  }

  private renderBody() {
    if (this.state.selectedTab === TabItems.REQUESTED) {
      return this.renderRequested()
    }

    return <span />
  }

  private renderRequested() {
    return (
      <SectionContent className="style-scroll">
        {this.props.selectedDocumentTypes.size > 0 ? (
          Array.from(this.props.selectedDocumentTypes).map(typeId => {
            const [dt] = this.props.documentTypesById.get(typeId)
            const [attachedDocument] = Array.from(this.props.attachedDocumentsByDocumentTypeId.get(dt.id) || [])
            return (
              <RequirementsTile
                key={typeId}
                documentType={[dt]}
                attachedDocument={attachedDocument}
                typeDocuments={this.props.documentsByTypeId.get(dt.id) || []}
                toggleAddDocumentModalVisible={this.props.toggleAddDocumentModalVisible}
                toggleAutomatchModalVisible={this.props.toggleAutomatchModalVisible}
                removeAttachedDocument={this.props.removeAttachedDocument}
                toggleSelectionDocumentType={this.props.toggleSelectionDocumentType}
                openViewDocument={this.props.openViewDocument}
              />
            )
          })
        ) : (
          <EmptySelection />
        )}
      </SectionContent>
    )
  }

  private selectTab(tab: TabItems) {
    this.setState({ selectedTab: tab })
  }
}

const renderSectionTitle = () => {
  return <span>{SECTION_TITLE}</span>
}

const EmptySelection = () => (
  <DefaultText data-test-id="requirements-empty-selection">No document types selected</DefaultText>
)

const DefaultText = styled.div`
  color: #c0cfde;
  font-size: 21px;
  font-weight: 300;
  text-align: center;
  margin-top: 6rem;
`

const SectionContent = styled.div`
  height: 230px;
  overflow-y: auto;
`
const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 830px;
`

export const StyledTab = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 8px;
  margin-bottom: 12px;
`
const StyledTabItem =
  styled.span <
  { active: boolean } >
  `
  text-align: center;
  margin-right: 30px;
  cursor: pointer;
  color: ${blueGrey};
  padding-bottom: 6px;

  // &:hover {
  //   color: black;
  // }

  ${props =>
    props.active
      ? `
        font-weight: bold;
        color: ${violetBlue}
        border-bottom: 2px solid ${violetBlue};
        // &:hover {
        //   color: ${violetBlue};
        // }
      `
      : ``};

`
