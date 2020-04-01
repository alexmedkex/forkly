import * as React from 'react'
import { Button, Modal, Header } from 'semantic-ui-react'

interface Props {
  open: boolean
  email: string
  closeModal(): void
}

export const ProductLicenseModal: React.SFC<Props> = ({ open, email, closeModal }: Props) => (
  <Modal size={'small'} open={open} onClose={closeModal}>
    <Modal.Header>
      <Header>More info has been requested</Header>
    </Modal.Header>
    <Modal.Content>
      <span>
        Thank you for the interest you put on this product!<br />
        The komgo team will write you on <strong>[{email}]</strong>
      </span>
    </Modal.Content>
    <Modal.Actions>
      <Button primary={true} onClick={closeModal} content="Close" />
    </Modal.Actions>
  </Modal>
)

export default ProductLicenseModal
