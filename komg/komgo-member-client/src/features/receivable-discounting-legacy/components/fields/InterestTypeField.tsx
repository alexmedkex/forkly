import React from 'react'
import { rdQuoteSchema } from '../../utils/constants'
import { enumToRadioOptions } from '../../../letter-of-credit-legacy/components'
import { Field, FormikProps } from 'formik'
import { ISubmitQuoteFormDetails } from '../../store/types'
import { InterestType, LiborType } from '@komgo/types'
import { SimpleRadioController } from '../../../letter-of-credit-legacy/components/InputControllers/SimpleRadioController'
import { findFieldFromSchema } from '../../../../store/common/selectors/displaySelectors'
import { PercentageInputField } from './PercentageInputField'
import { HorizontalRadioLayoutWrapper } from '../../../../components/styled-components'
import { displayDate } from '../../../../utils/date'
import { MaturityInputFieldWithLabel } from './MaturityInputFieldWithLabel'

export interface IInterestTypeFieldProps {
  formik: FormikProps<ISubmitQuoteFormDetails>
  interestType: InterestType
  defaultCofDate: Date
  optionalMaturity?: boolean
}

export const InterestTypeField: React.FC<IInterestTypeFieldProps> = ({
  interestType,
  defaultCofDate,
  formik,
  optionalMaturity
}) => {
  const maturityField = (
    <MaturityInputFieldWithLabel formik={formik} inputStyle={{ width: '50%' }} optional={optionalMaturity} />
  )
  const liborTypeField = (
    <HorizontalRadioLayoutWrapper>
      <Field
        name="liborType"
        fieldName={findFieldFromSchema('title', 'liborType', rdQuoteSchema)}
        options={enumToRadioOptions(LiborType)}
        component={SimpleRadioController}
      />
    </HorizontalRadioLayoutWrapper>
  )

  if (interestType === InterestType.CostOfFunds) {
    return (
      <PercentageInputField
        schema={rdQuoteSchema}
        name="indicativeCof"
        labelText={`${findFieldFromSchema('title', 'indicativeCof', rdQuoteSchema)} as of ${displayDate(
          defaultCofDate ? defaultCofDate : new Date(Date.now())
        )}`}
        data-test-id="indicativeCof"
        formik={formik}
      />
    )
  }

  if (interestType === InterestType.Libor) {
    return (
      <>
        {liborTypeField}
        {formik.values.liborType === LiborType.Published && maturityField}
      </>
    )
  }

  if (interestType === InterestType.AddOnLibor) {
    return (
      <>
        <PercentageInputField schema={rdQuoteSchema} name="addOnValue" data-test-id="addOnValue" formik={formik} />
        {liborTypeField}
        {formik.values.liborType === LiborType.Published && maturityField}
      </>
    )
  }
}
