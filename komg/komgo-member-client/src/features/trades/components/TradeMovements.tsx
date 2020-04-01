import * as React from 'react'
import { ICargo, CARGO_SCHEMA } from '@komgo/types'

import styled from 'styled-components'
import { media } from '../../../utils/media'
import TradeMovementParcels from '../../trades/components/TradeMovementParcels'
import { Segment } from 'semantic-ui-react'
import { findFieldFromTradeSchema } from '../utils/displaySelectors'

export interface TradeMovementsProps {
  cargos: ICargo[]
}

export interface PanelProps {
  maxHeight?: string
}

const BasicPanel: React.SFC<PanelProps> = ({ children, ...props }) => <Panel {...props}>{children}</Panel>
const Field = styled.li`
  margin: 0;
  line-height: 2;
  white-space: nowrap;
`
const Label = styled.span`
  display: inline-block;
  font-weight: bold;
  width: 200px;
`
const Panel = styled.ul`
  list-style: none;
  margin: 0;
  padding: 10px;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  ${(props: any) => media.desktop`max-height: ${props.maxHeight}px`};
`

const TradeMovements: React.SFC<TradeMovementsProps> = ({ cargos = [] }) => {
  return (
    <div>
      {cargos &&
        cargos.map((cargo: ICargo) => (
          <BasicPanel key={cargo._id}>
            <Field>
              <Label>{findFieldFromTradeSchema('title', 'cargoId', CARGO_SCHEMA)}</Label>
              {cargo.cargoId}
            </Field>
            <Field>
              <Label>{findFieldFromTradeSchema('title', 'grade', CARGO_SCHEMA)}</Label>
              {cargo.grade}
            </Field>
            <Segment basic={true}>
              <TradeMovementParcels parcels={cargo.parcels} />
            </Segment>
          </BasicPanel>
        ))}
    </div>
  )
}

export default TradeMovements
