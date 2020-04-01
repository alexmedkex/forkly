import * as React from 'react'
import { Dropdown, Popup } from 'semantic-ui-react'
import styled from 'styled-components'

import NoSearchResult from '../../messages/NoSearchResult'
import { Category, DocumentType, Document } from '../../../store/types'

import { groupBy } from './toMap'
import { DropdownOption } from './DocumentListDropdownOptions'

import { isEmptyLibrary } from '../../../../document-management/utils/selectors'

import { User } from '../../../../../store/common/types'

import { MapDocumentsToDocumentTypeId } from './toMap'
import { filterUnregisteredDocuments } from '../../../utils/selectors'
import OurDocumentsLibrary from '../document-library/OurDocumentsLibrary'
import { RouteComponentProps, withRouter } from 'react-router'
import { compose } from 'redux'

interface Props extends RouteComponentProps<{}> {
  context: string
  className?: string
  categories: Category[]
  documentTypes: DocumentType[]
  selectedDocuments: string[]
  documents: Document[]
  documentsGroupByType: MapDocumentsToDocumentTypeId
  documentAdditionalPropsToBeShown?: string[]
  isFiltered: boolean
  historyLocation?: any
  usersById?: Map<string, User[]>
  componentInCaseNoDocuments(): React.ReactNode
  handleSelectDocument(document: Document): void
  bulkSelectDocuments(...documentIds: string[]): void
  handleSelectDocumentType(documentType: DocumentType): void
  renderDocumentDropdownActions(document: Document): DropdownOption[]
  renderDocumentTypeDropdownActions(documentType: DocumentType): DropdownOption[]
  clearHighlightedDocumentId?(): void
}

interface State {
  highlightedDocumentId: string | null
}
class DocumentsByCategoryList extends React.Component<Props, State> {
  highlightedDocumentId: string | null = null

  constructor(props: Props) {
    super(props)
    this.state = {
      highlightedDocumentId: null
    }
    this.renderDocumentExtraFunctionality = this.renderDocumentExtraFunctionality.bind(this)
  }

  componentDidMount() {
    const idFromURL = this.getDocumentIdhighlightedByUrl()
    if (idFromURL) {
      this.setState({ highlightedDocumentId: idFromURL })
    } else if (this.getHighlightedDocumentIdFromProps(this.props)) {
      this.setState({ highlightedDocumentId: this.props.historyLocation.state.highlightDocumentId })
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (this.shouldHighlightedDocumentUpdate(prevProps)) {
      const incomingHighlightDocumentId = this.getHighlightedDocumentIdFromProps(this.props)
      this.setState({ highlightedDocumentId: incomingHighlightDocumentId })
    }
  }

  shouldHighlightedDocumentUpdate = (prevProps: Props): boolean => {
    const current = this.getHighlightedDocumentIdFromProps(prevProps)
    const incoming = this.getHighlightedDocumentIdFromProps(this.props)

    return incoming !== current
  }

  getHighlightedDocumentIdFromProps = (props: Props): string | null => {
    if (!(props.historyLocation && props.historyLocation.state)) {
      return null
    }
    const { state } = props.historyLocation
    if (state) {
      return state.highlightDocumentId
    }
    return null
  }

  categoryToAccordion = () => {
    const categoriesById = groupBy(this.props.categories, cat => cat.id)
    const documentsByCategoryId = groupBy(
      this.props.documents.filter(filterUnregisteredDocuments),
      doc => doc.category.id
    )

    return !this.props.isFiltered && isEmptyLibrary(this.props.documentsGroupByType) ? (
      this.props.componentInCaseNoDocuments()
    ) : this.props.isFiltered && !this.props.documents.length ? ( // && !this.isThereAnyDocumentToShowAfterFiltering() ? ( // TODO: BKOLAK check chis
      <NoSearchResult />
    ) : (
      <OurDocumentsLibrary
        context={this.props.context}
        categoriesById={categoriesById}
        documentsByCategoryId={documentsByCategoryId}
        renderEllipsisMenu={this.renderDocumentExtraFunctionality}
        getCategoryDocumentCount={this.getCategoryDocumentCount}
        getUserNameFromDocumentUploaderId={this.getUserNameFromDocumentUploaderId}
        getViewDocumentOption={this.getOption('view')}
        getDownloadDocumentOption={this.getOption('download')}
        highlightedDocumentId={this.state.highlightedDocumentId}
        clearHighlightedDocumentId={this.props.clearHighlightedDocumentId}
        bulkSelectDocuments={this.props.bulkSelectDocuments}
        handleDocumentSelect={this.props.handleSelectDocument}
        selectedDocuments={this.props.selectedDocuments}
      />
    )
  }

  renderDocumentExtraFunctionality(document: Document): React.ReactNode {
    return (
      <StyledDropdown inline={true} id={document.id} icon={{ name: 'ellipsis horizontal' }} direction={'left'}>
        <Dropdown.Menu>
          {this.props
            .renderDocumentDropdownActions(document)
            .filter(option => (this.props.context === 'document-library' ? option.key !== 'view' : true))
            .map((option: DropdownOption) => this.renderFullMenuItem(option))}
        </Dropdown.Menu>
      </StyledDropdown>
    )
  }

  render() {
    return this.categoryToAccordion()
  }

  private getCategoryDocumentCount = (docs: Document[] = []) => docs.length

  private getUserNameFromDocumentUploaderId = (idUser: string) => {
    if (!idUser || idUser === '') {
      return 'Unknown'
    }
    const user = this.props.usersById.get(idUser)

    return user && user[0] ? `${user[0].firstName} ${user[0].lastName}` : 'Unknown'
  }

  private getOption = (key: string) => (doc: Document) => {
    const options = this.props.renderDocumentDropdownActions(doc)
    const [view] = options.filter(opt => opt.key === key && !opt.disabled)
    return view
  }

  private renderFullMenuItem = (option: DropdownOption): React.ReactNode => this.renderMenuItem(option)

  private renderMenuItem = ({ ...option }: DropdownOption): React.ReactNode =>
    option.popup ? (
      <Popup
        key={option.key}
        trigger={<StyledDropdownItem {...option} />}
        inverted={true}
        on="hover"
        position={option.popup.position}
        content={option.popup.text}
      />
    ) : (
      <Dropdown.Item {...option} />
    )

  private getDocumentIdhighlightedByUrl = (): string => {
    if (this.props.location && this.props.location.search) {
      const params = this.props.location.search.split('?')[1].split('&')
      return params[0].split('=')[1]
    } else {
      return ''
    }
  }
}

const StyledDropdown = styled(Dropdown)`
  padding-right: 0.5em;
`

const StyledDropdownItem = styled(Dropdown.Item)`
  pointer-events: auto !important;
`

export default compose<any>(withRouter)(DocumentsByCategoryList)
