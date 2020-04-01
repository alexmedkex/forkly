import * as React from 'react'
import { Confirm } from 'semantic-ui-react'
import { ILCPresentation } from '../../types/ILCPresentation'
import { LoadingTransition, ErrorMessage } from '../../../../components'
import { ServerError } from '../../../../store/common/types'
import { Document } from '../../../document-management/store/types'

interface IProps {
  presentation?: ILCPresentation
  open: boolean
  isDeleting: boolean
  deletingError: ServerError[]
  document?: Document
  removePresenation(): void
  close(): void
  deleteDocument(): void
}

const ConfirmDelete: React.FC<IProps> = (props: IProps) => {
  const { presentation, open, isDeleting, removePresenation, close, deletingError, document, deleteDocument } = props
  const getMessage = () => {
    if (document) {
      return 'Are you sure you want to delete document?'
    } else {
      let message = `Are you sure you want to remove presentation?`
      if (presentation.documents && presentation.documents.length) {
        message += ' All documents will be deleted also!'
      }
      return message
    }
  }
  const getAction = () => {
    if (document) {
      return deleteDocument
    }
    return removePresenation
  }

  if (!open || !presentation) {
    return null
  }

  const message = getMessage()

  return (
    <Confirm
      open={open}
      header={document ? 'Remove document' : 'Remove presentation'}
      content={
        <div className="content">
          {deletingError && deletingError.length > 0 ? (
            <ErrorMessage title="Error" error={deletingError[0].message} />
          ) : isDeleting ? (
            <LoadingTransition title="Deleting" marginTop="15px" />
          ) : (
            message
          )}
        </div>
      }
      onCancel={close}
      onConfirm={getAction()}
    />
  )
}

export default ConfirmDelete
