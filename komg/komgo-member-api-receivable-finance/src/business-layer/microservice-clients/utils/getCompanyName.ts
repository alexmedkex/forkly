import { ErrorCode } from '@komgo/error-utilities'
import { LogstashCapableLogger } from '@komgo/logging'

import { ErrorName } from '../../../ErrorName'

export function getCompanyName(companyDetails: any, logger: LogstashCapableLogger) {
  if (companyDetails.x500Name) {
    return companyDetails.x500Name.O
  }

  logger.warn(ErrorCode.Configuration, ErrorName.CompanyNameNotFound, { entry: companyDetails })
  return 'Unknown'
}
