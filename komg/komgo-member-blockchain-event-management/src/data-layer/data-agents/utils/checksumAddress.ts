import { toChecksumAddress } from 'web3-utils'

export const checksumAddress = (address: string) => {
  return toChecksumAddress(address)
}
