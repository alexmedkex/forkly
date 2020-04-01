import { getNextContractAddress } from './utils'

const web3Utils = require('web3-utils')

describe('utils', () => {
  it('should create contract address', async () => {
    const address = await getNextContractAddress(0, '0xCB00CDE33a7a0Fba30C63745534F1f7Ae607076b')
    expect(web3Utils.isAddress(address)).toBeTruthy()
  })
})
