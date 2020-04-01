import * as React from 'react'
import { Segment, Dropdown, Icon } from 'semantic-ui-react'
import { ILetterOfCredit } from '../../types/ILetterOfCredit'
import { FormikContext, connect } from 'formik'
import { fieldToLabel } from '../../constants/fieldsByStep'
import { LetterOfCreditAmendmentContext, findDiffsByTypes } from '../../containers/CreateAmendment'
import { selectInputForField } from '../../utils/selectInputForField'
import { violetBlue } from '../../../../styles/colors'
import { FIELD_ERROR_CLASSNAME } from '../../constants'
import { ILCAmendmentBase } from '@komgo/types'

interface PropertyEditorOwnProps {
  index: number
  field: keyof ILetterOfCredit | ''
  options: any[]
}

export type PropertyEditorProps = PropertyEditorOwnProps & {
  formik: FormikContext<ILCAmendmentBase>
}

export const pathToKey = (s: string): string => s.split('/')[1]
export const keyToPath = (s: string) => `/${s}`
export const selectDefaultValue = (s: string) => {
  switch (s) {
    case 'number':
      return 0
    case 'boolean':
      return false
    default:
      return ''
  }
}

// ATM is related to the LC
export const PropertyEditor: React.FC<PropertyEditorProps> = ({
  field,
  options,
  index,
  formik: { values, setFieldValue, errors }
}) => {
  const fieldDiff = values.diffs.find(v => v.path === keyToPath(field))

  const fieldHasError = Object.keys(errors).includes(field)

  const onFieldChange = (value: string) => {
    setFieldValue('diffs', values.diffs.map(v => (pathToKey(v.path) === field ? { ...v, value } : v)))
  }

  const lcDiffs = findDiffsByTypes(values.diffs, ['ILC'])
  const tradeDiffs = findDiffsByTypes(values.diffs, ['ITrade', 'ICargo'])

  return (
    <Segment>
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px' }}>
        <div>Field</div>
        <Icon
          name="close"
          link={true}
          style={{ color: `${violetBlue}` }}
          onClick={() => setFieldValue('diffs', [...tradeDiffs, ...lcDiffs.filter((_, idx) => index !== idx)])}
        />
      </div>
      <div style={{ maxWidth: '350px' }}>
        <LetterOfCreditAmendmentContext.Consumer>
          {(letterOfCredit: ILetterOfCredit) => (
            <Dropdown
              fluid={true}
              options={options.map(o => ({ value: o, content: fieldToLabel(o), text: fieldToLabel(o) }))}
              selection={true}
              value={field}
              className={fieldHasError ? FIELD_ERROR_CLASSNAME : ''}
              placeholder="Select an amendable field..."
              onChange={(_, { value: pathValue }: { value: string }) =>
                setFieldValue('diffs', [
                  ...tradeDiffs,
                  ...lcDiffs.map(
                    (l, idx) =>
                      index === idx
                        ? {
                            op: 'replace',
                            path: keyToPath(pathValue),
                            oldValue: letterOfCredit[pathValue],
                            value: selectDefaultValue(typeof letterOfCredit[pathValue]),
                            type: 'ILC'
                          }
                        : l
                  )
                ])
              }
            />
          )}
        </LetterOfCreditAmendmentContext.Consumer>
        {!!field && (
          <div style={{ display: 'flex', paddingTop: '15px' }}>
            <div style={{ width: '100%', paddingLeft: '10px' }}>
              Current
              {selectInputForField(field, fieldDiff)}
            </div>
            <div style={{ width: '100%', paddingLeft: '10px' }}>
              New
              {selectInputForField(field, fieldDiff, onFieldChange)}
            </div>
          </div>
        )}
      </div>
    </Segment>
  )
}

export default connect<PropertyEditorOwnProps, ILCAmendmentBase>(PropertyEditor)
