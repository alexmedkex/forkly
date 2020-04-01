import * as React from 'react'
import { Button, Modal, Popup, Flag } from 'semantic-ui-react'
import Highlighter from 'react-highlight-words'
import { Table, SPACES } from '@komgo/ui-components'
import styled from 'styled-components'

import { Counterparty } from '../../../../counterparties/store/types'
import { Document } from '../../../store/types'
import { buildCounterpartyWithDocumentsPickerItems } from './utils'
import {
  ActionsWrapper,
  TableAndSearchWrapper,
  CompanyTableItem
} from '../../../../credit-line/components/common/CounterpartyModalPicker'
import { WithSearchInput } from '../../../../../components'

export interface ICounterpartyWithDocuments {
  counterparty: Counterparty
  documents: Document[]
  isSelected: boolean
}

export interface ISelectedCounterpartiesProps {
  counterparties: ICounterpartyWithDocuments[]
  setSelectedCounterparties(staticIds: string[]): void
  onCancel(): void
  onConfirm(): void
}

interface IState {
  companies: ICompanyTableItemWithSharedDocs[]
}

export interface ICompanyTableItemWithSharedDocs extends CompanyTableItem {
  sharedDocuments: Document[]
}

export const CONTENT_CSS = { paddingTop: SPACES.SMALL, paddingBottom: SPACES.SMALL, height: '348px' }

class SelectedCounterparties extends React.Component<ISelectedCounterpartiesProps, IState> {
  static noCounterpartiesSelected = (props: ISelectedCounterpartiesProps) => {
    return props.counterparties.reduce<boolean>((prev, c) => prev && !c.isSelected, true)
  }

  constructor(props: ISelectedCounterpartiesProps) {
    super(props)

    this.state = {
      companies: buildCounterpartyWithDocumentsPickerItems(props.counterparties)
    }
  }

  handleSearchChanged = (search: string) => {
    const newCompanies = buildCounterpartyWithDocumentsPickerItems(this.props.counterparties).filter(member =>
      member.name.toLowerCase().includes(search.toLowerCase())
    )
    this.setState({ companies: newCompanies })
  }

  render() {
    const { companies } = this.state
    const { counterparties } = this.props

    const defaultSelected = counterparties.filter(c => c.isSelected).map(c => c.counterparty.staticId)

    return (
      <React.Fragment>
        <Modal.Header>
          <Modal.Description as="h2" content="Select a counterparty" style={{ marginBottom: 0 }} />
          <Modal.Description
            as="p"
            style={{ marginBlockStart: 0, fontSize: '1rem' }}
            content="Select the counterparties you wish to share documents with"
          />
        </Modal.Header>
        <Modal.Content style={CONTENT_CSS}>
          <TableAndSearchWrapper>
            <WithSearchInput
              onSearchChange={this.handleSearchChanged}
              render={search => (
                <Table
                  data={companies}
                  selectable={true}
                  dataTestId="name"
                  onCheckboxChange={this.props.setSelectedCounterparties}
                  defaultSelected={defaultSelected}
                  columns={[
                    {
                      accessor: 'name',
                      title: 'Counterparty',
                      width: 200,
                      cell: c => (
                        <Highlighter
                          highlightClassName="highlighted-text"
                          searchWords={[search]}
                          autoEscape={true}
                          textToHighlight={c.name}
                        />
                      )
                    },
                    {
                      accessor: 'country',
                      title: 'Country',
                      cell: c => (
                        <span>
                          <Flag name={c.country} /> {c.countryName}
                        </span>
                      )
                    },
                    { accessor: 'location', title: 'Location' },
                    {
                      accessor: 'sharedDocuments',
                      title: 'Documents shared',
                      align: 'right',
                      width: 142,
                      cell: c => (
                        <span>
                          {c.sharedDocuments.length ? (
                            <Popup
                              trigger={
                                <DocumentSharedPopupTrigger>{c.sharedDocuments.length}</DocumentSharedPopupTrigger>
                              }
                              position="right center"
                              content={
                                <div>
                                  <strong>Already shared</strong>
                                  <br />
                                  {c.sharedDocuments.map(d => d.name).join(', ')}
                                </div>
                              }
                            />
                          ) : (
                            '-'
                          )}
                        </span>
                      )
                    }
                  ]}
                />
              )}
            />
          </TableAndSearchWrapper>
        </Modal.Content>
        <Modal.Actions>
          <ActionsWrapper>
            <Button onClick={this.props.onCancel} data-test-id="cancel-button">
              Cancel
            </Button>
            <Button
              primary={true}
              disabled={SelectedCounterparties.noCounterpartiesSelected(this.props)}
              onClick={this.props.onConfirm}
              data-test-id="next-button"
            >
              Next
            </Button>
          </ActionsWrapper>
        </Modal.Actions>
      </React.Fragment>
    )
  }
}

const DocumentSharedPopupTrigger = styled.span`
  &:hover {
    cursor: pointer;
  }
`

export default SelectedCounterparties
