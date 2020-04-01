import { ErrorLabel } from '../../../../components/error-message/ErrorLabel'
import { FormikProps } from 'formik'
import * as React from 'react'
import { Dropdown, Form, Icon } from 'semantic-ui-react'
import * as Yup from 'yup'
import styled from 'styled-components'
import { IParcel } from '@komgo/types'

interface Props {
  formik: FormikProps<{
    parcelId: string
  }>
  parcels: IParcel[]
}

export const ParcelIdField: React.SFC<Props> = (props: Props) => {
  return (
    <React.Fragment>
      <Form.Field style={{ position: 'relative' }} selection={true}>
        <label>Parcel id</label>
        <Dropdown
          name="parcelId"
          fluid={true}
          button={true}
          placeholder="Select parcel id"
          options={toOptions(props.parcels)}
          onChange={(event, value) => {
            props.formik.setFieldValue('parcelId', value.value)
          }}
          onBlur={props.formik.handleBlur}
          value={props.formik.values.parcelId}
        />
        {props.formik.values.parcelId !== '' && (
          <RestartParcel name="close" onClick={() => props.formik.setFieldValue('parcelId', '')} />
        )}
      </Form.Field>
      {props.formik.errors.parcelId &&
        props.formik.touched.parcelId && <ErrorLabel message={props.formik.errors.parcelId} />}
    </React.Fragment>
  )
}

function toOptions(parcels: IParcel[]) {
  return parcels.map(parcel => {
    return { key: parcel.id, text: parcel.id, value: parcel.id }
  })
}

export const parcelIdValidation = {
  parcelId: Yup.string().required('Parcel id is required')
}

const RestartParcel = styled(Icon)`
  position: absolute;
  bottom: 11px;
  right: 20px;
  z-index: 10;
  &:hover {
    cursor: pointer;
  }
`
