import { ErrorCode } from '@komgo/error-utilities'
import { LogstashCapableLogger } from '@komgo/logging'

import { ErrorName } from '../../../ErrorName'
import { UpdateType } from '../../types'

export function getSectionName(updateType: UpdateType, logger: LogstashCapableLogger): string {
  if (updateType === UpdateType.ReceivablesDiscounting) {
    return 'Receivable discounting data'
  } else if (updateType === UpdateType.FinalAgreedTermsData) {
    return 'Agreed terms'
  } else if (updateType === UpdateType.TradeSnapshot) {
    return 'Trade'
  }

  logger.warn(ErrorCode.Configuration, ErrorName.SectionNotFound, { updateType })
  return 'Unknown section'
}
