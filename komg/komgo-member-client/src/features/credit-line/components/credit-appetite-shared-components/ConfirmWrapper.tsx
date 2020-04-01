import * as React from 'react'
import { Confirm, Button } from 'semantic-ui-react'
import { ServerError } from '../../../../store/common/types'
import { ErrorMessage, LoadingTransition } from '../../../../components'

interface IProps {
  isSubmitting: boolean
  submittingErrors: ServerError[]
  header: string
  children: React.ReactElement
  action?: ConfirmAction
  handleClose(): void
  handleConfirm(): void
}

export enum ConfirmAction {
  Submit = 'submit',
  Remove = 'remove',
  Decline = 'decline'
}

const LOADER_TITLE = {
  [ConfirmAction.Submit]: 'Submitting',
  [ConfirmAction.Remove]: 'Removing',
  [ConfirmAction.Decline]: 'Declining'
}

const CONFIRM_TEXT = {
  [ConfirmAction.Submit]: 'Confirm',
  [ConfirmAction.Remove]: 'Remove',
  [ConfirmAction.Decline]: 'Decline'
}

const ConfirmWrapper: React.FC<IProps> = (props: IProps) => {
  const { handleClose, handleConfirm, isSubmitting, submittingErrors, header } = props
  const [error] = submittingErrors
  const action = props.action || ConfirmAction.Submit
  const getContent = () => {
    if (isSubmitting) {
      return <LoadingTransition title={LOADER_TITLE[action]} marginTop="15px" />
    }
    if (error) {
      return <ErrorMessage title="Error" error={error.message} />
    }
    return props.children
  }

  return (
    <Confirm
      open={true}
      header={header}
      content={<div className="content">{getContent()}</div>}
      onCancel={handleClose}
      onConfirm={handleConfirm}
      cancelButton={
        <Button disabled={isSubmitting} data-test-id={`${action}-modal-cancel`}>
          Cancel
        </Button>
      }
      confirmButton={
        <Button
          disabled={isSubmitting}
          data-test-id={`${action}-modal-cancel`}
          negative={action === ConfirmAction.Remove || action === ConfirmAction.Decline}
          primary={action === ConfirmAction.Submit}
        >
          {CONFIRM_TEXT[action]}
        </Button>
      }
    />
  )
}

export default ConfirmWrapper
