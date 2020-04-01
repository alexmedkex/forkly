import * as React from 'react'
import { Fragment } from 'react'
import { Segment, Message } from 'semantic-ui-react'
import TradeMovements from '../../trades/components/TradeMovements'
import { CapitalizedHeader } from './CapitalizedHeader'
import { ICargo } from '@komgo/types'
import { paleGray } from '../../../styles/colors'

export interface CargoMovementStepProps {
  cargos: ICargo[]
}

const CargoMovementStep: React.SFC<CargoMovementStepProps> = ({ cargos = [] }) => (
  <Fragment>
    <CapitalizedHeader content="Cargo movements" block={true} />
    <Segment basic={true}>
      {!cargos || !cargos.length ? (
        <Message
          data-test-id="no-cargos"
          content="No cargo data for this trade."
          style={{ backgroundColor: paleGray }}
        />
      ) : (
        <TradeMovements cargos={cargos} />
      )}
    </Segment>
  </Fragment>
)

export default CargoMovementStep
