import * as React from 'react'
import { Form, Grid } from 'semantic-ui-react'
import EvaluationInfoTable from './EvaluationInfoTable'
import { ReviewStatus } from '../../store/types'
import { CharactersCounter } from '../../../../components/characters-counter/CharactersCounter'
import styled from 'styled-components'

interface Props {
  type: string
  title: string
  expiry: Date
  metadata: string[]
  reviewStatus: string
  reviewComment: string
  comment?: string
  parcelId?: string
  onReviewDocument(option: string): void
  onCommentRejectedDocument(comment: string): void
}

enum Option {
  APPROVE = 1,
  REFUSE = 0
}

const MAX_REJECTION_MSG_LENGTH = 300

class EvaluationInfoPanel extends React.Component<Props> {
  state = { activeApprove: false, activeRefuse: false }

  constructor(props: Props) {
    super(props)
    this.setState({
      activeApprove: props.reviewStatus === ReviewStatus.ACCEPTED,
      activeRefuse: props.reviewStatus === ReviewStatus.REJECTED
    })
  }

  handleClick = (opt: Option) => {
    if (opt === Option.APPROVE) {
      this.setState({
        activeApprove: true,
        activeRefuse: false
      })
      this.props.onReviewDocument(ReviewStatus.ACCEPTED)
      this.props.onCommentRejectedDocument('')
    } else if (opt === Option.REFUSE) {
      this.setState({
        activeApprove: false,
        activeRefuse: true
      })
      this.props.onReviewDocument(ReviewStatus.REJECTED)
    }
  }

  handleUpdateComment = (event: React.SyntheticEvent, data: any) => {
    this.props.onCommentRejectedDocument(data.value)
  }

  render() {
    return (
      <>
        <Grid.Row>
          <EvaluationInfoTable
            type={this.props.type}
            title={this.props.title}
            expiry={this.props.expiry}
            metadata={this.props.metadata}
            comment={this.props.comment}
            parcelId={this.props.parcelId}
          />
        </Grid.Row>

        <Form style={{ marginTop: '25px' }}>
          <Form.Group widths="equal">
            <StyledRejectButton
              fluid={true}
              toggle={true}
              active={this.props.reviewStatus === ReviewStatus.REJECTED}
              onClick={() => this.handleClick(Option.REFUSE)}
              data-test-id="review-document-refuse-button"
              id="review-document-reject-button"
            >
              Reject
            </StyledRejectButton>
            <Form.Button
              fluid={true}
              toggle={true}
              active={this.props.reviewStatus === ReviewStatus.ACCEPTED}
              onClick={() => this.handleClick(Option.APPROVE)}
              data-test-id="review-document-approve-button"
              id="review-document-approve-button"
            >
              Approve
            </Form.Button>
          </Form.Group>
          <Form.TextArea
            placeholder="Add a comment (optional)"
            hidden={this.props.reviewStatus !== ReviewStatus.REJECTED}
            onChange={this.handleUpdateComment}
            value={this.props.reviewComment}
            maxLength={MAX_REJECTION_MSG_LENGTH}
            style={{ minHeight: '136px' }}
            data-test-id="review-document-comment"
          />
          <CharactersCounter
            hidden={this.props.reviewStatus !== ReviewStatus.REJECTED}
            counter={this.props.reviewComment ? this.props.reviewComment.length : 0}
            maxChars={MAX_REJECTION_MSG_LENGTH}
          />
        </Form>
      </>
    )
  }
}

const StyledRejectButton = styled(Form.Button)`
  &&&& #review-document-reject-button.active {
    background-color: #d45c64 !important;
  }
`

export default EvaluationInfoPanel
