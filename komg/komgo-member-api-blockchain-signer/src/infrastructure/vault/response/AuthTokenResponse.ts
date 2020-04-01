export interface AuthTokenResponse {
  request_id: string
  lease_id: string
  renewable: boolean
  lease_duration: number
  auth: {
    client_token: string
    accessor: string
    policies: string[]
    token_policies: string[]
    lease_duration: number
    renewable: boolean
  }
}
