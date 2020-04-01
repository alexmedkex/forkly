import * as React from 'react'
import { Modal, Button, Form, Radio, CheckboxProps, TextArea, TextAreaProps } from 'semantic-ui-react'
import { LoadingTransition } from '../../../../components'

interface IProps {
  isSubmittingResponse: boolean
  close(): void
  submit(response: Response, comment: string): void
}

export enum Response {
  Accept = 'Accept',
  Reject = 'Reject'
}

interface IState {
  response: Response
  comment: string
}

class ReviewRequestedDiscrepanciesForm extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      response: Response.Accept,
      comment: ''
    }
  }

  setResponse = (_: React.FormEvent<HTMLInputElement>, data: CheckboxProps) => {
    this.setState({
      response: data.value as Response
    })
  }

  setComment = (_: React.FormEvent<HTMLTextAreaElement>, data: TextAreaProps) => {
    this.setState({
      comment: data.value as string
    })
  }

  submitResponse = () => {
    this.props.submit(this.state.response, this.state.comment)
  }

  render() {
    const { close, isSubmittingResponse } = this.props
    const { response, comment } = this.state
    return (
      <React.Fragment>
        <Modal.Content>
          {isSubmittingResponse ? (
            <LoadingTransition title="Submitting" marginTop="30px" />
          ) : (
            <Form>
              <Form.Field>
                <Radio
                  label={Response.Accept}
                  name="response"
                  value={Response.Accept}
                  checked={response === Response.Accept}
                  onChange={this.setResponse}
                  data-test-id="response-accept"
                />
              </Form.Field>
              <Form.Field>
                <Radio
                  label={Response.Reject}
                  name="response"
                  value={Response.Reject}
                  checked={response === Response.Reject}
                  onChange={this.setResponse}
                  data-test-id="response-reject"
                />
              </Form.Field>
              <Form.Field>
                <TextArea
                  name="comment"
                  id="comment"
                  value={comment}
                  onChange={this.setComment}
                  data-test-id="comment"
                />
              </Form.Field>
            </Form>
          )}
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={close} disabled={isSubmittingResponse} data-test-id="cancel">
            Cancel
          </Button>
          <Button primary={true} onClick={this.submitResponse} disabled={isSubmittingResponse} data-test-id="submit">
            Submit
          </Button>
        </Modal.Actions>
      </React.Fragment>
    )
  }
}

export default ReviewRequestedDiscrepanciesForm
