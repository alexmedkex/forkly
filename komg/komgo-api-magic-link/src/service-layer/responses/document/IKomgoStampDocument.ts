export interface IKomgoStampDocument {
  registered?: boolean
  deactivated: boolean
  documentInfo?: {
    registeredBy: string
    registeredAt: number
  }
}
