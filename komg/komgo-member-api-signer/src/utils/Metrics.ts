export enum CryptographyType {
  Rsa = 'rsa'
}

export enum CryptographyFunction {
  Sign = 'sign',
  Verify = 'verify',
  Encrypt = 'encrypt',
  Decrypt = 'decrypt'
}

export enum Metric {
  CryptographyType = 'cryptographyType',
  CryptographyFunction = 'cryptographyFunction'
}
