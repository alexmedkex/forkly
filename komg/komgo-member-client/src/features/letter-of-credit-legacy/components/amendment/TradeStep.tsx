import * as React from 'react'
import { Segment } from 'semantic-ui-react'
import { Field, connect, FormikContext, FieldProps } from 'formik'

import { DiffList } from './DiffList'
import { CapitalizedHeader } from '../CapitalizedHeader'
import { ILCAmendmentBase } from '@komgo/types'
import { findDiffsByTypes } from '../../containers/CreateAmendment'

interface TradeStepOwnProps {
  disabled?: boolean
}

export type TradeStepProps = TradeStepOwnProps & { formik: FormikContext<ILCAmendmentBase> }

// const findLabelForPage = (label: keyof LetterOfCreditValues): string => findLabel(STEP.PARTICIPANTS, label)

export const TradeStep: React.FC<TradeStepProps> = ({ formik: { values, initialValues } }) => {
  const lcAmendments = findDiffsByTypes(values.diffs, ['ILC'])
  return (
    <React.Fragment>
      <CapitalizedHeader content="Updates" block={true} />
      <Segment basic={true}>
        <Field
          name="diffs"
          render={({ field, form }: FieldProps<ILCAmendmentBase>) => {
            const onChange = (field, value) => {
              form.setFieldValue(field, [...lcAmendments, ...value])
              form.setFieldTouched(field)
            }
            return (
              <DiffList
                options={findDiffsByTypes(initialValues.diffs, ['ITrade', 'ICargo'])}
                {...field}
                values={findDiffsByTypes(values.diffs, ['ITrade', 'ICargo'])}
                onChange={onChange}
              />
            )
          }}
        />
      </Segment>
    </React.Fragment>
  )
}

export default connect<TradeStepOwnProps, ILCAmendmentBase>(TradeStep)
