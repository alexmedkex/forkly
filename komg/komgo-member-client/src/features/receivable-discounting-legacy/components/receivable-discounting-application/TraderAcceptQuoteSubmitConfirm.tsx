import * as React from 'react'
import { Modal, Button } from 'semantic-ui-react'
import { LoadingTransition, ErrorMessage } from '../../../../components'
import { stringOrUndefined } from '../../../../utils/types'

export interface ITraderAcceptQuoteSubmitConfirmProps {
  open: boolean
  isSubmitting: boolean
  error: stringOrUndefined
  loadingText: string
  actionText: JSX.Element
  buttonText: string
  title: string
  cancelSubmit(): void
  confirmSubmit(): void
}

const TraderAcceptQuoteSubmitConfirm: React.FC<ITraderAcceptQuoteSubmitConfirmProps> = (
  props: ITraderAcceptQuoteSubmitConfirmProps
) => {
  const { open, cancelSubmit, isSubmitting, error, loadingText, confirmSubmit, title, actionText, buttonText } = props
  const renderContent = () => {
    if (error) {
      return <ErrorMessage title="Trade Submission Error" error={error} />
    } else if (isSubmitting) {
      return <LoadingTransition title={loadingText} marginTop="0" />
    }
    return <div>{actionText}</div>
  }

  return (
    <Modal size="small" open={open}>
      <Modal.Header>{title}</Modal.Header>
      <Modal.Content>{renderContent()}</Modal.Content>
      <Modal.Actions>
        <Button onClick={cancelSubmit} content="Cancel" disabled={isSubmitting} />
        <Button
          data-test-id="accept-quote-confirm-submit"
          primary={true}
          onClick={confirmSubmit}
          content={buttonText}
          disabled={isSubmitting}
        />
      </Modal.Actions>
    </Modal>
  )
}

export default TraderAcceptQuoteSubmitConfirm
