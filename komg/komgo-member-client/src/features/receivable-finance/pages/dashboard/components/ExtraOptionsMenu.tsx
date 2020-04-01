import * as React from 'react'
import { withPermissions, WithPermissionsProps } from '../../../../../components'
import { tradeFinanceManager } from '@komgo/permissions'
import { Menu, Dropdown } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { DISABLED } from '../../../../trades/components/ExtraOptionsMenu'
import { ReceivablesDiscountingRole } from '../../../../receivable-discounting-legacy/utils/constants'
import { RDStatus } from '@komgo/types'
import { Strings } from '../../../../receivable-discounting-legacy/resources/strings'

export interface ExtraOptionsMenuForRDProps {
  rdId: string
  rdStatus: RDStatus
}

export interface ExtraOptionsMenuAllProps extends WithPermissionsProps {
  tradeTechnicalId?: string
  rdMenuProps?: ExtraOptionsMenuForRDProps
  role: ReceivablesDiscountingRole
}

export const createRDApplyForDiscountingLink = (tradeTechnicalId: string): string => {
  return `/receivable-discounting/${tradeTechnicalId}/apply`
}

interface IOption {
  label: string
  name: string
  buildLink: (props: ExtraOptionsMenuAllProps) => string
  isDisabled: (props: ExtraOptionsMenuAllProps) => boolean
  isVisible: (props: ExtraOptionsMenuAllProps) => boolean
}

export const isRDApplyForDiscountingValid = (menuProps: ExtraOptionsMenuForRDProps): boolean => {
  return !menuProps || !menuProps.rdId || (menuProps.rdStatus && menuProps.rdStatus === RDStatus.PendingRequest)
}

const applyforDiscountingIsDisabled = (props: ExtraOptionsMenuAllProps) =>
  !props.isAuthorized(tradeFinanceManager.canReadRD) || !isRDApplyForDiscountingValid(props.rdMenuProps)

const viewDiscountingQuotesIsVisible = (props: ExtraOptionsMenuAllProps) =>
  props.role === ReceivablesDiscountingRole.Trader &&
  props.rdMenuProps &&
  props.rdMenuProps.rdStatus !== RDStatus.PendingRequest

const reviewDiscountingRequestIsVisible = (props: ExtraOptionsMenuAllProps) =>
  props.role === ReceivablesDiscountingRole.Bank &&
  props.rdMenuProps &&
  props.rdMenuProps.rdStatus !== RDStatus.PendingRequest &&
  props.isAuthorized(tradeFinanceManager.canCrudRDRequests)

/**
 * Both trader and bank can view.
 * Hide if user is a bank and has canCrudRDRequests permission.
 * In this case we show 'review', not 'view' as the resulting
 * page will have buttons to accept or decline request.
 */
const viewDiscountingRequestIsVisible = (props: ExtraOptionsMenuAllProps) =>
  props.rdMenuProps &&
  props.rdMenuProps.rdStatus !== RDStatus.PendingRequest &&
  !(props.role === ReceivablesDiscountingRole.Bank && props.isAuthorized(tradeFinanceManager.canCrudRDRequests))

const viewDiscountingRequestIsDisabled = (props: ExtraOptionsMenuAllProps) =>
  (props.role === ReceivablesDiscountingRole.Bank && !props.isAuthorized(tradeFinanceManager.canReadRDRequests)) ||
  (props.role === ReceivablesDiscountingRole.Trader && !props.isAuthorized(tradeFinanceManager.canReadRD))

const APPLY_FOR_DISCOUNTING: IOption = {
  label: Strings.ApplyForDiscountingRiskCoverActionText,
  name: 'applyforDiscounting',
  buildLink: (props: ExtraOptionsMenuAllProps) => createRDApplyForDiscountingLink(props.tradeTechnicalId),
  isVisible: (props: ExtraOptionsMenuAllProps) => props.role === ReceivablesDiscountingRole.Trader,
  isDisabled: applyforDiscountingIsDisabled
}

const VIEW_DISCOUNTING_QOUTES: IOption = {
  label: 'View quotes',
  name: 'viewQuotes',
  buildLink: (props: ExtraOptionsMenuAllProps) => `/receivable-discounting/${props.rdMenuProps!.rdId}/quotes`,
  isVisible: viewDiscountingQuotesIsVisible,
  isDisabled: (props: ExtraOptionsMenuAllProps) => !props.isAuthorized(tradeFinanceManager.canReadRD)
}

const REVIEW_DISCOUNTING_REQUEST: IOption = {
  label: 'Review request',
  name: 'reviewRequest',
  buildLink: (props: ExtraOptionsMenuAllProps) => `/receivable-discounting/${props.rdMenuProps.rdId}`,
  isVisible: reviewDiscountingRequestIsVisible,
  isDisabled: () => false
}

const VIEW_DISCOUNTING_REQUEST: IOption = {
  label: 'View request',
  name: 'viewRequest',
  buildLink: (props: ExtraOptionsMenuAllProps) => `/receivable-discounting/${props.rdMenuProps.rdId}`,
  isVisible: viewDiscountingRequestIsVisible,
  isDisabled: viewDiscountingRequestIsDisabled
}

const RD_DASHBOARD_OPTIONS: IOption[] = [
  APPLY_FOR_DISCOUNTING,
  VIEW_DISCOUNTING_QOUTES,
  REVIEW_DISCOUNTING_REQUEST,
  VIEW_DISCOUNTING_REQUEST
]

export const ExtraOptionsMenu: React.FC<ExtraOptionsMenuAllProps> = (props: ExtraOptionsMenuAllProps) => {
  const usedOptions = RD_DASHBOARD_OPTIONS.filter(option => option.isVisible(props)).map(option => ({
    ...option,
    disabled: option.isDisabled(props)
  }))

  const availableOptions = usedOptions.map(({ disabled, name, buildLink, label }) => (
    <Dropdown.Item key={name} disabled={disabled} name={name}>
      <Link data-test-id={name} style={disabled ? DISABLED : {}} to={buildLink(props)}>
        {label}
      </Link>
    </Dropdown.Item>
  ))

  return (
    <Menu vertical={true} text={true} fluid={true} compact={true}>
      {availableOptions}
    </Menu>
  )
}

export default withPermissions(ExtraOptionsMenu)
