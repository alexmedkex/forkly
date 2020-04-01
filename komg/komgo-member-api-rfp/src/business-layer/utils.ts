import { ErrorCode } from '@komgo/error-utilities'

import { ErrorName } from '../ErrorName'

import InvalidDataError from './errors/InvalidDataError'

// receivable discounting sub-product ID
const RD_SUBPRODUCT_ID = 'rd'
// TODO: refactor to an npm package with all product names specified
export function getProductName(subProductId: string) {
  if (subProductId && subProductId === RD_SUBPRODUCT_ID) {
    return 'Receivable Discounting'
  }
  throw new InvalidDataError(`subProductId [${subProductId}] is not recognised`)
}

export function getSenderCompanyName(companyDetails: any, staticId: string) {
  let companyName = 'Unknown'
  if (companyDetails.x500Name) {
    companyName = companyDetails.x500Name.O
  } else {
    this.logger.warn(
      ErrorCode.Configuration,
      ErrorName.CompanyNameNotFound,
      `Company name not found for sender staticId: ${staticId}`
    )
  }
  return companyName
}
