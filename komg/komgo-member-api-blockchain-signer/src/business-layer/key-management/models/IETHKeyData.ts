export interface IETHPublicData {
  address: string
  publicKey: string
  publicKeyCompressed: string
}

export interface IETHKeyData extends IETHPublicData {
  privateKey: string
}
