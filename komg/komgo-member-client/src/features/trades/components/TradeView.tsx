import React, { useState, SyntheticEvent } from 'react'

import { Document } from '../../document-management'
import { TradeViewData, PANELS } from './TradeViewData'
import { Segment, AccordionTitleProps } from 'semantic-ui-react'
import { ITradeEnriched } from '../store/types'
import { RouteComponentProps } from 'react-router'
import { ICargo } from '@komgo/types'

interface TradeViewProps extends Partial<RouteComponentProps<any>> {
  trade: ITradeEnriched
  company: string
  tradeMovements: ICargo[]
  uploadedDocuments: Document[]
}

export const TradeView: React.FC<TradeViewProps> = ({ trade, tradeMovements, uploadedDocuments, company, history }) => {
  const [actives, setActives] = useState({
    [PANELS.Basic]: true,
    [PANELS.Goods]: true,
    [PANELS.Contract]: true,
    [PANELS.Terms]: true,
    [PANELS.Documents]: true,
    [PANELS.UploadedDocuments]: true,
    [PANELS.Cargo]: true
  })

  const handleClick = (e: SyntheticEvent, titleProps: AccordionTitleProps) => {
    const { index } = titleProps
    setActives({
      ...actives,
      [index as string]: !actives[index as PANELS]
    })
  }

  return (
    <Segment basic={true}>
      <TradeViewData
        history={history}
        actives={actives}
        handleClick={handleClick}
        trade={trade}
        tradeMovements={tradeMovements}
        uploadedDocuments={uploadedDocuments}
        company={company}
      />
    </Segment>
  )
}
