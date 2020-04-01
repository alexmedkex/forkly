export interface ICreateRsaKeyRequest {
  overwrite?: boolean
  passphrase?: string
  key?: IKeyData
}

export interface IKeyData {
  kty: string
  kid: string
  e: string
  n: string
  d: string
  p: string
  q: string
  dp: string
  dq: string
  qi: string
}
