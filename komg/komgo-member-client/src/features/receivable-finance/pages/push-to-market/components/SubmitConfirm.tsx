import * as React from 'react'
import { Modal, Button } from 'semantic-ui-react'
import { LoadingTransition, ErrorMessage } from '../../../../../components'
import { stringOrUndefined } from '../../../../../utils/types'
import { Counterparty } from '../../../../counterparties/store/types'
import styled from 'styled-components'

export interface ISubmitConfirmProps {
  counterparties: Counterparty[]
  open: boolean
  isSubmitting: boolean
  error: stringOrUndefined
  submit(): void
  cancelSubmit(): void
}

const SubmitConfirm: React.FC<ISubmitConfirmProps> = (props: ISubmitConfirmProps) => {
  const { open, submit, cancelSubmit, isSubmitting, error, counterparties } = props
  const renderContent = () => {
    if (error) {
      return <ErrorMessage title="Trade Submission Error" error={error} />
    } else if (isSubmitting) {
      return <LoadingTransition title="Pushing to market" marginTop="0" />
    } else {
      const counterpartyNames = counterparties.map(counterparty => (
        <li key={counterparty.staticId}>{counterparty.x500Name.CN}</li>
      ))
      return (
        <div>
          <p>You are about to send a request for proposal to the following counterparties</p>
          <StyledList>{counterpartyNames}</StyledList>
        </div>
      )
    }
  }
  return (
    <Modal size="tiny" open={open}>
      <Modal.Header>Push to market</Modal.Header>
      <Modal.Content>{renderContent()}</Modal.Content>
      <Modal.Actions>
        <Button
          data-test-id="button-push-to-market-cancel"
          onClick={cancelSubmit}
          content="Cancel"
          disabled={isSubmitting}
        />
        <Button
          data-test-id="button-push-to-market-confirm"
          primary={true}
          onClick={submit}
          content="Send"
          disabled={isSubmitting}
        />
      </Modal.Actions>
    </Modal>
  )
}

const StyledList = styled.ul`
  margin-left: 20px;
  padding: 0px;
`

export default SubmitConfirm
