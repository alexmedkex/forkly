import * as React from 'react'
import { Modal, Button, Flag, FlagNameValues } from 'semantic-ui-react'
import styled from 'styled-components'
import { Table, RowConfig, SPACES } from '@komgo/ui-components'
import Highlighter from 'react-highlight-words'

import { blueGrey, grey } from '../../../../styles/colors'
import { buildCounterpartyPickerItems, buildCounterpartyRowConfig } from '../../utils/formatters'
import { WithSearchInput } from '../../../../components'
import { IMemberWithDisabledFlag } from '../../store/types'

interface IProps extends WithModalProps {
  renderButton(openModal: () => void): React.ReactElement
}

export interface WithModalProps {
  members: IMemberWithDisabledFlag[]
  title: string
  counterpartyTablePrint: string
  nextButtonText?: string
  multipleSelection?: boolean
  onNext(counterpartyId: string | string[]): void
}

export interface CompanyTableItem {
  name: string
  countryName: string
  country: FlagNameValues
  location: string
  id: string
}

interface IState {
  open: boolean
  selectedCounterparties: string[]
  companies: CompanyTableItem[]
  tableRowConfig: Map<string, RowConfig>
}

class CounterpartyModalPicker extends React.Component<IProps, IState> {
  static defaultProps = {
    nextButtonText: 'Next'
  }

  constructor(props: IProps) {
    super(props)
    this.state = {
      open: false,
      companies: buildCounterpartyPickerItems(props.members),
      tableRowConfig: buildCounterpartyRowConfig(props.members, []),
      selectedCounterparties: []
    }

    this.handleCloseModal = this.handleCloseModal.bind(this)
    this.handleOpenModal = this.handleOpenModal.bind(this)
    this.handleSearchChanged = this.handleSearchChanged.bind(this)
    this.handleSelectCounterparty = this.handleSelectCounterparty.bind(this)
    this.handleNext = this.handleNext.bind(this)
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this)
  }

  handleOpenModal() {
    this.setState({
      open: true
    })
  }

  handleCloseModal() {
    this.setState({
      open: false,
      selectedCounterparties: [],
      companies: buildCounterpartyPickerItems(this.props.members),
      tableRowConfig: buildCounterpartyRowConfig(this.props.members, [])
    })
  }

  handleSearchChanged(search: string) {
    const newCompanies = buildCounterpartyPickerItems(this.props.members).filter(member =>
      member.name.toLowerCase().includes(search.toLowerCase())
    )
    this.setState({ companies: newCompanies })
  }

  handleSelectCounterparty(item: CompanyTableItem) {
    this.setState({
      selectedCounterparties: [item.id],
      tableRowConfig: buildCounterpartyRowConfig(this.props.members, [item.id])
    })
  }

  handleCheckboxChange(selectedCounterparties: string[]) {
    this.setState({
      selectedCounterparties
    })
  }

  handleNext() {
    const ids = this.state.selectedCounterparties
    this.handleCloseModal()
    this.props.onNext(this.props.multipleSelection ? ids : ids[0])
  }

  render() {
    const { title, counterpartyTablePrint, nextButtonText, multipleSelection } = this.props
    const { open, selectedCounterparties, companies } = this.state

    return (
      <React.Fragment>
        <Modal
          trigger={this.props.renderButton(this.handleOpenModal)}
          open={open}
          onClose={this.handleCloseModal}
          size="large"
          data-test-id="select-modal"
        >
          <Modal.Header>{title}</Modal.Header>
          <Modal.Content style={{ paddingTop: SPACES.SMALL, paddingBottom: SPACES.SMALL, height: '343px' }}>
            <TableAndSearchWrapper>
              <WithSearchInput
                onSearchChange={this.handleSearchChanged}
                render={search => (
                  <Table
                    data={companies}
                    selectable={!!multipleSelection}
                    onCheckboxChange={this.handleCheckboxChange}
                    dataTestId="name"
                    columns={[
                      {
                        accessor: 'name',
                        title: counterpartyTablePrint,
                        width: 240,
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
                      { accessor: 'location', title: 'Location' }
                    ]}
                    onRowClick={multipleSelection ? undefined : this.handleSelectCounterparty}
                    rowConfig={this.state.tableRowConfig}
                  />
                )}
              />
            </TableAndSearchWrapper>
          </Modal.Content>
          <Modal.Actions>
            <ActionsWrapper>
              <Button onClick={this.handleCloseModal} data-test-id="cancel-button">
                Cancel
              </Button>
              <Button
                disabled={!selectedCounterparties.length}
                onClick={this.handleNext}
                primary={true}
                data-test-id="next-button"
              >
                {nextButtonText}
              </Button>
            </ActionsWrapper>
          </Modal.Actions>
        </Modal>
      </React.Fragment>
    )
  }
}

export const TableAndSearchWrapper = styled.div`
  &&& {
    .ReactTable {
      overflow-x: auto;
      .rt-thead.-header {
        border-top: unset;
      }
      .rt-tbody {
        max-height: 240px;
        overflow-y: auto;
        overflow-x: hidden;
        &::-webkit-scrollbar-track {
          -webkit-box-shadow: inset 0 0 6px rgba(255, 255, 255, 0.3);
          background-color: ${grey};
        }
        &::-webkit-scrollbar {
          width: 2px;
          background-color: ${grey};
        }
        &::-webkit-scrollbar-thumb {
          background-color: ${blueGrey};
          border: 2px solid ${blueGrey};
        }
      }
    }
  }
`

export const ActionsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`
export default CounterpartyModalPicker
