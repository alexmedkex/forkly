import { Button, Confirm } from 'semantic-ui-react'
import * as React from 'react'

export const AddLicenseModal = props => {
  const { updatingLicense, onClose, submitLicense } = props
  const getContent = () => (
    <div className="content">
      You are about to give access of <strong>{`${updatingLicense.productId} (${updatingLicense.productName})`}</strong>{' '}
      to <strong>{updatingLicense.memberName}</strong>.<br />All users associated with this counterparty will now be
      able to use it.
    </div>
  )
  return (
    <Confirm
      open={true}
      header="Provide a new license"
      content={getContent()}
      onCancel={onClose}
      onConfirm={submitLicense}
      confirmButton={<Button primary={true} content="Submit license" />}
    />
  )
}
