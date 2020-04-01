import * as React from 'react'
import styled from 'styled-components'
import { Select } from 'semantic-ui-react'

import { ProfileFormMode, HasMode, HasProfileUpdater } from './CounterpartyProfileSection'

import { RiskLevel } from '../../../counterparties/store/types'
import { capitalize } from '../../../../utils/casings'
import { orange, green, red } from '../../../../styles/colors'

export interface HasRiskLevel {
  riskLevel: RiskLevel
}

const RiskLevelToColor = {
  [RiskLevel.low]: green,
  [RiskLevel.medium]: orange,
  [RiskLevel.high]: red
}

export interface Props extends HasRiskLevel, HasMode, HasProfileUpdater {}

export const RiskLevelField = (props: HasRiskLevel & HasMode & HasProfileUpdater) => {
  return props.mode === ProfileFormMode.EDIT ? (
    <Select
      data-test-id="cp-profile-field-risklevel-edit"
      style={{ maxWidth: '160px' }}
      compact={true}
      value={props.riskLevel || 'unspecified'}
      options={[
        { key: 'unspecified', value: 'unspecified', text: 'Undefined' },
        ...['low', 'medium', 'high'].map(stringtoOption)
      ]}
      onChange={(e, data) => {
        const { value } = data
        props.updateProfile({ riskLevel: value === 'unspecified' ? RiskLevel.unspecified : (value as RiskLevel) })
      }}
    />
  ) : (
    <RORiskLevel riskLevel={props.riskLevel} />
  )
}

export const RORiskLevel = ({ riskLevel }: { riskLevel: RiskLevel }) => {
  return (
    <StyledByRiskLevel data-test-id="cp-profile-field-risklevel-view" riskLevel={riskLevel}>
      {capitalize(riskLevel || '-')}
    </StyledByRiskLevel>
  )
}

const StyledByRiskLevel = styled.div`
  color: ${({ riskLevel }: { riskLevel: RiskLevel }) => RiskLevelToColor[riskLevel] || '#1C2936'};
`

const stringtoOption = (str: string) => ({ key: str, value: str, text: capitalize(str) })
