import * as React from 'react'
import { Table, Label, SemanticCOLORS } from 'semantic-ui-react'
import styled from 'styled-components'
import {
  Counterparty,
  Sort,
  CouneterpartyStatus,
  CouneterpartyStatusText,
  CounterpartyProfile,
  RiskLevel
} from '../../store/types'
import { displayDateAndTime } from '../../../../utils/date'
import { ConnectedCountepartiesHeader, TypeCounterTable } from './ConnectedCounterpartiesHeader'
import { RORiskLevel } from '../../../document-management/components/counterparty-profile/RiskLevel'
import { RORenewalDate } from '../../../document-management/components/counterparty-profile/RenewalDate'
import { ReactNode } from 'react-redux'

interface Props {
  counterparties: Counterparty[]
  counterpartyProfiles: Map<string, CounterpartyProfile>
  counterpartiesSort: Sort
  typeCounterTable: TypeCounterTable
  renderMenu?: (id: string, counterparty?: Counterparty) => any
  handleSort(column: string, order: string): void
}

enum NUM_COLUMNS {
  COUNTERPARTY_DOCS_TABLE = 4,
  MANAGEMENT_TABLE = 4
}

const ConnectedCounterparties: React.SFC<Props> = (props: Props) => {
  const { counterparties, handleSort, counterpartiesSort, renderMenu, counterpartyProfiles } = props
  return (
    <StyledConnectedCounterparties>
      <Table sortable={true} basic="very">
        <ConnectedCountepartiesHeader
          handleSort={handleSort}
          typeCounterTable={props.typeCounterTable}
          counterpartiesSort={counterpartiesSort}
          width={getTableWidth(props.typeCounterTable)}
        />
        <Table.Body>
          {counterparties.map(counterparty => {
            const profile = counterpartyProfiles.get(counterparty.staticId)
            return (
              <Table.Row key={counterparty.staticId}>
                <FirstCellStyled>{counterparty.x500Name.O}</FirstCellStyled>
                <Table.Cell>{counterparty.x500Name.L}</Table.Cell>
                {printExtendedValues(props.typeCounterTable, counterparty, profile)}
                {printMenuButton(props.typeCounterTable, counterparty, renderMenu)}
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table>
    </StyledConnectedCounterparties>
  )
}

const printCounterpartyStatus = (status: string) => {
  let color: SemanticCOLORS = 'grey'
  if (status === CouneterpartyStatus.WAITING) {
    color = 'green'
  } else if (status === CouneterpartyStatus.PENDING) {
    color = 'violet'
  }
  return <Label color={color}>{CouneterpartyStatusText[status]}</Label>
}

const getTableWidth = (type: TypeCounterTable): number => {
  if (type === TypeCounterTable.COUNTERPARTY_DOCS) {
    return NUM_COLUMNS.COUNTERPARTY_DOCS_TABLE
  } else if (type === TypeCounterTable.MANAGEMENT) {
    return NUM_COLUMNS.MANAGEMENT_TABLE
  }
}

const printMenuButton = (type: TypeCounterTable, counterparty: Counterparty, renderMenu: any): ReactNode => {
  if (renderMenu) {
    switch (type) {
      case TypeCounterTable.COUNTERPARTY_DOCS:
        return <Table.Cell textAlign="right">{renderMenu(counterparty.staticId)}</Table.Cell>
      case TypeCounterTable.MANAGEMENT:
        return <Table.Cell textAlign="right">{renderMenu(counterparty.staticId, counterparty)}</Table.Cell>
    }
  }
}

const printExtendedValues = (
  type: TypeCounterTable,
  counterparty: Counterparty,
  profile: CounterpartyProfile
): ReactNode => {
  switch (type) {
    case TypeCounterTable.COUNTERPARTY_DOCS:
      return (
        <>
          <Table.Cell>{profile ? renderRiskLevel(profile.riskLevel) : '-'}</Table.Cell>
          <Table.Cell>{profile ? renderRenewalDate(profile.renewalDate) : '-'}</Table.Cell>
        </>
      )
    case TypeCounterTable.MANAGEMENT:
      return (
        <>
          <Table.Cell>
            {' '}
            <div>{counterparty.status && printCounterpartyStatus(counterparty.status)}</div>
          </Table.Cell>
          <Table.Cell>{displayDateAndTime(counterparty.timestamp)}</Table.Cell>
        </>
      )
  }
}

const renderRiskLevel = (level: string) => {
  return <RORiskLevel riskLevel={RiskLevel[level]} />
}

const renderRenewalDate = (renewalDate: string) => {
  // TODO showCountdown should come back once its logic gets clarified
  return <RORenewalDate renewalDate={renewalDate} showCountdown={false} />
}

export const FirstCellStyled = styled(Table.Cell)`
  &&&&& {
    font-weight: bold;
  }
`

export const TableHeaderStyled: any = styled(Table.HeaderCell)`
  &&&&& {
    border-left: none;
    background: white;
  }
`

const StyledConnectedCounterparties = styled.div`
  margin-top: 15px;
`

export default ConnectedCounterparties
