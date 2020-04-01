import { checksumAddress } from './checksumAddress'

const ADDRESS = '0xa0c2bae464ef41e9457a69d5e125be64d07fa905'
const CHECKSUM_ADDRESS = '0xA0C2bAe464eF41e9457A69D5E125Be64D07FA905'

describe('checksumAddress', () => {
  it('should return the checksum address successfully', () => {
    const result = checksumAddress(ADDRESS)
    expect(result).toEqual(CHECKSUM_ADDRESS)
  })

  it('should fail if address is not a valid address', () => {
    const invalidAddress = 'notAnAddress'
    try {
      checksumAddress(invalidAddress)
      fail('Expected failure')
    } catch (error) {
      expect(error.message).toEqual(`Given address "${invalidAddress}" is not a valid Ethereum address.`)
    }
  })
})
