import { ErrorCode } from '@komgo/error-utilities'
import { LogstashCapableLogger } from '@komgo/logging'
import { IReceivablesDiscountingBase, IReceivablesDiscounting } from '@komgo/types'

import { ValidationFieldError } from '../business-layer/errors'
import { ErrorName } from '../ErrorName'

import { diffObjects } from './object-diff'

export const RECEIVABLE_DISCOUNTING_UNEDITABLE_FIELDS: Array<Partial<keyof IReceivablesDiscountingBase>> = [
  'currency',
  'tradeReference',
  'advancedRate'
]

/**
 * Validates that a new entity is not editing uneditable fields
 *
 * @param oldEntity old entity
 * @param newEntity new entity
 * @param uneditableFieldsList uneditable fields from the entity
 * @param logger logger
 */
export function validateUpdateFields(
  oldEntity: any,
  newEntity: any,
  uneditableFieldsList: string[],
  logger: LogstashCapableLogger
) {
  const diff = diffObjects(oldEntity, newEntity)
  const uneditableFields = findUneditableFields(diff, uneditableFieldsList)
  if (uneditableFields.length > 0) {
    const validationErrors = uneditableFields.reduce((memo: any, key: any) => {
      return {
        [key]: ['Field is not editable'],
        ...memo
      }
    }, {})

    logger.error(
      ErrorCode.ValidationHttpContent,
      ErrorName.InvalidFieldsEdited,
      'Invalid fields edited',
      validationErrors
    )
    throw new ValidationFieldError('Unable to edit', validationErrors)
  }
}

/**
 * Removes _id from trade reference field
 */
export function stripTradeReferenceDBFields(rd: IReceivablesDiscounting) {
  return {
    ...rd,
    tradeReference: {
      sellerEtrmId: rd.tradeReference.sellerEtrmId,
      source: rd.tradeReference.source,
      sourceId: rd.tradeReference.sourceId
    }
  }
}

function findUneditableFields(diff: any, uneditableFieldsList: string[]): string[] {
  const changedFields = Object.keys(diff.deleted).concat(Object.keys(diff.updated), Object.keys(diff.added))
  return changedFields.filter(keyName => uneditableFieldsList.includes(keyName))
}
