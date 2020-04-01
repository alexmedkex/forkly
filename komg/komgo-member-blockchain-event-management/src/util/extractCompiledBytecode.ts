export const END_OF_BYTECODE = 'a165627a7a72305820'
export const END_OF_BYTECODE_ABI_ENCODER_V2 = 'a265627a7a72305820'
/**
 * On compilation, bytecode is appended with swarm hash of the JSON metadata and constructor arguments.
 * See https://solidity.readthedocs.io/en/develop/metadata.html for more info
 * The resulting bytecode is the 'init' code. The swarm hash above indicates the end of the bytecode
 *
 * Slices the bytecode by finding the free memory pointer hex string
 *
 * @param bytecode init bytecode
 *
 * @returns compiled bytecode
 */
export const extractCompiledBytecode = (bytecode: string) => {
  let endingPoint: number = bytecode.search(END_OF_BYTECODE)
  if (endingPoint === -1) {
    endingPoint = bytecode.search(END_OF_BYTECODE_ABI_ENCODER_V2)
  }
  return bytecode.slice(0, endingPoint)
}
