import * as React from 'react'

import { ITradeEnriched } from '../../trades/store/types'
import {
  TradeData,
  CommodityAndPrice,
  ContractData,
  DeliveryTerms,
  PANELS,
  DocumentaryRequirements,
  TradeViewDataProps
} from '../../trades/components'
import { Accordion } from 'semantic-ui-react'
import { ICargo } from '@komgo/types'

interface SummaryOfTradesStepProps {
  disabled?: boolean
  trade?: ITradeEnriched
  cargos: ICargo[]
  company: string
  role: string
}

const allActive = {
  [PANELS.Basic]: true,
  [PANELS.Goods]: true,
  [PANELS.Contract]: true,
  [PANELS.Terms]: true,
  [PANELS.Documents]: true,
  [PANELS.UploadedDocuments]: true,
  [PANELS.Cargo]: true
}

const tradeViewStageProps: TradeViewDataProps = {
  actives: allActive,
  uploadedDocuments: [],
  handleClick: () => null,
  hideDropdownIcon: true,
  trade: undefined,
  company: undefined
}

const SummaryOfTradesStep: React.FC<SummaryOfTradesStepProps> = ({ trade, cargos, company, role }) => {
  return trade ? (
    <Accordion fluid={true} style={{ paddingTop: 0 }}>
      <TradeData {...tradeViewStageProps} trade={trade} company={company} role={role} />
      <CommodityAndPrice {...tradeViewStageProps} trade={trade} company={company} tradeMovements={cargos} />
      <ContractData {...tradeViewStageProps} trade={trade} company={company} />
      <DeliveryTerms {...tradeViewStageProps} trade={trade} company={company} tradeMovements={cargos} />
      <DocumentaryRequirements {...tradeViewStageProps} trade={trade} company={company} />
    </Accordion>
  ) : (
    <div />
  )
}

export default SummaryOfTradesStep
