import * as React from 'react'
import { MinimalAccordionWrapper } from '../../../../components/accordion/MinimalAccordionWrapper'
import { PANELS, TradeViewData } from '../../../trades/components'
import { ITradeEnriched } from '../../../trades/store/types'
import { ICargo, IHistory, ITradeSnapshot } from '@komgo/types'
import { Button, AccordionTitleProps } from 'semantic-ui-react'

interface IReceivableDiscountingTradeViewProps {
  company: string
  trade: ITradeEnriched
  tradeMovements: ICargo[]
  open: boolean
  index: string
  changed: boolean
  tradeCargoHistory?: IHistory<ITradeSnapshot>
  handleClick: (e: React.SyntheticEvent, titleProps: AccordionTitleProps) => void
  handleEditClicked?: () => void
}

interface IReceivableDiscountingTradeViewState {
  tradeViewPanelActives: { [key in PANELS]: boolean }
}

export class ReceivableDiscountingTradeView extends React.Component<
  IReceivableDiscountingTradeViewProps,
  IReceivableDiscountingTradeViewState
> {
  constructor(props: IReceivableDiscountingTradeViewProps) {
    super(props)

    this.state = {
      tradeViewPanelActives: {
        [PANELS.Basic]: true,
        [PANELS.Goods]: true,
        [PANELS.Contract]: true,
        [PANELS.Terms]: true,
        [PANELS.Documents]: false,
        [PANELS.UploadedDocuments]: false,
        [PANELS.Cargo]: true
      }
    }
  }

  render() {
    const {
      company,
      trade,
      tradeMovements,
      open,
      index,
      changed,
      tradeCargoHistory,
      handleClick,
      handleEditClicked
    } = this.props
    const { tradeViewPanelActives } = this.state
    return (
      <MinimalAccordionWrapper
        active={open}
        handleClick={handleClick}
        index={index}
        title="Trade summary"
        highlight={changed}
        buttons={
          handleEditClicked && (
            <Button
              content={'Edit'}
              data-test-id="edit-trade-request"
              onClick={e => {
                e.stopPropagation()
                handleEditClicked()
              }}
            />
          )
        }
      >
        <TradeViewData
          company={company}
          actives={tradeViewPanelActives}
          hideDropdownIcon={true}
          trade={trade}
          tradeMovements={tradeMovements}
          tradeCargoHistory={tradeCargoHistory}
        />
      </MinimalAccordionWrapper>
    )
  }
}

export default ReceivableDiscountingTradeView
