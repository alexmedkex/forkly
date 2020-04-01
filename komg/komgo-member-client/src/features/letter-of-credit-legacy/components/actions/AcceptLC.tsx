import * as React from 'react'
import { Confirm, Button } from 'semantic-ui-react'
import styled from 'styled-components'
import { ActionType } from '../../store/types'
import { ACTION_STATUS, ACTION_NAME } from '../../constants'
import { ILetterOfCredit } from '../../types/ILetterOfCredit'
import { LoadingTransition } from '../../../../components'
interface IProps {
  show: boolean
  letterOfCredit: ILetterOfCredit
  handleToggleAcceptModal: () => void
  handleAcceptLC: () => void
  actions: ActionType
}

class AcceptLC extends React.Component<IProps> {
  isSubmiting = () => {
    const { actions } = this.props
    return actions.name === ACTION_NAME.ACCEPT_LC && actions.status === ACTION_STATUS.PENDING
  }

  findContent(letterOfCredit: ILetterOfCredit) {
    if (this.isSubmiting()) {
      return <StyledLoader title="Accepting application" />
    }

    return (
      <div className="content">
        Are you sure you want to accept LC <b>{letterOfCredit.reference}</b> ?
      </div>
    )
  }

  render() {
    const { show, handleToggleAcceptModal, handleAcceptLC, letterOfCredit, actions } = this.props
    return (
      <Confirm
        open={show}
        header="Accept LC application"
        content={this.findContent(letterOfCredit)}
        cancelButton={<Button content="Cancel" disabled={this.isSubmiting()} />}
        confirmButton={<Button primary={true} content="Confirm" disabled={this.isSubmiting()} />}
        onCancel={() => handleToggleAcceptModal()}
        onConfirm={() => handleAcceptLC()}
      />
    )
  }
}

const StyledLoader = styled(LoadingTransition)`
  &&& {
    margin-top: 10px;
    margin-bottom: 10px;
  }
`

export default AcceptLC
