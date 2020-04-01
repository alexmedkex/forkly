import * as React from 'react'
import { Table, Checkbox } from 'semantic-ui-react'
import { productRD } from '@komgo/products'
import { Counterparty } from '../../../../counterparties/store/types'
import MemberMarketSelectionRow from './MemberMarketSelectionRow'
import { WithLicenseCheckProps } from '../../../../../components'
import { IMemberMarketSelectionItem } from '../../../../receivable-discounting-legacy/store/types'

export interface IMemberMarketSelectionTableProps extends WithLicenseCheckProps {
  data: IMemberMarketSelectionItem[]
  selectedData: Counterparty[]
  handleCheckboxClick(counterparty?: Counterparty): void
}

export class MemberMarketSelectionTable extends React.Component<IMemberMarketSelectionTableProps> {
  constructor(props: IMemberMarketSelectionTableProps) {
    super(props)
  }

  render() {
    const { data, handleCheckboxClick, selectedData, isLicenseEnabledForCompany } = this.props

    return (
      <Table basic="very" textAlign="left" sortable={true}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell id="select" textAlign={'left'} width={'1'} style={{ padding: '14px 14px 5px 14px' }}>
              <Checkbox data-test-id="checkbox-select-all-none" onClick={() => handleCheckboxClick()} />
            </Table.HeaderCell>
            <Table.HeaderCell id="provider" textAlign={'left'}>
              Provider
            </Table.HeaderCell>
            <Table.HeaderCell id="location" textAlign={'left'}>
              Location
            </Table.HeaderCell>
            <Table.HeaderCell id="appetite" textAlign={'left'}>
              Appetite
            </Table.HeaderCell>
            <Table.HeaderCell id="availability" textAlign={'left'}>
              Availability
            </Table.HeaderCell>
            <Table.HeaderCell id="creditLimit" textAlign={'left'}>
              Credit Limit
            </Table.HeaderCell>
            <Table.HeaderCell id="riskFee" textAlign={'left'}>
              Risk Fee
            </Table.HeaderCell>
            <Table.HeaderCell id="margin" textAlign={'left'}>
              Margin
            </Table.HeaderCell>
            <Table.HeaderCell id="maxTenor" textAlign={'left'}>
              Max Tenor (Days)
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {(data as IMemberMarketSelectionItem[]).reduce((res, cp, idx) => {
            const row = (
              <MemberMarketSelectionRow
                key={idx}
                data={cp}
                selectedData={selectedData}
                handleCheckboxClick={handleCheckboxClick}
              />
            )
            return isLicenseEnabledForCompany(productRD, cp.counterparty.staticId) ? [...res, row] : res
          }, [])}
        </Table.Body>
      </Table>
    )
  }
}

export default MemberMarketSelectionTable
