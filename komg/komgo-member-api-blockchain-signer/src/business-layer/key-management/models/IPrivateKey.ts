export default interface IPrivateKey {
  address: string
  crypto: {
    cipher: string
    ciphertext: string
    cipherparams: {
      iv: string
    }
    kdf: string
    kdfparams: {
      dklen: number
      n: number
      p: number
      r: number
      salt: string
    }
    mac: string
  }
  id: string
  version: number
}
