import * as React from 'react'
import { Table, Popup, Checkbox } from 'semantic-ui-react'
import { Counterparty } from '../../../../counterparties/store/types'
import { TruncatedText } from '../../../../../components'
import Text from '../../../../../components/text'
import { IMemberMarketSelectionItem } from '../../../../receivable-discounting-legacy/store/types'

export interface MemberMarketSelectionRowProps {
  data: IMemberMarketSelectionItem
  selectedData: Counterparty[]
  handleCheckboxClick(counterparty?: Counterparty): void
}

const DataCell: React.FC<{ children: any }> = ({ children }) => (
  <span style={{ paddingTop: '8px' }}>
    <Text>
      <TruncatedText text={children} maxLength={20} />
    </Text>
  </span>
)

const MemberMarketSelectionRow: React.FC<MemberMarketSelectionRowProps> = (props: MemberMarketSelectionRowProps) => {
  const {
    data: {
      counterparty: {
        staticId,
        x500Name: { STREET, L, PC, CN }
      }
    },
    data,
    handleCheckboxClick,
    selectedData
  } = props
  return (
    <Table.Row id={staticId}>
      <Table.Cell id={`${staticId}-checkbox`} data-test-id={`${staticId}-checkbox`} textAlign={'left'}>
        <Checkbox
          onClick={() => handleCheckboxClick(data.counterparty)}
          checked={selectedData.includes(data.counterparty)}
        />
      </Table.Cell>
      <Table.Cell id={`${staticId}-source`} data-test-id={`${staticId}-source`}>
        <Popup
          inverted={true}
          position={'right center'}
          trigger={
            <span style={{ paddingTop: '8px' }}>
              <Text bold={true}>
                <TruncatedText text={CN} maxLength={20} />
              </Text>
            </span>
          }
          content={[CN, STREET, L, PC].join('\n')}
        />
      </Table.Cell>
      <Table.Cell data-test-id={`${staticId}-location`}>
        <DataCell>{data.location}</DataCell>
      </Table.Cell>
      <Table.Cell data-test-id={`${staticId}-appetite`}>
        <DataCell>{data.appetite}</DataCell>
      </Table.Cell>
      <Table.Cell data-test-id={`${staticId}-availability`}>
        <DataCell>{data.availability}</DataCell>
      </Table.Cell>
      <Table.Cell data-test-id={`${staticId}-creditLimit`}>
        <DataCell>{data.creditLimit}</DataCell>
      </Table.Cell>
      <Table.Cell data-test-id={`${staticId}-riskFee`}>
        <DataCell>{data.riskFee}</DataCell>
      </Table.Cell>
      <Table.Cell data-test-id={`${staticId}-margin`}>
        <DataCell>{data.margin}</DataCell>
      </Table.Cell>
      <Table.Cell data-test-id={`${staticId}-maxTenor`}>
        <DataCell>{data.maxTenor}</DataCell>
      </Table.Cell>
    </Table.Row>
  )
}

export default MemberMarketSelectionRow
