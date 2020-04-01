import * as React from 'react'
import { Input, Icon, InputOnChangeData } from 'semantic-ui-react'
import styled from 'styled-components'
import { SPACES } from '@komgo/ui-components'

import { SectionCard } from './SectionCard'
import { DocumentTypeSelector } from './DocumentTypeSelector'
import { Category, DocumentType } from '../../store'
import DocumentTypeSearchSelector from './DocumentTypeFilteredSelector'
import { ReactComponent as CloseIcon } from '../../../../styles/themes/komgo/assets/fonts/close.svg'
import { grey, blueGrey } from '../../../../styles/colors'

interface Props {
  categories: Category[]
  documentTypes: DocumentType[]
  selectedDocumentTypes: Set<string>
  counterSelectedDoctypes: Map<string, number>
  toggleSelectionDocType(idDocType: string): void
}

interface IState {
  search: string
}

const title: string = 'SELECT THE DOCUMENT TYPES YOU WANT TO REQUEST'

export class SelectDocumentTypeSectionCard extends React.Component<Props, IState> {
  constructor(props: Props) {
    super(props)
    this.state = {
      search: ''
    }

    this.handleOnSearch = this.handleOnSearch.bind(this)
    this.resetSearch = this.resetSearch.bind(this)
  }

  handleOnSearch(_: React.SyntheticEvent<HTMLInputElement>, data: InputOnChangeData) {
    this.setState({
      search: data.value
    })
  }

  resetSearch() {
    this.setState({
      search: ''
    })
  }

  render() {
    const { search } = this.state
    return (
      <SectionCard title={title}>
        <StyledContent>
          <StyledSearch
            onChange={this.handleOnSearch}
            open={false}
            iconPosition="left"
            placeholder="Search document types"
            value={search}
            data-test-id="search-checkboxes"
          >
            <Icon name="search" />
            <input />
            {search !== '' && <StyledCloseIcon onClick={this.resetSearch} data-test-id="clear-search" />}
          </StyledSearch>
          {search ? (
            <DocumentTypeSearchSelector
              selectedDocumentTypes={this.props.selectedDocumentTypes}
              documentTypes={this.props.documentTypes.filter(type =>
                type.name.toLowerCase().includes(search.toLowerCase())
              )}
              toggleSelectionDocType={this.props.toggleSelectionDocType}
              search={search}
            />
          ) : (
            <DocumentTypeSelector
              counterSelectedDoctypes={this.props.counterSelectedDoctypes}
              selectedDocumentTypes={this.props.selectedDocumentTypes}
              toggleSelectionDocType={this.props.toggleSelectionDocType}
              categories={this.props.categories}
              documentTypes={this.props.documentTypes}
            />
          )}
        </StyledContent>
      </SectionCard>
    )
  }
}

const StyledSearch = styled(Input)`
  &&& {
    input {
      padding-right: ${SPACES.LARGE} !important;
    }
    svg {
      top: 8px;
      right: 10px;
      &:hover {
        cursor: pointer;
      }
    }
  }
`

const StyledCloseIcon = styled(CloseIcon)`
  position: absolute;
  right: 2px;
  &:hover {
    #close-button {
      fill: ${blueGrey};
    }
  }
  #close-button {
    fill: ${grey};
  }
`

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 830px;
`
