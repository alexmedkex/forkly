import { IReceivablesDiscountingBase } from '@komgo/types'

export function cleanDBFields(entity: any) {
  const { createdAt, updatedAt, _id, staticId, ...cleanEntity } = entity
  return cleanEntity
}

export function cleanDBFieldsFromRD(rd: IReceivablesDiscountingBase) {
  const cleanRD = cleanDBFields(rd)
  cleanRD.tradeReference = {
    sourceId: rd.tradeReference.sourceId,
    source: rd.tradeReference.source,
    sellerEtrmId: rd.tradeReference.sellerEtrmId
  }

  return cleanRD
}
