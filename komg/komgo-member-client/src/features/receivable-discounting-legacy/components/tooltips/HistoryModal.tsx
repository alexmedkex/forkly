import React from 'react'
import { Button } from 'semantic-ui-react'
import styled from 'styled-components'
import { blueGrey, grey } from '../../../../styles/colors'
import { Text } from '../../../../components'
import { IHistoryChange } from '@komgo/types'
import { displayDateAndTime } from '../../../../utils/date'
import { ModalPrompt, ModalSize } from '../../../../components/modal-prompt/ModalPrompt'

export interface IHistoryModalProps<T = any> {
  header: string
  buttonText: string
  historyChange: Array<IHistoryChange<T>>
}

interface IHistoryModalState {
  modalOpen: boolean
}

export class HistoryModal extends React.Component<IHistoryModalProps, IHistoryModalState> {
  state = {
    modalOpen: false
  }

  handleModal() {
    this.setState({
      modalOpen: !this.state.modalOpen
    })
  }

  render() {
    const { header, historyChange, buttonText } = this.props
    const { modalOpen } = this.state

    return (
      <>
        <ButtonWrapper>
          <Button
            content={buttonText}
            onClick={() => this.handleModal()}
            data-test-id="open-other-information-history"
          />
        </ButtonWrapper>

        <ModalPrompt
          header={header}
          open={modalOpen}
          loading={false}
          actions={
            <Button
              data-test-id="close-other-information-history"
              onClick={() => this.handleModal()}
              content="Close"
              primary={true}
            />
          }
          size={ModalSize.Large}
          data-test-id="other-information-history-modal"
        >
          {historyChange.map((change, index) => (
            <ItemWrapper key={index}>
              <Date data-test-id={`history-date-${index}`}>{displayDateAndTime(change.updatedAt)}</Date>
              <Text data-test-id={`history-text-${index}`} fontSize={'14px'}>
                {change.value}
              </Text>
            </ItemWrapper>
          ))}
        </ModalPrompt>
      </>
    )
  }
}

const Date = styled.p`
  color: ${blueGrey};
  font-size: 14px;
`

const ButtonWrapper = styled.div`
  margin-left: 240px;
`

const ItemWrapper = styled.div`
  padding-bottom: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid ${grey};
  :last-child {
    border-bottom: none;
  }
`
