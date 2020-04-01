import * as React from 'react'
import { Modal, Button } from 'semantic-ui-react'

interface Props {
  companyName: string
  companyId: string
  readonly: boolean
  actionCallback(status: boolean): void
  handleResponseOnRequest(companyId: string): void
}

const ResendCounterpartyModal: React.SFC<Props> = (props: Props) => {
  const { companyName, companyId, handleResponseOnRequest, actionCallback } = props
  return (
    <React.Fragment>
      <Modal.Header>Resend counterparty request</Modal.Header>
      <Modal.Content>
        Resend counterparty request to <b>{companyName}</b>
      </Modal.Content>
      <Modal.Actions>
        {!props.readonly && (
          <>
            <Button onClick={() => actionCallback(false)}>Cancel</Button>
            <Button onClick={() => handleResponseOnRequest(companyId)} primary={true}>
              Resend
            </Button>
          </>
        )}
      </Modal.Actions>
    </React.Fragment>
  )
}

export default ResendCounterpartyModal
