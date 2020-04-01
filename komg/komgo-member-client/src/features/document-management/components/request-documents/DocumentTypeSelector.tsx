import * as React from 'react'
import styled from 'styled-components'
import { List, Icon, Checkbox } from 'semantic-ui-react'
import { Category, DocumentType } from '../../store'
import { CategoryWithColourTag } from '../documents/document-library/CategoryWithColourTag'
import { sortCategories, sortDocumentTypes } from '../../utils/sortingHelper'
import { SPACES } from '@komgo/ui-components'

interface Props {
  categories: Category[]
  documentTypes: DocumentType[]
  selectedDocumentTypes: Set<string>
  counterSelectedDoctypes: Map<string, number>
  toggleSelectionDocType(idDocType: string): void
}

interface State {
  selectedCategory?: Category
}

export class DocumentTypeSelector extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      selectedCategory: undefined
    }
  }

  componentDidMount() {
    if (this.props.categories && this.props.categories.length) {
      this.selectDefaultCategory()
    }
  }

  componentDidUpdate(prevProps: Props) {
    // By default, the first category is selected
    if (prevProps.categories !== this.props.categories) {
      this.selectDefaultCategory()
    }
  }

  selectDefaultCategory() {
    const sorted = sortCategories(this.props.categories)
    this.setState({ selectedCategory: sorted[0] })
  }

  render() {
    const sortedCategories = sortCategories(this.props.categories)
    const selectedDocTypes = this.props.documentTypes.filter(
      docType => (this.state.selectedCategory ? docType.category.id === this.state.selectedCategory.id : undefined)
    )
    const sortedDocTypes = sortDocumentTypes(selectedDocTypes)
    return (
      <Row>
        <List
          data-test-id="request-documents-list-categories"
          style={{ paddingBottom: '0px', minWidth: '410px', paddingRight: '0px', paddingLeft: '0px' }}
          onItemClick={this.selectCategory}
          items={sortedCategories.map(cat => this.renderCategory(cat))}
        />
        <Divider />
        <StyledListDocTypes
          data-test-id="request-documents-list-doctypes"
          className="style-scroll"
          items={sortedDocTypes.map(docType => this.renderDocType(docType))}
        />
      </Row>
    )
  }

  selectCategory = (event: React.SyntheticEvent, data: object) => {
    const key = 'children'
    if (data[key]) {
      this.setState({ selectedCategory: data[key][0].props[key][0].props.category })
    }
  }

  private renderDocType(docType: DocumentType) {
    return (
      <StyledListTypeItem key={docType.id} data-test-id={`request-documents-doctype-${docType.id}`}>
        <StyledCheckbox
          data-test-id={`request-documents-doctype-checkbox-${docType.id}`}
          checked={this.props.selectedDocumentTypes.has(docType.id)}
          onChange={() => this.props.toggleSelectionDocType(docType.id)}
          label={docType.name}
        />
      </StyledListTypeItem>
    )
  }

  private renderCategory(category: Category) {
    const isSelected = category === this.state.selectedCategory
    const numSelectedDocTypes: number = this.props.counterSelectedDoctypes.get(category.id)
    return (
      <StyledListCategoryItem
        highlighted={isSelected}
        key={category.id}
        data-test-id={`request-documents-category-${category.id}`}
      >
        <StyledNameWithCounter>
          <CategoryWithColourTag category={category} />
          <StyledCounter data-test-id={`request-documents-category-counter-${category.id}`}>
            {numSelectedDocTypes > 0 ? numSelectedDocTypes : ''}
          </StyledCounter>
        </StyledNameWithCounter>
        {isSelected ? <Icon name="play" size="small" /> : ''}
      </StyledListCategoryItem>
    )
  }
}

const StyledCounter = styled.div`
  &&&&&& {
    font-weight: 600;
    color: #5700b5;
    font-size: 11px;
  }
`

const StyledNameWithCounter = styled.div`
  &&&&&& {
    display: flex;
    align-items: center;
    flex-grow: 2;
    min-width: 300px;
  }
`

const StyledCheckbox = styled(Checkbox)`
  &&&&&&& :hover {
    ::before {
      border-color: #5700b5;
    }
  }
`

const StyledListDocTypes = styled(List)`
  &&&&&&& {
    padding: 0px;
    margin-top: 0px;
    width: -webkit-fill-available;
    margin-left: 30px;
    height: 220px;
    overflow-y: auto;
  }
`

const StyledListCategoryItem = styled(List.Item)`
  &&&&&&& {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 5px;
    padding-right: 10px;
    background-color: ${(props: { highlighted: boolean }) => (props.highlighted ? '#f2f5f8' : 'white')};
  }
  :hover {
    cursor: pointer;
  }
  :focus {
    background-color: grey;
  }
`

const StyledListTypeItem = styled(List.Item)`
  &&&&&&& {
    margin: 0px; 
    display: flex; 
    flex-direction: row;
    align-items: center;
    padding: 6.5px 5px;
`

const Row = styled.div`
  &&&&&&& {
    display: flex;
    flex-direction: row;
    padding-top: ${SPACES.EXTRA_SMALL};
  }
`

const Divider = styled.div`
  &&&&& {
    width: 2px;
    background: #dbe5ec;
    margin-left: 0px;
    padding-right: 0px;
  }
`
