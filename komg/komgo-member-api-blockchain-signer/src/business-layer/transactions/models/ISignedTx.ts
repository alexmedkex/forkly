/**
 * Locally signed public transaction
 */
export interface ISignedTx {
  // Signed transaction in the format for web3js
  serializedTx: string
  // Calculated hash in "hex" format
  hash: string
}
