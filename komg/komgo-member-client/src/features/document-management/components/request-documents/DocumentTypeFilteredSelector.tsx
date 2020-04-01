import * as React from 'react'
import { Checkbox } from 'semantic-ui-react'
import styled from 'styled-components'
import { SPACES } from '@komgo/ui-components'
import Highlighter from 'react-highlight-words'

import { DocumentType } from '../../store'
import { violetBlue } from '../../../../styles/colors'
import NoTypeFound from './NoTypeFound'

interface IProps {
  documentTypes: DocumentType[]
  selectedDocumentTypes: Set<string>
  search: string
  toggleSelectionDocType(idDocType: string): void
}

const DocumentTypeFilteredSelector: React.FC<IProps> = (props: IProps) => {
  const { documentTypes, selectedDocumentTypes, toggleSelectionDocType, search } = props
  return (
    <Wrapper className="style-scroll">
      {documentTypes.length ? (
        documentTypes.map(docType => (
          <StyledCheckbox
            data-test-id={`request-documents-doctype-checkbox-${docType.id}`}
            checked={selectedDocumentTypes.has(docType.id)}
            onChange={() => toggleSelectionDocType(docType.id)}
            label={
              <label>
                <Highlighter
                  highlightClassName="highlighted-text"
                  searchWords={[search]}
                  autoEscape={true}
                  textToHighlight={docType.name}
                />
              </label>
            }
          />
        ))
      ) : (
        <NoTypeFound message="Sorry, no documents types found" />
      )}
    </Wrapper>
  )
}

const StyledCheckbox = styled(Checkbox)`
  &&& {
    display: block;
    padding: 5px;
    &:hover {
      ::before {
        border-color: ${violetBlue};
      }
    }
  }
`

const Wrapper = styled.div`
  margin-top: ${SPACES.EXTRA_SMALL};
  height: 220px;
  overflow-y: auto;
`

export default DocumentTypeFilteredSelector
