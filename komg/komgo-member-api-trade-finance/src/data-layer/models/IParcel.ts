export interface IParcel {
  id?: string
  laycanPeriod: { startDate: Date; endDate: Date }
  modeOfTransport?: string
  vesselIMO?: number
  vesselName?: string
  loadingPort?: string
  dischargeArea?: string
  inspector?: string
  deemedBLDate?: Date
  quantity: number
}
