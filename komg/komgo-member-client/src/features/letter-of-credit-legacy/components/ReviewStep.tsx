import * as React from 'react'
import { ILetterOfCredit } from '../types/ILetterOfCredit'
import { GetLetterOfCreditPayload } from '../utils/createAndGetLetterOfCredit'
import { LCDocumentOrErrorOrLoading } from './documents/LCDocumentOrErrorOrLoading'
import { AxiosResponse } from 'axios'

export interface ReviewStepProps {
  letterOfCredit: ILetterOfCredit
  getDocument: (payload: GetLetterOfCreditPayload) => Promise<AxiosResponse>
}

export interface ReviewStepState {
  document: string | undefined
  error: string | undefined
}

export class ReviewStep extends React.Component<ReviewStepProps, ReviewStepState> {
  async componentDidMount() {
    const { letterOfCredit } = this.props

    if (letterOfCredit.reference) {
      const payload: GetLetterOfCreditPayload = { id: letterOfCredit._id! }
      try {
        const { data } = await this.props.getDocument(payload)
        this.setState({
          document: Buffer.from(new Uint8Array(data)).toString('base64')
        })
      } catch (err) {
        this.setState({ error: err.message })
      }
    } else {
      this.setState({ error: 'A letter of credit with a valid reference was not provided' })
    }
  }

  public render() {
    return <LCDocumentOrErrorOrLoading {...this.state} />
  }
}

export default ReviewStep
