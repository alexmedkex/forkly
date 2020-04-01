import IKeyData from './IKeyData'

export interface KvReadResponse {
  data: IKeyData
  metadata: {
    created_time: Date
    deletion_time?: Date
    destroyed: boolean
    version: number
  }
}
