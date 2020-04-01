import * as React from 'react'
import { Modal, Button } from 'semantic-ui-react'
import { LoadingTransition, ErrorMessage } from '../../../../components'
import { stringOrUndefined } from '../../../../utils/types'

interface ISubmitConfirmProps {
  open: boolean
  isSubmitting: boolean
  error: stringOrUndefined
  title: string
  actionText: string
  cancelSubmit(): void
}

const SubmitStatus: React.FC<ISubmitConfirmProps> = (props: ISubmitConfirmProps) => {
  const { open, cancelSubmit, isSubmitting, error, title, actionText } = props

  const renderContent = () => {
    if (error) {
      return <ErrorMessage title="Submission Error" error={error} />
    }

    return <LoadingTransition title={actionText} marginTop="0" />
  }

  return (
    <Modal size="tiny" open={open}>
      <Modal.Header>{actionText}</Modal.Header>
      <Modal.Content>{renderContent()}</Modal.Content>
      <Modal.Actions>
        <Button onClick={cancelSubmit} data-test-id="cancel-button" content="Cancel" disabled={isSubmitting} />
      </Modal.Actions>
    </Modal>
  )
}

export default SubmitStatus
