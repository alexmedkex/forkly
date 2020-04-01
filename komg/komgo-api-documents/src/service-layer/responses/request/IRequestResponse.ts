export interface IOutgoingRequestResponse {
  id: string
  productId: string
  companyId: string
  types: string[]
  forms?: string[]
  deadline?: Date
}
