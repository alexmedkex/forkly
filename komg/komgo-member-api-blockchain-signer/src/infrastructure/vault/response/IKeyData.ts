import IPrivateKey from '../../../business-layer/key-management/models/IPrivateKey'

export default interface IKeyData {
  key: IPrivateKey
  mongoMigration?: {
    _id: string
    validFrom: number
    validTo?: number
  }
}
