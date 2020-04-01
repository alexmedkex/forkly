import 'reflect-metadata'
import mockAxios from 'axios'
import { ICompanyRegistryService } from './ICompanyRegistryService'
import CompanyRegistryService from './CompanyRegistryService'

const STATIC_ID = 'id1'
const members = ['member1', 'member2']

const cacheMembersResponse = {
  data: [
    {
      node: '0x35aebb69355319478893e918a54eb50f1dd6c9fc8c718d778a3efb6ff38541af',
      parentNode: '0x9c19ca3566862e19c7779f1af09f5b2883d8880917cedcbf4ae505a775fa518a',
      label: '0x50506244df94df6fc142059d9381a2bd6aec530be531e98171632be03f9236cf',
      owner: '0x8304cB99e989EE34af465Db1CF15E369D8402870',
      nodeKeys: '["aaaaaaaaaaaaaaaaa+qYKn0VY1u7+RVmQ="]',
      isFinancialInstitution: true,
      isMember: true
    },
    {
      node: '0xffaebb69355319478893e918a54eb50f1dd6c9fc8c718d778a3efb6ff38541af',
      parentNode: '0x9c19ca3566862e19c7779f1af09f5b2883d8880917cedcbf4ae505a775fa518a',
      label: '0xff506244df94df6fc142059d9381a2bd6aec530be531e98171632be03f9236cf',
      owner: '0x8304cB99e989EE34af465Db1CF15E369D8402870',
      nodeKeys: '["bbbbbbbbbbbbbbbbbb+qYKn0VY1u7+RVmQ=","ccccccccccccccc+qYKn0VY1u7+RVmQ="]',
      isFinancialInstitution: true,
      isMember: true
    }
  ]
}

const cacheMembersResponseWitANonMember = {
  data: [
    {
      node: '0x35aebb69355319478893e918a54eb50f1dd6c9fc8c718d778a3efb6ff38541af',
      parentNode: '0x9c19ca3566862e19c7779f1af09f5b2883d8880917cedcbf4ae505a775fa518a',
      label: '0x50506244df94df6fc142059d9381a2bd6aec530be531e98171632be03f9236cf',
      owner: '0x8304cB99e989EE34af465Db1CF15E369D8402870',
      nodeKeys: '["aaaaaaaaaaaaaaaaa+qYKn0VY1u7+RVmQ="]',
      isFinancialInstitution: true,
      isMember: true
    },
    {
      node: '0xffaebb69355319478893e918a54eb50f1dd6c9fc8c718d778a3efb6ff38541af',
      parentNode: '0x9c19ca3566862e19c7779f1af09f5b2883d8880917cedcbf4ae505a775fa518a',
      label: '0xff506244df94df6fc142059d9381a2bd6aec530be531e98171632be03f9236cf',
      owner: '0x8304cB99e989EE34af465Db1CF15E369D8402870',
      nodeKeys: '["bbbbbbbbbbbbbbbbbb+qYKn0VY1u7+RVmQ=","ccccccccccccccc+qYKn0VY1u7+RVmQ="]',
      isFinancialInstitution: true,
      isMember: false
    }
  ]
}

const expectedNodeKeys = [
  'aaaaaaaaaaaaaaaaa+qYKn0VY1u7+RVmQ=',
  'bbbbbbbbbbbbbbbbbb+qYKn0VY1u7+RVmQ=',
  'ccccccccccccccc+qYKn0VY1u7+RVmQ='
]

const expectedNodeKeysOnlyMember = ['aaaaaaaaaaaaaaaaa+qYKn0VY1u7+RVmQ=']

describe('CompanyRegistryService', () => {
  let service: ICompanyRegistryService

  beforeEach(() => {
    service = new CompanyRegistryService('http://api-registry')
  })

  it('getEntryFromStaticId', async () => {
    mockAxios.get = jest.fn().mockImplementationOnce(() => cacheMembersResponse[0])
    const result = await service.getMember(STATIC_ID)
    expect(cacheMembersResponse[0]).toEqual(result)
  })

  it('get NodeKeys', async () => {
    mockAxios.get = jest.fn().mockImplementationOnce(() => cacheMembersResponse)
    const result = await service.getNodeKeys(members)
    expect(result).toEqual(expectedNodeKeys)
  })

  it('get NodeKeys only member', async () => {
    mockAxios.get = jest.fn().mockImplementationOnce(() => cacheMembersResponseWitANonMember)
    const result = await service.getNodeKeys(members)
    expect(result).toEqual(expectedNodeKeysOnlyMember)
  })

  it('get members by node value', async () => {
    mockAxios.get = jest.fn().mockImplementationOnce(() => cacheMembersResponse)
    const result = await service.getMembersByNode([])
    expect(result).toEqual(cacheMembersResponse.data)
  })
})
