import * as React from 'react'
import { FormikContext, connect } from 'formik'
import { LetterOfCreditValues, ILetterOfCreditTemplate } from '../constants'
import { CreateLetterOfCreditPayload } from '../utils/createAndGetLetterOfCredit'
import { LCDocumentOrErrorOrLoading } from './documents/LCDocumentOrErrorOrLoading'
import { AxiosResponse } from 'axios'

// MM - templateId is hardcoded as needs passed, but the process is being changed, so this will be removed/updated once that work is done.
export const DEFAULT_TEMPLATE = '4c88f238-dd3d-11e8-9f8b-f2801f1b9fd1' // migration version

export interface CreateAndReviewStepOwnProps {
  createAndGetDocument: (payload: CreateLetterOfCreditPayload) => Promise<AxiosResponse>
  buildLetterOfCreditFields: (values: LetterOfCreditValues) => ILetterOfCreditTemplate
}

export type CreateAndReviewStepProps = CreateAndReviewStepOwnProps & {
  formik: FormikContext<LetterOfCreditValues>
}

export interface ReviewStepState {
  document: string | undefined
  error: string | undefined
}

export class CreateAndReviewStep extends React.Component<CreateAndReviewStepProps, ReviewStepState> {
  async componentDidMount() {
    const { formik } = this.props
    const payload: CreateLetterOfCreditPayload = {
      templateId: DEFAULT_TEMPLATE,
      fields: this.props.buildLetterOfCreditFields(formik.values)
    }
    try {
      const { data } = await this.props.createAndGetDocument(payload)
      const encoded: string = Buffer.from(new Uint8Array(data)).toString('base64')
      this.setState({ document: encoded }, () => {
        formik.setFieldValue('generatedPDF', encoded)
      })
    } catch (err) {
      this.setState({ error: err.message })
    }
  }

  public render() {
    return <LCDocumentOrErrorOrLoading {...this.state} />
  }
}

export default connect<CreateAndReviewStepOwnProps, LetterOfCreditValues>(CreateAndReviewStep)
