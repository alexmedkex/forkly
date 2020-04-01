import * as React from 'react'
import { Accordion, Segment, Icon, Confirm, Button } from 'semantic-ui-react'
import Ajv from 'ajv'
import { Field, Formik, FormikProps } from 'formik'
import BasicPanel from './../BasicPanel'
import { FieldWithLabel } from '../Field'
import {
  GridTextController,
  enumToDropdownOptions,
  GridDropdownController,
  WrappedFormattedInputController
} from '../../../letter-of-credit-legacy/components/InputControllers'
import { FieldStyling } from './../trade-form-fields/TradeData'
import { isErrorActive } from '../../utils/isErrorActive'
import { toFormikErrors } from '../../../../utils/validator'
import { ModeOfTransport, PARCEL_SCHEMA, getParcelSchemaId, PARCEL_SCHEMA_VERSION, IParcel } from '@komgo/types'
import { findFieldFromTradeSchema } from '../../utils/displaySelectors'
import FormErrors from '../trade-form-fields/FormErrors'
import { getFieldConfiguration } from '../../utils/getFieldConfiguration'
import validateDateRange from '../../../../utils/validateDateRange'
import { violetBlue } from '@komgo/ui-components'
import FormikEffect from '../../../standby-letter-of-credit-legacy/components/formik-effect'
import { validateParcel } from '../../utils/validator'
import { sanitiseParcelValues } from '../../utils/sanitiser'
import { TRADING_ROLE_OPTIONS } from '../../constants'
import {
  numberToIntegerValueWithDefaultNull,
  formatToIntegerWithDefaultNull
} from '../../../credit-line/utils/formatters'

export interface IParcelWithOverrides extends IParcel {
  modeOfTransportOther?: string

  uniqueKey?: string
}

export interface IProps {
  initialParcelData: IParcel
  removeParcel: () => void
  onChange: (parcel: IParcel) => void
  submitCount?: number
  dataTestId?: string
  tradingRole: string
}

interface IParcelDataState {
  formikRef: React.RefObject<Formik>
  submitCounter: number
  confirmModalOpen: boolean
}

class ParcelData extends React.Component<IProps, IParcelDataState> {
  constructor(props) {
    super(props)
    this.state = {
      formikRef: React.createRef(),
      submitCounter: 0,
      confirmModalOpen: false
    }
  }
  componentDidUpdate(prevProps: IProps) {
    if (prevProps.submitCount < this.props.submitCount) {
      this.setState({ submitCounter: this.state.submitCounter + 1 })
      this.state.formikRef.current.submitForm()
    }
  }

  generateModeOfTransportSpecificField = (formik: FormikProps<IParcelWithOverrides>) => {
    switch (formik.values.modeOfTransport) {
      case ModeOfTransport.Other:
        return (
          <>
            <FieldWithLabel customWidth="190px">
              <Field
                type="text"
                name="modeOfTransportOther"
                fieldStyle={FieldStyling}
                fieldName="Other (please specify)"
                value={formik.values.modeOfTransportOther}
                component={GridTextController}
                error={isErrorActive('modeOfTransportOther', formik.errors, formik.touched)}
              />
            </FieldWithLabel>
            <FieldWithLabel customWidth="190px">
              <Field style={{ visibility: 'hidden' }} name="hidden" />
            </FieldWithLabel>
          </>
        )
      case ModeOfTransport.Vessel:
        return (
          <>
            <FieldWithLabel customWidth="190px">
              <Field
                type="text"
                name="vesselName"
                fieldName={findFieldFromTradeSchema('title', 'vesselName', PARCEL_SCHEMA)}
                value={formik.values.vesselName}
                fieldStyle={FieldStyling}
                component={GridTextController}
              />
            </FieldWithLabel>
            <FieldWithLabel customWidth="190px">
              <Field
                type="number"
                name="vesselIMO"
                fieldName={findFieldFromTradeSchema('title', 'vesselIMO', PARCEL_SCHEMA)}
                value={formik.values.vesselIMO}
                fieldStyle={FieldStyling}
                component={GridTextController}
              />
            </FieldWithLabel>
          </>
        )
      case ModeOfTransport.ITT:
        return (
          <>
            <FieldWithLabel customWidth="190px">
              <Field
                type="text"
                name="tankFarmOperatorName"
                fieldName={findFieldFromTradeSchema('title', 'tankFarmOperatorName', PARCEL_SCHEMA)}
                value={formik.values.tankFarmOperatorName}
                fieldStyle={FieldStyling}
                component={GridTextController}
              />
            </FieldWithLabel>
            <FieldWithLabel customWidth="190px">
              <Field style={{ visibility: 'hidden' }} name="hidden" />
            </FieldWithLabel>
          </>
        )
      case ModeOfTransport.Pipeline:
        return (
          <>
            <FieldWithLabel customWidth="190px">
              <Field
                type="text"
                name="pipelineName"
                fieldName={findFieldFromTradeSchema('title', 'pipelineName', PARCEL_SCHEMA)}
                value={formik.values.pipelineName}
                fieldStyle={FieldStyling}
                component={GridTextController}
              />
            </FieldWithLabel>
            <FieldWithLabel customWidth="190px">
              <Field style={{ visibility: 'hidden' }} name="hidden" />
            </FieldWithLabel>
          </>
        )
      case ModeOfTransport.Warehouse:
        return (
          <>
            <FieldWithLabel customWidth="190px">
              <Field
                type="text"
                name="warehouseOperatorName"
                fieldName={findFieldFromTradeSchema('title', 'warehouseOperatorName', PARCEL_SCHEMA)}
                value={formik.values.warehouseOperatorName}
                fieldStyle={FieldStyling}
                component={GridTextController}
              />
            </FieldWithLabel>
            <FieldWithLabel customWidth="190px">
              <Field style={{ visibility: 'hidden' }} name="hidden" />
            </FieldWithLabel>
          </>
        )

      default:
        return (
          <>
            <FieldWithLabel customWidth="190px">
              <Field style={{ visibility: 'hidden' }} name="hidden" />
            </FieldWithLabel>
            <FieldWithLabel customWidth="190px">
              <Field style={{ visibility: 'hidden' }} name="hidden" />
            </FieldWithLabel>
          </>
        )
    }
  }

