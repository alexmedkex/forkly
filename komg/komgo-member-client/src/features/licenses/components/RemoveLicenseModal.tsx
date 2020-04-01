import { Button, Confirm } from 'semantic-ui-react'
import * as React from 'react'

export const RemoveLicenseModal = props => {
  const { updatingLicense, onClose, removeLicense } = props
  const getContent = () => (
    <div className="content">
      You are about to remove access of{' '}
      <strong>{`${updatingLicense.productId} (${updatingLicense.productName})`}</strong> to{' '}
      <strong>{updatingLicense.memberName}</strong>.<br />All users associated with this counterparty will not be able
      to use it anymore.
    </div>
  )
  return (
    <Confirm
      open={true}
      header="Are you sure to remove this license?"
      content={getContent()}
      onCancel={onClose}
      onConfirm={removeLicense}
      confirmButton={<Button negative={true} content="Remove license" />}
    />
  )
}
