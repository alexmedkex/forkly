import * as React from 'react'
import { Modal, Button } from 'semantic-ui-react'

interface Props {
  companyName: string
  companyId: string
  readonly: boolean
  actionCallback(status: boolean): void
  handleResponseOnRequest(companyId: string, accept: boolean): void
}

const RequestCounterpartyModal: React.SFC<Props> = (props: Props) => {
  const { companyName, companyId, handleResponseOnRequest, actionCallback } = props
  return (
    <>
      <Modal.Header>Connection request</Modal.Header>
      <Modal.Content>
        <b>{companyName}</b> has sent you a connection request
      </Modal.Content>
      <Modal.Actions>
        <Button style={{ float: !props.readonly ? 'left' : 'none' }} onClick={() => actionCallback(false)}>
          Cancel
        </Button>
        {!props.readonly && (
          <>
            <Button onClick={() => handleResponseOnRequest(companyId, false)}>Deny</Button>
            <Button onClick={() => handleResponseOnRequest(companyId, true)} primary={true}>
              Accept
            </Button>
          </>
        )}
      </Modal.Actions>
    </>
  )
}

export default RequestCounterpartyModal
