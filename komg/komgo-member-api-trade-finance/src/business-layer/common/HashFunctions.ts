const namehash = require('eth-ens-namehash')
const web3Utils = require('web3-utils')

export const hashMessageWithCallData = (contractAddress: string, nonce: number, callData: any) => {
  if (callData.length === 0) {
    throw new Error('Invalid calldata length')
  }
  let callDataWithoutVRS = callData.slice(0, 10)
  if (callData.length > 2 + 2 * 4 + 3 * 2 * 32) {
    callDataWithoutVRS += callData.slice(2 + 2 * 4 + 3 * 2 * 32)
  }
  return hashMessageWithNonce(contractAddress, nonce, callDataWithoutVRS)
}

export const hashMessageWithNonce = (contractAddress: string, nonce: number, message: string) => {
  if (contractAddress.length !== 2 * 20 + 2) {
    throw new Error('Invalid address length')
  }
  if (nonce <= 0) {
    throw new Error('Invalid nonce')
  }
  if (message.length === 0) {
    throw new Error('Invalid message length')
  }
  let msgHash = web3Utils.soliditySha3(message)
  if (msgHash.startsWith('0x')) {
    msgHash = msgHash.slice(2)
  }

  const nonceHex = numberToHex(nonce)
  const concatenated = `${contractAddress}${nonceHex}${msgHash}`

  return web3Utils.soliditySha3(concatenated)
}

export const soliditySha3 = (message: string) => {
  return web3Utils.soliditySha3(message)
}

export const numberToHex = (num: number) => {
  let s = num.toString(16)
  const size = Math.ceil(s.length / 2) * 2
  // Pad to even number of digits
  while (s.length < (size || 2)) {
    s = '0' + s
  }
  return s
}

export const toDecimal = (source: string) => {
  return web3Utils.toDecimal(source)
}

export const HashMetaDomain = (source: string) => {
  return namehash.hash(`${source}.meta.komgo`)
}
