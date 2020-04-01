import {
  IReceivablesDiscountingBase,
  IReceivablesDiscountingInfo,
  IHistory,
  IReceivablesDiscounting,
  RequestType
} from '@komgo/types'
import { Formik, FormikProps } from 'formik'
import React from 'react'
import { Button } from 'semantic-ui-react'
import { MinimalAccordionWrapper } from '../../../components/accordion/MinimalAccordionWrapper'
import { MultiErrorMessage } from '../../../components/error-message'
import BasicPanel from '../../trades/components/BasicPanel'
import { formikRdErrors } from '../utils/errors'
import { EditDiscountingRequestFields } from '../../receivable-finance/pages/view-request/components/EditDiscountingRequestFields'
import { DiscountingRequestInfo } from './panels/DiscountingRequestInfo'
import { decorateRDForInitialValues, createReceivableDiscountingEditValidator } from '../utils/edit-utils'
import { Dimensions } from '../resources/dimensions'
import { displaySimpleRequestType } from '../utils/displaySelectors'
import { FieldDataProvider, FieldDataContext } from '../presentation/FieldDataProvider'
import { rdDiscountingSchema, initialApplyForDiscountingData } from '../utils/constants'

export interface IDiscountingRequestDataProps {
  discountingRequest: IReceivablesDiscountingInfo
  index: string
  open: boolean
  isSubmitting: boolean
  isEditing: boolean
  editable: boolean
  changed: boolean
  isLoadingHistory: boolean
  history: IHistory<IReceivablesDiscounting>
  handleSubmit: (values: IReceivablesDiscountingBase) => void
  handleEditClicked: () => void
  handleCancelClicked: () => void
  handleToggleAccordion: () => void
}

export const DiscountingRequestData: React.FC<IDiscountingRequestDataProps> = ({
  index,
  discountingRequest,
  open,
  editable,
  isEditing,
  isSubmitting,
  changed,
  handleCancelClicked,
  handleEditClicked,
  handleSubmit,
  handleToggleAccordion,
  history
}) => {
  const initialValues = decorateRDForInitialValues(discountingRequest.rd)
  const actions = formik =>
    isEditing ? (
      <>
        <Button
          content={'Save'}
          data-test-id="save-discounting-request"
          primary={true}
          type="submit"
          disabled={isSubmitting}
          onClick={e => {
            e.stopPropagation()
            formik.handleSubmit(e)
          }}
        />
        <Button
          content={'Cancel'}
          data-test-id="cancel-edit-discounting-request"
          disabled={isSubmitting}
          onClick={e => {
            e.stopPropagation()
            formik.resetForm()
            handleCancelClicked()
          }}
        />
      </>
    ) : editable ? (
      <Button
        content={'Edit'}
        data-test-id="edit-discounting-request"
        onClick={e => {
          e.stopPropagation()
          handleEditClicked()
        }}
      />
    ) : null

  const title = `${displaySimpleRequestType(discountingRequest.rd.requestType)} data`

  const fieldDataProvider = new FieldDataProvider(
    rdDiscountingSchema,
    initialApplyForDiscountingData(discountingRequest.rd.requestType, discountingRequest.rd.discountingType)
  )

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validate={createReceivableDiscountingEditValidator(initialValues)}
      validateOnBlur={false}
      validateOnChange={true}
      render={(formik: FormikProps<IReceivablesDiscountingBase>) => (
        <>
          <MinimalAccordionWrapper
            data-test-id="discounting-request-accordion"
            active={open}
            handleClick={handleToggleAccordion}
            index={index}
            title={title}
            buttons={actions(formik)}
            path={'/'}
            highlight={changed || false}
          >
            {formikRdErrors(formik).length > 0 ? (
              <MultiErrorMessage
                data-test-id="edit-request-validation-errors"
                title=""
                messages={formikRdErrors(formik)}
              />
            ) : null}
            <BasicPanel padding={Dimensions.ViewRequestSectionBasicPanelPadding}>
              {isEditing ? (
                <FieldDataContext.Provider value={fieldDataProvider}>
                  <EditDiscountingRequestFields data-test-id="edit-discounting-request-panel" formik={formik} />
                </FieldDataContext.Provider>
              ) : (
                <DiscountingRequestInfo
                  data-test-id="view-discounting-request-panel"
                  history={history}
                  discountingRequest={discountingRequest}
                />
              )}
            </BasicPanel>
          </MinimalAccordionWrapper>
        </>
      )}
    />
  )
}

export default DiscountingRequestData
