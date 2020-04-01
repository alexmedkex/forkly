import 'reflect-metadata'

import Attribute from '../models/Attribute'
import { TransactionData } from '../models/TransactionData'
import { IContractArtifacts } from '../smart-contracts/IContractArtifacts'

import AttributeDataAgent from './AttributeDataAgent'

const genericError = new Error('Error: something went wrong')
const RESOLVER_SET_TEXT_DATA = '0x001'
const newAttribute = new Attribute('a', 'b')
const CONTRACT_ADDRESS = '0x123456'

const returnSetTextData: MockInstance = jest.fn(async () => {
  return RESOLVER_SET_TEXT_DATA
})

const mockKomgoResolverInstance = {
  address: CONTRACT_ADDRESS,
  contract: {
    setText: {
      getData: returnSetTextData
    }
  }
}

const mockContractArtifacts: IContractArtifacts = {
  komgoResolver: () => mockKomgoResolverInstance,
  resolverForNode: jest.fn().mockImplementation(() => mockKomgoResolverInstance)
}

describe('addAttribute', () => {
  let attributeDataAgent

  beforeEach(() => {
    attributeDataAgent = new AttributeDataAgent(mockContractArtifacts)
  })

  it('should return the hash if getData succeeds.', async () => {
    const data = await attributeDataAgent.getAddAttributeData('com.komgo', newAttribute)

    expect(data).toEqual(new TransactionData(CONTRACT_ADDRESS, RESOLVER_SET_TEXT_DATA))
  })

  it('should throw an error if getData fails', async () => {
    returnSetTextData.mockReturnValue(Promise.reject(genericError))

    const asyncData = attributeDataAgent.getAddAttributeData('com.komgo', newAttribute)

    await expect(asyncData).rejects.toEqual(genericError)
  })
})
