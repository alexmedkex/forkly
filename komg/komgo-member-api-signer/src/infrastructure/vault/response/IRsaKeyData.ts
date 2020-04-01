export default interface IRsaKeyData {
  key: string
  mongoMigration?: {
    _id: string
    validFrom: number
    validTo?: number
  }
}
