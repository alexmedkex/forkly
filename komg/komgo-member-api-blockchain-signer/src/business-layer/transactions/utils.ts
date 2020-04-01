import EthCrypto from 'eth-crypto'
import Tx from 'ethereumjs-tx'
const RLP = require('rlp')

import { TransactionType } from '../../utils/Metrics'

import { IRawTx, ISignedTx } from './models'

export function isPrivateTx(rawTx: IRawTx) {
  return 'privateFor' in rawTx
}

export function transactionTypeFor(rawTx: IRawTx): TransactionType {
  if (isPrivateTx(rawTx)) return TransactionType.Private

  return TransactionType.Public
}

export function signPublicTx(rawTx: IRawTx, nonce: number, privateKey: any): ISignedTx {
  const txWithNonce = {
    ...(rawTx as any),
    nonce // Because `eth-crypto` does not have the `nonce` field in `RawTx` type definition
  }

  const serializedTx = EthCrypto.signTransaction(txWithNonce, privateKey)

  const hash = calculateTxHash(serializedTx)

  return {
    serializedTx,
    hash
  }
}

/**
 * Locally compute a hash of a signed transaction
 * @param serializedTx signed Ethereum transaction
 */
function calculateTxHash(serializedTx: string) {
  const serializedTxBuffer = Buffer.from(serializedTx, 'hex')
  // Decode transaction from RLP encoding to a JSON object
  const signedTx = RLP.decode(serializedTxBuffer)
  const tx = new Tx(signedTx)
  // Calling "hash" method without parameters will calculate the hash of a signed transaction
  const hash = '0x' + tx.hash().toString('hex')
  return hash
}
