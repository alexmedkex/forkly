import React from 'react'
import { Modal, Button } from 'semantic-ui-react'
import styled from 'styled-components'
import { blueGrey } from '../../../../styles/colors'

export interface IViewCommentModalProps {
  open: boolean
  commentText: string
  date: string
  bankName: string
  handleClosed: () => void
}

const ViewCommentModal: React.FC<IViewCommentModalProps> = ({ commentText, date, bankName, handleClosed, open }) => (
  <Modal size="large" open={open}>
    <Modal.Header>Comment history</Modal.Header>
    <Modal.Content>
      <BankName>{bankName}</BankName>
      <Date>{date}</Date>
      <CommentBody>{commentText}</CommentBody>
    </Modal.Content>
    <Modal.Actions>
      <Button data-test-id="close-comments" onClick={handleClosed} content="Close" primary={true} />
    </Modal.Actions>
  </Modal>
)

const BankName = styled.b``
const Date = styled.p`
  color: ${blueGrey};
  font-size: 13px;
`
const CommentBody = styled.p``

export default ViewCommentModal
