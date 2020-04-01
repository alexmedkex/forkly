import * as React from 'react'
import { Modal } from 'semantic-ui-react'
import { LoadingTransition } from '../../../../components/loading-transition'
import { ErrorMessage } from '../../../../components/error-message'
import { Button } from 'semantic-ui-react'
import { ServerError } from '../../../../store/common/types'
import { ReactNode } from 'react-redux'

export interface ConfirmModalProps {
  negative?: boolean
  errors: ServerError[]
  isSubmitting: boolean
  title: string
  children: ReactNode
  formId?: string
  open: boolean
  onCancel: () => any
  onSubmit?: () => any
}

export const Confirm: React.FC<ConfirmModalProps> = (props: ConfirmModalProps) => {
  const { errors, isSubmitting, open, onCancel, onSubmit, title, children, formId, negative } = props
  const [error] = errors

  return (
    <Modal size="small" open={open}>
      <Modal.Header>{title}</Modal.Header>
      <Modal.Content>
        {isSubmitting ? (
          <LoadingTransition title="Submitting..." marginTop="0" />
        ) : error ? (
          <ErrorMessage title={title} error={error} />
        ) : (
          children
        )}
      </Modal.Content>
      <Modal.Actions>
        <Button data-test-id="submit-cancel-button" onClick={onCancel} content="Cancel" disabled={isSubmitting} />
        <Button
          data-test-id="submit-confirm-button"
          type="submit"
          negative={negative}
          primary={!negative}
          onClick={onSubmit}
          content="Confirm"
          form={formId}
          disabled={isSubmitting}
        />
      </Modal.Actions>
    </Modal>
  )
}
