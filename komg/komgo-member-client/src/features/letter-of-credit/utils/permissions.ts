import { tradeFinanceManager } from '@komgo/permissions'
import { PermissionFullId } from '../../role-management/store/types'

type Authorizer = (permissions: PermissionFullId) => boolean

export const hasSomeLetterOfCreditPermissions = (isAuthorized: Authorizer) => {
  return (
    isAuthorized(tradeFinanceManager.canReadReviewIssuedLC) ||
    isAuthorized(tradeFinanceManager.canReadWriteReviewIssuedLC) ||
    isAuthorized(tradeFinanceManager.canManageLCRequests) ||
    isAuthorized(tradeFinanceManager.canManageCollections) ||
    isAuthorized(tradeFinanceManager.canManagePresentations) ||
    isAuthorized(tradeFinanceManager.canReadReviewPresentation) ||
    isAuthorized(tradeFinanceManager.canReadWriteReviewPresentation) ||
    isAuthorized(tradeFinanceManager.canReadReviewLCApp) ||
    isAuthorized(tradeFinanceManager.canReadWriteReviewLCApp)
  )
}
