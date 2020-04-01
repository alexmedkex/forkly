const RLP = require('rlp')
const web3Utils = require('web3-utils')

export const getNextContractAddress = async (nonce: number, from: string) => {
  const preComputedAddress =
    '0x' +
    web3Utils
      .sha3(RLP.encode([from, nonce]))
      .slice(12)
      .substring(14)
  return web3Utils.toChecksumAddress(preComputedAddress)
}
