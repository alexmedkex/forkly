import IRsaKeyData from './IRsaKeyData'

export interface KvReadResponse {
  data: IRsaKeyData
  metadata: {
    created_time: Date
    deletion_time?: Date
    destroyed: boolean
    version: number
  }
}
