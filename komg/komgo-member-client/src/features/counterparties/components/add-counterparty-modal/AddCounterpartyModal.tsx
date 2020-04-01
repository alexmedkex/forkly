import * as React from 'react'
import { Modal, Search, SearchProps, Button, Checkbox, Loader, Popup } from 'semantic-ui-react'
import styled from 'styled-components'
import { NotConnectedCounterparty, CouneterpartyStatus } from '../../store/types'
import { stringOrUndefined, stringOrNull } from '../../../../utils/types'
import { ErrorMessage, LoadingTransition } from '../../../../components'

interface Props {
  open: boolean
  counterparties: NotConnectedCounterparty[]
  addCounterparties: string[]
  fetching: boolean
  error: stringOrNull
  value: string
  setAddCounterparties(ids: string[]): void
  handleSearch(event: React.MouseEvent<HTMLElement>, data: SearchProps): void
  handleModalOpen(addModalOpen: boolean): void
  handleAddNewCounterparties(checkedCounterparties: string[]): void
}

class AddCounterpartyModal extends React.Component<Props> {
  handleCheckboxClick = (counterparty: NotConnectedCounterparty): void => {
    const { addCounterparties } = this.props
    if (addCounterparties.indexOf(counterparty.staticId) === -1) {
      this.props.setAddCounterparties([...addCounterparties, counterparty.staticId])
    } else {
      this.props.setAddCounterparties(addCounterparties.filter(id => id !== counterparty.staticId))
    }
  }

  isCheckboxDisabled = (status: stringOrUndefined): boolean => {
    return status === CouneterpartyStatus.PENDING || status === CouneterpartyStatus.WAITING
  }

  renderModalContent(): React.ReactNode {
    const { counterparties, fetching, error } = this.props
    if (fetching) {
      return <StyledLoader title="Loading counterparties" />
    }
    if (error !== null) {
      return <ErrorMessage title="Unable to load counterparties" error={error} />
    }
    if (counterparties.length === 0) {
      return <NotFoundText className="disabled">No counterparties found</NotFoundText>
    }
    return (
      <React.Fragment>
        {counterparties.map(counterparty => (
          <div key={counterparty.staticId}>
            <Checkbox
              onClick={() => this.handleCheckboxClick(counterparty)}
              label={
                <Popup
                  wide="very"
                  trigger={<StyledName>{counterparty.x500Name.O}</StyledName>}
                  content={counterparty.x500Name.O}
                />
              }
              checked={this.props.addCounterparties.indexOf(counterparty.staticId) !== -1}
              disabled={this.isCheckboxDisabled(counterparty.status)}
            />
            {counterparty.status === CouneterpartyStatus.PENDING && (
              <RequestPending className="disabled">Request pending</RequestPending>
            )}
            {counterparty.status === CouneterpartyStatus.WAITING && (
              <RequestPending className="disabled">Action Required</RequestPending>
            )}
          </div>
        ))}
      </React.Fragment>
    )
  }

  render() {
    const { open, handleModalOpen, handleSearch, handleAddNewCounterparties, addCounterparties, value } = this.props
    return (
      <Modal
        open={open}
        closeOnEscape={true}
        closeOnDimmerClick={true}
        onClose={() => handleModalOpen(false)}
        style={{ top: '10vh' }}
      >
        <Modal.Header>Add counterparty</Modal.Header>
        <Modal.Content>
          <StyledSearch>
            <Search
              onSearchChange={handleSearch}
              open={false}
              input={{ icon: 'search', iconPosition: 'left' }}
              placeholder="Search counterparties"
              value={value}
            />
          </StyledSearch>
          <ModelContent>{this.renderModalContent()}</ModelContent>
        </Modal.Content>
        <Modal.Actions>
          <Button content="Cancel" onClick={() => handleModalOpen(false)} />
          <Button
            content="Send request"
            primary={true}
            onClick={() => handleAddNewCounterparties(addCounterparties)}
            disabled={addCounterparties.length === 0}
          />
        </Modal.Actions>
      </Modal>
    )
  }
}

const StyledSearch = styled.div`
  text-align: center;
  margin-bottom: 30px;
  .input {
    width: 100%;
  }
`

const StyledName = styled.label`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  width: 300px;
  height: 18px;
`

const RequestPending = styled.span`
  float: right;
`

const NotFoundText = styled.div`
  text-align: center;
  padding: 50px 0;
`

const ModelContent = styled.div`
  min-height: 120px;
  max-height: 40vh;
  overflow-y: auto;
`

export const StyledLoader: any = styled(LoadingTransition)`
  margin-top: 100px;
`

export default AddCounterpartyModal
