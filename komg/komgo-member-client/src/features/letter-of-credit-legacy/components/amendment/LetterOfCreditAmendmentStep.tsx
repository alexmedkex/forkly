import * as React from 'react'
import { Segment } from 'semantic-ui-react'
import { Field, connect, FormikContext } from 'formik'

import { CapitalizedHeader } from '../CapitalizedHeader'
import PropertyEditor, { pathToKey } from './PropertyEditor'
import { ILetterOfCredit } from '../../types/ILetterOfCredit'
import SimpleButton from '../../../../components/buttons/SimpleButton'
import { violetBlue, buttonGrey } from '../../../../styles/colors'
import { IDiff, ILCAmendmentBase } from '@komgo/types'
import { findDiffsByTypes } from '../../containers/CreateAmendment'

interface LetterOfCreditAmendmentOwnProps {
  disabled?: boolean
}

interface LetterOfCreditAmendmentState {
  newUpdate: boolean
}

export type LetterOfCreditAmendmentProps = LetterOfCreditAmendmentOwnProps & {
  formik: FormikContext<ILCAmendmentBase>
}

export const amendableFields: Array<Partial<keyof ILetterOfCredit>> = [
  'feesPayableBy',
  'invoiceRequirement',
  'billOfLadingEndorsement',
  'currency',
  'amount',
  'expiryDate',
  'availableWith',
  'partialShipmentAllowed',
  'transhipmentAllowed',
  'LOI'
]

export class LetterOfCreditAmendmentStep extends React.Component<
  LetterOfCreditAmendmentProps,
  LetterOfCreditAmendmentState
> {
  constructor(props: LetterOfCreditAmendmentProps) {
    super(props)
  }
  render() {
    const {
      formik: { values, setFieldValue }
    } = this.props

    const letterOfCreditAmendments = findDiffsByTypes(values.diffs, ['ILC'])

    const moreUpdatesPossible = amendableFields.length !== letterOfCreditAmendments.length

    return (
      <>
        <CapitalizedHeader content="Updates" block={true} />
        <Segment basic={true}>
          <Field name="diffs" render={() => generatePropertyEditors(letterOfCreditAmendments)} />

          <SimpleButton
            type="button"
            disabled={!moreUpdatesPossible}
            color={moreUpdatesPossible ? violetBlue : buttonGrey}
            onClick={() =>
              setFieldValue('diffs', [
                ...values.diffs,
                { op: 'replace', value: '', oldValue: '', path: '', type: 'ILC' }
              ])
            }
          >
            + Add field
          </SimpleButton>
        </Segment>
      </>
    )
  }
}

const generatePropertyEditors = (lcDiffs: IDiff[]) =>
  lcDiffs
    .filter(diff => amendableFields.includes(pathToKey(diff.path) as keyof ILetterOfCredit) || diff.path === '')
    .map((diff, idx) => (
      <PropertyEditor
        key={idx}
        index={idx}
        options={amendableFields.filter(field => selectValidDropdownOptions(lcDiffs, diff, field))}
        field={(pathToKey(diff.path) as keyof ILetterOfCredit) || ''}
      />
    ))

const selectValidDropdownOptions = (allDiffs: IDiff[], currentDiff: IDiff, field: string) =>
  !allDiffs.map(diff => pathToKey(diff.path)).includes(field) || pathToKey(currentDiff.path) === field

export default connect<LetterOfCreditAmendmentOwnProps, ILCAmendmentBase>(LetterOfCreditAmendmentStep)
