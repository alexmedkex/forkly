import * as React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { ContentBar } from '../../../components/content-bar/ContentBar'
import { WithPermissionsProps, WithLicenseCheckProps } from '../../../components'
import { ITradeEnriched } from '../store/types'
import { ILetterOfCredit } from '../../letter-of-credit-legacy/types/ILetterOfCredit'
import { Button, Dropdown } from 'semantic-ui-react'
import { tradeFinanceManager } from '@komgo/permissions'
import { IStandbyLetterOfCredit, IReceivablesDiscountingInfo, RDStatus } from '@komgo/types'
import { productRD } from '@komgo/products'
import { TradingRole } from '../constants'
import {
  getTradeActionsForFinancialInstruments,
  TradeAction,
  getActionPermissions,
  canEditTrade,
  canDeleteTrade
} from '../utils/tradeActionUtils'
import { sentenceCaseWithAcronyms } from '../../../utils/casings'
import _ from 'lodash'
import { Strings } from '../../receivable-discounting-legacy/resources/strings'
import { ILetterOfCreditWithData } from '../../letter-of-credit/store/types'

const StyledHeader = styled.h1`
  display: inline-block;
`

export interface TradeViewContentBarProps extends WithPermissionsProps, WithLicenseCheckProps {
  trade: ITradeEnriched
  role: TradingRole
  legacyLetterOfCredit?: ILetterOfCredit
  standbyLetterOfCredit?: IStandbyLetterOfCredit
  letterOfCredit?: ILetterOfCreditWithData
  rdInfo?: IReceivablesDiscountingInfo
  isStatusFetching: boolean
  hideDeleteButton?: boolean
  hideApplyButtons?: boolean
  onButtonClick: (action?: TradeAction) => void
  onDelete: () => void
}

const renderApplyForFinancing = (actions: TradeAction[], isAuthorized, onButtonClick, hideApplyButtons) => {
  if (hideApplyButtons) {
    return
  }
  const applyActions = actions.filter(action => ![TradeAction.ViewLC, TradeAction.ViewSBLC].includes(action))

  if (applyActions.length > 0) {
    return applyActions.length === 1 ? (
      <Button
        disabled={!_.some(getActionPermissions(applyActions[0]), isAuthorized)}
        primary={true}
        onClick={() => onButtonClick(applyActions[0])}
      >
        {sentenceCaseWithAcronyms(applyActions[0], ['SBLC', 'LC'])}
      </Button>
    ) : (
      <Dropdown
        text="Apply for financing"
        floating={true}
        button={true}
        className="primary"
        direction="left"
        data-test-id="apply-for-financing"
      >
        <Dropdown.Menu>
          {applyActions.map(action => (
            <Dropdown.Item
              key={action}
              data-test-id={`action-${action}`}
              disabled={!_.some(getActionPermissions(action), isAuthorized)}
              content={sentenceCaseWithAcronyms(action, ['SBLC', 'LC'])}
              onClick={() => onButtonClick(action)}
            />
          ))}
        </Dropdown.Menu>
      </Dropdown>
    )
  }
}

const renderViewFinancialInstrumentsActions = (actions: TradeAction[], isAuthorized, onButtonClick) => {
  const viewActions = actions.filter(action => [TradeAction.ViewLC, TradeAction.ViewSBLC].includes(action))
  if (viewActions.length > 0) {
    return viewActions.map(action => (
      <Button
        key={action}
        disabled={!_.some(getActionPermissions(action), isAuthorized)}
        data-test-id={`action-${action}`}
        primary={true}
        onClick={() => onButtonClick(action)}
      >
        {sentenceCaseWithAcronyms(action, ['SBLC', 'LC'])}
      </Button>
    ))
  }
}

const showRDButton = (role: TradingRole, rdInfo?: IReceivablesDiscountingInfo) => {
  const canApply: boolean = !rdInfo || rdInfo.status === RDStatus.PendingRequest
  return role === TradingRole.SELLER && canApply
}

export const TradeViewContentBar: React.SFC<TradeViewContentBarProps> = ({
  trade,
  role,
  legacyLetterOfCredit,
  standbyLetterOfCredit,
  letterOfCredit,
  rdInfo,
  isStatusFetching,
  onButtonClick,
  isLicenseEnabled,
  isAuthorized,
  onDelete,
  hideApplyButtons = false,
  hideDeleteButton = false
}) => {
  const actions = getTradeActionsForFinancialInstruments(
    trade,
    role,
    legacyLetterOfCredit,
    standbyLetterOfCredit,
    letterOfCredit
  )

  return (
    <ContentBar>
      <StyledHeader>Trade details</StyledHeader>
      <div>
        {canEditTrade(trade, rdInfo && rdInfo.status) &&
          isAuthorized(tradeFinanceManager.canCrudTrades) && (
            <Link className="ui button" to={`/trades/${trade!._id}/edit`} data-test-id="edit-trade">
              Edit
            </Link>
          )}
        {canDeleteTrade(trade, legacyLetterOfCredit, standbyLetterOfCredit, letterOfCredit, hideDeleteButton) &&
          isAuthorized(tradeFinanceManager.canCrudTrades) && (
            <Button data-test-id="delete-trade" onClick={onDelete}>
              Delete
            </Button>
          )}

        {!isStatusFetching && renderViewFinancialInstrumentsActions(actions, isAuthorized, onButtonClick)}
        {!isStatusFetching && renderApplyForFinancing(actions, isAuthorized, onButtonClick, hideApplyButtons)}
        {!isStatusFetching &&
          showRDButton(role, rdInfo) && (
            <Button
              primary={true}
              onClick={() => onButtonClick()}
              disabled={!isLicenseEnabled(productRD)}
              data-test-id="apply-for-discounting"
            >
              {Strings.ApplyForDiscountingRiskCoverActionText}
            </Button>
          )}
      </div>
    </ContentBar>
  )
}
