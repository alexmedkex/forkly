import 'reflect-metadata'

import { DocumentRegistry } from './DocumentRegistry'

const registeredAt = 1566577086
const truffleContract = {
  getRegistrationInfo: jest.fn().mockResolvedValue(['companyId', `${registeredAt}`])
}

const smcProvider = {
  contractAddress: '0x0',
  getTruffleContract: jest.fn().mockResolvedValue(truffleContract)
}

describe('DocumentRegistry', () => {
  let docRegistry: DocumentRegistry

  beforeEach(() => {
    docRegistry = new DocumentRegistry(smcProvider, 'document.registry.domain')
  })

  it('should return document registration info', async () => {
    const result = await docRegistry.findDocument('docHash')
    expect(result).toEqual({
      companyStaticId: 'companyId',
      timestamp: registeredAt * 1000
    })
  })

  it('should call getTruffleContract once', async () => {
    await docRegistry.findDocument('docHash')
    await docRegistry.findDocument('docHash')
    expect(smcProvider.getTruffleContract).toHaveBeenCalledTimes(1)
  })

  it('should return undefined if document is not registered', async () => {
    truffleContract.getRegistrationInfo.mockRejectedValue(new Error('oops'))
    const result = await docRegistry.findDocument('docHash')
    expect(result).toEqual(undefined)
  })
})
