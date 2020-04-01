import { Table } from '@komgo/ui-components'
import React from 'react'
import { Checkbox } from 'semantic-ui-react'
import styled from 'styled-components'

import { grey, white } from '../../../styles/colors'
import { Document } from '../../document-management'
import { BottomSheetStatus } from '../../bottom-sheet/store/types'

interface Props {
  documents: Document[]
}

interface State {
  selectAll: boolean
  selected: string[]
}

const filterUnregisteredDocuments = (doc: Document) => doc.state === BottomSheetStatus.REGISTERED

const getData = (documents: Document[]) =>
  documents.filter(filterUnregisteredDocuments).map(document => ({
    id: document.id,
    name: document.name,
    type: document.type.name,
    category: document.category.name
  }))

class TradeDocumentsList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      selectAll: false,
      selected: []
    }
  }

  handleChange = item => (e, data) => {
    const { documents } = this.props
    const { selected } = this.state
    const selectedItems = data.checked ? [...selected, item.id] : selected.filter(id => id !== item.id)
    const selectAll = selectedItems.length === documents.length

    this.setState({ selectAll, selected: selectedItems })
  }

  handleAllChange = () => {
    const { documents } = this.props
    const selectAll = !this.state.selectAll
    const selected = selectAll ? documents.map(({ id }) => id) : []

    this.setState({ selectAll, selected })
  }

  render() {
    const { documents } = this.props
    const { selectAll, selected } = this.state
    return (
      <StyledWrapper>
        <Table
          data-test-id="tradeDocumentsListTable"
          data={getData(documents)}
          columns={[
            {
              cell: t => <StyledCheckbox checked={selected.includes(t.id)} onChange={this.handleChange(t)} />,
              // @ts-ignore
              title: (
                <StyledAllCheckbox
                  checked={selectAll}
                  indeterminate={!selectAll && selected.length > 0}
                  onChange={this.handleAllChange}
                />
              ),
              // @ts-ignore
              accessor: 'id'
            },
            // @ts-ignore
            { accessor: 'name' },
            // @ts-ignore
            { accessor: 'type' },
            // @ts-ignore
            { accessor: 'category' }
          ]}
        />
      </StyledWrapper>
    )
  }
}

const StyledWrapper = styled.div`
  min-height: 400px;
  background-color: ${white};
  border: 1px solid ${grey};
  border-top: none;
  border-radius: 4px;
`

const StyledCheckbox = styled(Checkbox)`
  &&& {
    display: block;
    margin-left: 6px;
  }
`
const StyledAllCheckbox = styled(Checkbox)`
  &&& {
    display: block;
    margin: 0;
  }
`

export default TradeDocumentsList
