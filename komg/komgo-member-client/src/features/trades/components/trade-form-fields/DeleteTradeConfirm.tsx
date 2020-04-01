import * as React from 'react'
import { Modal, Button } from 'semantic-ui-react'
import { ErrorMessage, LoadingTransition } from '../../../../components'

interface IProps {
  open: boolean
  tradeId?: string
  error?: string
  isDeleting: boolean
  cancel(): void
  confirm(): void
}

const DeleteTradeConfirm: React.FC<IProps> = (props: IProps) => {
  const renderContent = () => {
    if (props.isDeleting) {
      return <LoadingTransition title="Deleting Trade" marginTop="0" />
    }
    if (props.error) {
      return <ErrorMessage title="Delete Trade Error" error={props.error} />
    }
    return <div>{`Are you sure you want to delete this trade?`}</div>
  }

  return (
    <Modal size="tiny" open={props.open}>
      <Modal.Header>Delete Trade</Modal.Header>
      <Modal.Content>{renderContent()}</Modal.Content>
      <Modal.Actions>
        <Button
          onClick={props.cancel}
          content="Cancel"
          disabled={props.isDeleting}
          data-test-id="cancel-delete-trade"
        />
        <Button
          primary={true}
          onClick={props.confirm}
          content="Confirm"
          disabled={props.isDeleting}
          data-test-id="confirm-delete-trade"
        />
      </Modal.Actions>
    </Modal>
  )
}

export default DeleteTradeConfirm
