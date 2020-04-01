import * as React from 'react'
import { Segment, Table } from 'semantic-ui-react'
import { connect, FormikContext } from 'formik'

import { diffNotationToTitleize, diffToDotNotation } from '../../../../utils/casings'
import { displayValue } from '../../../trades/utils/displaySelectors'
import { green } from '../../../../styles/colors'
import { fieldToLabel } from '../../constants/fieldsByStep'
import { pathToKey } from './PropertyEditor'
import { ILCAmendmentBase, IDiff } from '@komgo/types'
import { findDiffsByTypes } from '../../containers/CreateAmendment'

interface SummaryProps {
  diffs: IDiff[]
}
export const SummaryTable: React.FC<SummaryProps> = (props: SummaryProps) => {
  const tradeAmendments = findDiffsByTypes(props.diffs, ['ITrade', 'ICargo'])
  const lcAmendments = findDiffsByTypes(props.diffs, ['ILC'])

  return (
    <Table basic="very">
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell />
          <Table.HeaderCell>Current</Table.HeaderCell>
          <Table.HeaderCell>New</Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {tradeAmendments.map(diff => (
          <Table.Row key={diff.path} verticalAlign="top">
            <Table.Cell>
              <strong>{diffNotationToTitleize(diff.path)}</strong>
            </Table.Cell>
            <Table.Cell data-test-id={`${diff.type}${diff.path}-current`}>
              {displayValue(diff.oldValue, diffToDotNotation(diff.path))}
            </Table.Cell>
            <Table.Cell data-test-id={`${diff.type}${diff.path}-value`} style={{ color: green, whiteSpace: 'pre' }}>
              {displayValue(diff.value, diffToDotNotation(diff.path))}
            </Table.Cell>
          </Table.Row>
        ))}
        {lcAmendments.map(diff => (
          <Table.Row key={diff.path} verticalAlign="top">
            <Table.Cell>
              <strong>{fieldToLabel(pathToKey(diff.path))}</strong>
            </Table.Cell>
            <Table.Cell data-test-id={`${diff.type}${diff.path}-current`}>
              {displayValue(diff.oldValue, diffToDotNotation(diff.path))}
            </Table.Cell>
            <Table.Cell data-test-id={`${diff.type}${diff.path}-new`} style={{ color: green }}>
              {displayValue(diff.value, diffToDotNotation(diff.path))}
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}

export const SummaryStep: React.FC<{ formik: FormikContext<ILCAmendmentBase> }> = ({ formik: { values } }) => {
  return (
    <Segment basic={true}>
      <SummaryTable diffs={values.diffs} />
    </Segment>
  )
}

export default connect<{}, ILCAmendmentBase>(SummaryStep)