  render() {
    const { initialParcelData, removeParcel, onChange, dataTestId, tradingRole } = this.props
    const { submitCounter, confirmModalOpen } = this.state
    const showAllValidations = submitCounter > 0

    const isBuyerTrade = this.props.tradingRole === TRADING_ROLE_OPTIONS.BUYER

    const modeOfTransportOptions = [
      {
        value: '',
        content: '(none)',
        text: '(none)'
      },
      ...enumToDropdownOptions(ModeOfTransport)
    ]

    return (
      <Segment style={{ padding: '30px' }} data-test-id={dataTestId}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '10px' }}>
          <Icon
            name="close"
            link={true}
            style={{ color: `${violetBlue}` }}
            onClick={() => this.setState({ confirmModalOpen: true })}
            data-test-id={`${dataTestId}-removeParcel`}
          />
        </div>

        <Formik
          ref={this.state.formikRef}
          initialValues={initialParcelData}
          onSubmit={(_, actions) => {
            actions.setSubmitting(false)
          }}
          validate={validateParcel}
          validateOnBlur={true}
          validateOnChange={true}
          render={(formik: FormikProps<IParcelWithOverrides>) => (
            <React.Fragment>
              <FormikEffect
                onChange={values => {
                  return onChange && onChange(values as IParcelWithOverrides)
                }}
              />
              <FormErrors
                isParcelForm={true}
                showAllValidations={showAllValidations}
                dataTestId={`${dataTestId}-errors`}
              />
              <Accordion.Content active={true}>
                <BasicPanel>
                  <FieldWithLabel customWidth="190px">
                    <Field
                      type="text"
                      name="id"
                      fieldName={`${findFieldFromTradeSchema('title', 'id', PARCEL_SCHEMA)} *`}
                      value={formik.values.id}
                      fieldStyle={FieldStyling}
                      component={GridTextController}
                      error={isErrorActive('id', formik.errors, formik.touched, showAllValidations)}
                    />
                  </FieldWithLabel>
                  <FieldWithLabel customWidth="190px">
                    <Field
                      name="laycanPeriod.startDate"
                      fieldName={`${findFieldFromTradeSchema(
                        'title',
                        'laycanPeriod.properties.startDate',
                        PARCEL_SCHEMA
                      )} *`}
                      error={isErrorActive('laycanPeriod.startDate', formik.errors, formik.touched, showAllValidations)}
                      type="date"
                      fieldStyle={FieldStyling}
                      component={GridTextController}
                      customStyle={{ width: '175px' }}
                      value={formik.values.laycanPeriod.startDate}
                    />
                  </FieldWithLabel>
                  <FieldWithLabel customWidth="190px">
                    <Field
                      name="laycanPeriod.endDate"
                      fieldName={`${findFieldFromTradeSchema(
                        'title',
                        'laycanPeriod.properties.endDate',
                        PARCEL_SCHEMA
                      )} *`}
                      error={isErrorActive('laycanPeriod.endDate', formik.errors, formik.touched, showAllValidations)}
                      type="date"
                      fieldStyle={FieldStyling}
                      customStyle={{ width: '175px' }}
                      component={GridTextController}
                      value={formik.values.laycanPeriod.endDate}
                    />
                  </FieldWithLabel>
                  <FieldWithLabel customWidth="190px">
                    <Field
                      name="modeOfTransport"
                      fieldStyle={FieldStyling}
                      fieldName={findFieldFromTradeSchema('title', 'modeOfTransport', PARCEL_SCHEMA)}
                      selection={true}
                      search={true}
                      error={isErrorActive('modeOfTransport', formik.errors, formik.touched, showAllValidations)}
                      options={modeOfTransportOptions}
                      component={GridDropdownController}
                    />
                  </FieldWithLabel>
                  {this.generateModeOfTransportSpecificField(formik)}
                  <FieldWithLabel customWidth="190px">
                    <Field
                      name="deemedBLDate"
                      fieldName={`${findFieldFromTradeSchema('title', 'deemedBLDate', PARCEL_SCHEMA)} *`}
                      error={isErrorActive('deemedBLDate', formik.errors, formik.touched, showAllValidations)}
                      type="date"
                      fieldStyle={FieldStyling}
                      component={GridTextController}
                      customStyle={{ width: '175px' }}
                      value={formik.values.deemedBLDate}
                    />
                  </FieldWithLabel>
                  <FieldWithLabel customWidth="190px">
                    <Field
                      type="text"
                      name="loadingPlace"
                      fieldName={findFieldFromTradeSchema('title', 'loadingPlace', PARCEL_SCHEMA)}
                      value={formik.values.loadingPlace}
                      fieldStyle={FieldStyling}
                      component={GridTextController}
                      error={isErrorActive('loadingPlace', formik.errors, formik.touched, showAllValidations)}
                    />
                  </FieldWithLabel>
                  <FieldWithLabel customWidth="190px">
                    <Field
                      type="text"
                      name="destinationPlace"
                      fieldName={findFieldFromTradeSchema('title', 'destinationPlace', PARCEL_SCHEMA)}
                      value={formik.values.destinationPlace}
                      fieldStyle={FieldStyling}
                      component={GridTextController}
                      error={isErrorActive('destinationPlace', formik.errors, formik.touched, showAllValidations)}
                    />
                  </FieldWithLabel>
                  <FieldWithLabel customWidth="190px">
                    <Field
                      type="text"
                      name="inspector"
                      fieldName={findFieldFromTradeSchema('title', 'inspector', PARCEL_SCHEMA)}
                      value={formik.values.inspector}
                      fieldStyle={FieldStyling}
                      component={GridTextController}
                      error={isErrorActive('inspector', formik.errors, formik.touched, showAllValidations)}
                    />
                  </FieldWithLabel>
                  <FieldWithLabel customWidth="190px">
                    <Field
                      type="number"
                      name="quantity"
                      fieldName={`${findFieldFromTradeSchema('title', 'quantity', PARCEL_SCHEMA)} *`}
                      formatAsString={formatToIntegerWithDefaultNull}
                      toValue={numberToIntegerValueWithDefaultNull}
                      fieldStyle={FieldStyling}
                      component={WrappedFormattedInputController}
                      customStyle={{ width: '50%' }}
                      error={isErrorActive('quantity', formik.errors, formik.touched, showAllValidations)}
                    />
                  </FieldWithLabel>
                </BasicPanel>
              </Accordion.Content>
              <Confirm
                open={confirmModalOpen}
                header={'Remove parcel'}
                content={
                  formik.values.id.trim()
                    ? `Are you sure you want to remove parcel ${formik.values.id}?`
                    : 'Areyou sure you want to remove this parcel?'
                }
                cancelButton={<Button content="Cancel" />}
                confirmButton={<Button primary={true} content="Confirm" data-test-id="confirm-remove-parcel" />}
                onCancel={() => this.setState({ confirmModalOpen: false })}
                onConfirm={removeParcel}
              />
            </React.Fragment>
          )}
        />
      </Segment>
    )
  }
}

export default ParcelData
