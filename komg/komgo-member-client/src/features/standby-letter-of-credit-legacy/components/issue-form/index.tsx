import * as React from 'react'
import { Formik, FormikProps, Field } from 'formik'
import { IStandbyLetterOfCredit, StandbyLetterOfCreditTaskType } from '@komgo/types'
import { Form, Divider } from 'semantic-ui-react'
import FormikEffect from '../formik-effect'
import { enumToRadioOptions, GridTextController } from '../../../letter-of-credit-legacy/components'
import { SimpleRadioController } from '../../../letter-of-credit-legacy/components/InputControllers/SimpleRadioController'
import { FieldStyling } from '../../../trades/components/trade-form-fields/TradeData'
import { FileUpload } from '../../../../components/form'
import { scrollTo } from '../../utils/scrollTo'

export interface IssueFormValues {
  standbyLetterOfCredit: IStandbyLetterOfCredit
  reviewDecision: ReviewDecision
  rejectionReference?: string
  document?: File
}

export enum ReviewDecision {
  ApproveApplication = 'ApproveApplication',
  RejectApplication = 'RejectApplication'
}

export interface IssueFormProps {
  standbyLetterOfCredit: IStandbyLetterOfCredit
  onChange: (values: IssueFormValues) => void
  beneficiaryIsMember: boolean
  taskType: StandbyLetterOfCreditTaskType
}

export const IssueForm: React.FC<IssueFormProps> = ({
  standbyLetterOfCredit,
  onChange,
  beneficiaryIsMember,
  taskType
}) =>
  taskType === StandbyLetterOfCreditTaskType.ReviewRequested && (
    <>
      <Divider />
      <Formik
        onSubmit={(values, actions) => {
          actions.setSubmitting(false)
        }}
        initialValues={
          {
            standbyLetterOfCredit,
            reviewDecision: ReviewDecision.ApproveApplication,
            document: null,
            rejectionReference: ''
          } as IssueFormValues
        }
        render={({ values, handleSubmit, setFieldValue }: FormikProps<IssueFormValues>) => (
          <Form onSubmit={handleSubmit} id="create-standby-letter-of-credit">
            <FormikEffect
              onChange={(values: IssueFormValues) => {
                return onChange && onChange(values)
              }}
            />
            <Divider hidden={true} />
            <Field
              name="reviewDecision"
              fieldName="Application decision"
              options={enumToRadioOptions(ReviewDecision)}
              component={SimpleRadioController}
            />

            <Field
              name={
                values.reviewDecision === ReviewDecision.ApproveApplication
                  ? 'standbyLetterOfCredit.issuingBankReference'
                  : 'rejectionReference'
              }
              fieldName="Internal reference"
              onFocus={() => {
                values.reviewDecision === ReviewDecision.ApproveApplication && scrollTo('preview_issuingBankReference')
              }}
              customStyle={{ width: '100%' }}
              fieldStyle={FieldStyling}
              component={GridTextController}
            />
            <div style={{ fontSize: 'small', lineHeight: '0px', paddingBottom: '20px' }}>
              The reference from your internal banking system
            </div>

            {values.reviewDecision === ReviewDecision.ApproveApplication && (
              <>
                {!beneficiaryIsMember && (
                  <FileUpload
                    file={values.document}
                    name="issuanceDocument"
                    accept=""
                    label="SBLC issuance document"
                    uploadFileText="Upload file"
                    onChange={(_, document) => setFieldValue('document', document)}
                    description="Upload the issuance document (generated off-platform). This will be shared with all parties to the application."
                  />
                )}
                <Field
                  name="standbyLetterOfCredit.issuingBankPostalAddress"
                  fieldName="Postal address"
                  onFocus={() => scrollTo('preview_issuingBankPostalAddress')}
                  customStyle={{ width: '100%' }}
                  fieldStyle={FieldStyling}
                  type="textarea"
                  component={GridTextController}
                />
              </>
            )}
          </Form>
        )}
      />
    </>
  )
