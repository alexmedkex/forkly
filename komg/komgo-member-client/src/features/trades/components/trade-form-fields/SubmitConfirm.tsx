import * as React from 'react'
import { Modal, Button } from 'semantic-ui-react'
import { LoadingTransition, ErrorMessage } from '../../../../components'
import { stringOrUndefined } from '../../../../utils/types'
import { ITrade } from '@komgo/types'
import { TRADING_ROLE_OPTIONS } from '../../constants'
import { ITradeBase } from '@komgo/types'

interface IProps {
  open: boolean
  isSubmitting: boolean
  isUploadingDocs: boolean
  error: stringOrUndefined
  trade: ITradeBase
  tradeId: stringOrUndefined
  role: string
  submit(): void
  cancelSubmit(): void
}

const SubmitConfirm: React.FC<IProps> = (props: IProps) => {
  const { open, submit, cancelSubmit, isSubmitting, isUploadingDocs, error, tradeId, trade, role } = props
  const renderContent = () => {
    if (error) {
      return <ErrorMessage title="Trade Submission Error" error={error} />
    } else if (isSubmitting) {
      return isUploadingDocs ? (
        <LoadingTransition title="Uploading documents, please wait..." marginTop="0" />
      ) : (
        <LoadingTransition title={tradeId ? 'Updating trade' : 'Creating trade'} marginTop="0" />
      )
    }
    return (
      <div>
        {tradeId
          ? `You are about to update trade ${
              role === TRADING_ROLE_OPTIONS.SELLER ? trade.sellerEtrmId : trade.buyerEtrmId
            }.`
          : `You are about to create a new trade.`}
      </div>
    )
  }
  return (
    <Modal size="tiny" open={open}>
      <Modal.Header>{tradeId ? 'Update Trade' : 'Create Trade'}</Modal.Header>
      <Modal.Content>{renderContent()}</Modal.Content>
      <Modal.Actions>
        <Button onClick={cancelSubmit} content="Cancel" disabled={isSubmitting} />
        <Button
          data-test-id="submit-trade-form"
          primary={true}
          onClick={submit}
          content={tradeId ? 'Update trade' : 'Create trade'}
          disabled={isSubmitting}
        />
      </Modal.Actions>
    </Modal>
  )
}

export default SubmitConfirm
