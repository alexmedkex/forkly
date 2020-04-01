import 'reflect-metadata'
import { IMemberDAO } from '../../dao/IMemberDAO'

import { ABIChangedDataAgent } from './ABIChangedDataAgent'
import { AddrChangedDataAgent } from './AddrChangedDataAgent'
import { EthPubKeyAddedDataAgent } from './EthPubKeyAddedDataAgent'
import { EthPubKeyRevokedDataAgent } from './EthPubKeyRevokedDataAgent'
import { IEventDataAgent } from './IEventDataAgent'
import { KomgoMessagingPubKeyAddedDataAgent } from './KomgoMessagingPubKeyAddedDataAgent'
import { KomgoMessagingPubKeyRevokedDataAgent } from './KomgoMessagingPubKeyRevokedDataAgent'
import { NewOwnerDataAgent } from './NewOwnerDataAgent'
import { NewResolverDataAgent } from './NewResolverDataAgent'
import { RegistryCacheDataAgent } from './RegistryCacheDataAgent'
import { ReverseNodeChangedDataAgent } from './ReverseNodeChangedDataAgent'
import { TextChangedDataAgent } from './TextChangedDataAgent'
import { TransferDataAgent } from './TransferDataAgent'
import { VaktMessagingPubKeyAddedDataAgent } from './VaktMessagingPubKeyAddedDataAgent'
import { VaktMessagingPubKeyRevokedDataAgent } from './VaktMessagingPubKeyRevokedDataAgent'
import { IRegistryEventManagerDAO } from '../../dao/IRegistryEventManagerDAO'
import { ContentNotFoundException } from '../../../exceptions'
import Web3 from 'Web3'
import createMockInstance from 'jest-create-mock-instance'

class mockEventDataAgent implements IEventDataAgent {
  async saveEvent(event: any): Promise<any> {
    return 'test'
  }
}

const memberDaoMock: IMemberDAO = {
  clearAll: jest.fn(),
  findByParentAndLabel: jest.fn(),
  createNewMemberCompany: jest.fn(),
  updateOwner: jest.fn(),
  updateResolver: jest.fn(),
  updateAddress: jest.fn(),
  addEthPubKey: jest.fn(),
  revokeEthPubKey: jest.fn(),
  addKomgoMessagingPubKey: jest.fn(),
  revokeKomgoMessagingPubKey: jest.fn(),
  addVaktMessagingPubKey: jest.fn(),
  revokeVaktMessagingPubKey: jest.fn(),
  updateReverseNode: jest.fn(),
  getMembers: jest.fn(),
  updateAbi: jest.fn(),
  updateField: jest.fn()
}

const eventMock: IRegistryEventManagerDAO = {
  clearAll: jest.fn(),
  createOrUpdate: jest.fn(),
  getLastEventProcessed: jest.fn()
}

const existingMember = {
  node: 'node1'
}

const komgoProducts = [
  {
    productName: 'Kyc',
    productId: 'KYC'
  },
  {
    productName: 'Letter Of Credit',
    productId: 'LC'
  }
]

const validGetMembersReturnValue = [
  {
    node: 'test',
    parentNode: 'test',
    label: 'test',
    owner: 'test',
    resolver: 'test',
    address: 'test',
    komgoProducts
  },
  {
    node: 'test',
    parentNode: 'test',
    label: 'test',
    owner: 'test',
    resolver: 'test',
    address: 'test',
    komgoProducts
  }
]

const validGetMembersWithoutProductsValue = [
  {
    node: 'test',
    parentNode: 'test',
    label: 'test',
    owner: 'test',
    resolver: 'test',
    address: 'test',
    komgoProducts: undefined
  }
]

const validGetMembersInput = "{ test: 'test' }"

const mockWeb3 = {
  eth: {
    net: {
      getId: jest.fn().mockImplementation(() => 1)
    },
    getAccounts: jest.fn().mockImplementation(() => ['0x0'])
  },
  utils: {
    toAscii: jest.fn().mockImplementation(() => '[]'),
    toBN: jest.fn().mockImplementation(() => 1)
  }
}

const registryCacheDataAgent = new RegistryCacheDataAgent(
  memberDaoMock,
  eventMock,
  new NewOwnerDataAgent(memberDaoMock, mockWeb3),
  new TransferDataAgent(memberDaoMock, mockWeb3),
  new NewResolverDataAgent(memberDaoMock, mockWeb3),
  new AddrChangedDataAgent(memberDaoMock, mockWeb3),
  new EthPubKeyAddedDataAgent(memberDaoMock, mockWeb3),
  new EthPubKeyRevokedDataAgent(memberDaoMock, mockWeb3),
  new KomgoMessagingPubKeyAddedDataAgent(memberDaoMock, mockWeb3),
  new KomgoMessagingPubKeyRevokedDataAgent(memberDaoMock, mockWeb3),
  new VaktMessagingPubKeyAddedDataAgent(memberDaoMock, mockWeb3),
  new VaktMessagingPubKeyRevokedDataAgent(memberDaoMock, mockWeb3),
  new TextChangedDataAgent(memberDaoMock, mockWeb3),
  new ReverseNodeChangedDataAgent(memberDaoMock, mockWeb3),
  new ABIChangedDataAgent(memberDaoMock, mockWeb3)
)

describe('getMembers', () => {
  it('should return an array of members.', async () => {
    memberDaoMock.getMembers.mockImplementation(() => validGetMembersReturnValue)
    const members = await registryCacheDataAgent.getMembers(validGetMembersInput)
    expect(members).toEqual(validGetMembersReturnValue)
  })

  it('should throw an error if no members were found.', async () => {
    memberDaoMock.getMembers.mockImplementation(() => undefined)
    let error
    try {
      const members = await registryCacheDataAgent.getMembers(validGetMembersInput)
    } catch (e) {
      error = e
    }
    expect(error).toEqual(new ContentNotFoundException('No member matching the inquiry was found.'))
  })
})

describe('getProducts', () => {
  it('should return an array of products if they are loaded', async () => {
    memberDaoMock.getMembers.mockImplementation(() => validGetMembersReturnValue)
    const products = await registryCacheDataAgent.getProducts(validGetMembersInput)
    expect(products).toEqual(komgoProducts)
  })
  it('should return an array of products if they are not loaded', async () => {
    memberDaoMock.getMembers.mockImplementation(() => validGetMembersWithoutProductsValue)
    const products = await registryCacheDataAgent.getProducts(validGetMembersInput)
    expect(products).toEqual([])
  })
})

describe('clearCache', () => {
  it('should call IMemberDao.clearAll', async () => {
    await registryCacheDataAgent.clearCache()
    expect(memberDaoMock.clearAll).toHaveBeenCalledTimes(1)
    expect(eventMock.clearAll).toHaveBeenCalledTimes(1)
  })
})

describe('newOwner', () => {
  it('should call IMemberDao.createNewMemberCompany', async () => {
    await registryCacheDataAgent.saveSingleEvent({ name: 'NewOwner' })
    expect(memberDaoMock.createNewMemberCompany).toHaveBeenCalledTimes(1)
  })

  it('should call IMemberDao.updateOwner', async () => {
    memberDaoMock.findByParentAndLabel.mockImplementation(() => existingMember)
    await registryCacheDataAgent.saveSingleEvent({ name: 'NewOwner' })
    expect(memberDaoMock.updateOwner).toHaveBeenCalledTimes(1)
  })
})

describe('Transfer', () => {
  it('should call IMemberDao.updateOwner', async () => {
    await registryCacheDataAgent.saveSingleEvent({ name: 'Transfer' })
    expect(memberDaoMock.updateOwner).toHaveBeenCalledTimes(1)
  })
})

describe('NewResolver', () => {
  it('should call IMemberDao.updateResolver', async () => {
    await registryCacheDataAgent.saveSingleEvent({ name: 'NewResolver' })
    expect(memberDaoMock.updateResolver).toHaveBeenCalledTimes(1)
  })
})

describe('AddrChanged', () => {
  it('should call IMemberDao.updateAddress', async () => {
    await registryCacheDataAgent.saveSingleEvent({ name: 'AddrChanged' })
    expect(memberDaoMock.updateAddress).toHaveBeenCalledTimes(1)
  })
})

describe('ABIChanged', () => {
  it('should call IMemberDao.updateAbi', async () => {
    await registryCacheDataAgent.saveSingleEvent({ name: 'ABIChanged', data: '0x00' })
    expect(memberDaoMock.updateAbi).toHaveBeenCalledTimes(1)
  })
})

describe('EthPubKeyAdded', () => {
  it('should call IMemberDao.addEthPubKey', async () => {
    await registryCacheDataAgent.saveSingleEvent({ name: 'EthPubKeyAdded' })
    expect(memberDaoMock.addEthPubKey).toHaveBeenCalledTimes(1)
  })
})

describe('EthPubKeyRevoked', () => {
  it('should call IMemberDao.revokeEthPubKey', async () => {
    await registryCacheDataAgent.saveSingleEvent({ name: 'EthPubKeyRevoked' })
    expect(memberDaoMock.revokeEthPubKey).toHaveBeenCalledTimes(1)
  })
})

describe('KomgoMessagingPubKeyAdded', () => {
  it('should call IMemberDao.addKomgoMessagingPubKey', async () => {
    await registryCacheDataAgent.saveSingleEvent({ name: 'KomgoMessagingPubKeyAdded' })
    expect(memberDaoMock.addKomgoMessagingPubKey).toHaveBeenCalledTimes(1)
  })
})

describe('KomgoMessagingPubKeyRevoked', () => {
  it('should call IMemberDao.addKomgoMessagingPubKey', async () => {
    await registryCacheDataAgent.saveSingleEvent({ name: 'KomgoMessagingPubKeyRevoked' })
    expect(memberDaoMock.revokeKomgoMessagingPubKey).toHaveBeenCalledTimes(1)
  })
})

describe('VaktMessagingPubKeyAdded', () => {
  it('should call IMemberDao.addVaktMessagingPubKey', async () => {
    await registryCacheDataAgent.saveSingleEvent({ name: 'VaktMessagingPubKeyAdded' })
    expect(memberDaoMock.addVaktMessagingPubKey).toHaveBeenCalledTimes(1)
  })
})

describe('VaktMessagingPubKeyRevoked', () => {
  it('should call IMemberDao.revokeVaktMessagingPubKey', async () => {
    await registryCacheDataAgent.saveSingleEvent({ name: 'VaktMessagingPubKeyRevoked' })
    expect(memberDaoMock.revokeVaktMessagingPubKey).toHaveBeenCalledTimes(1)
  })
})

describe('ReverseNodeChanged', () => {
  it('should call IMemberDao.updateReverseNode', async () => {
    await registryCacheDataAgent.saveSingleEvent({ name: 'ReverseNodeChanged' })
    expect(memberDaoMock.updateReverseNode).toHaveBeenCalledTimes(1)
  })
})

describe('Unkown event', () => {
  it('should not have called any methods', async () => {
    await registryCacheDataAgent.saveSingleEvent({ name: 'Nothing' })
    expect(memberDaoMock.clearAll).toHaveBeenCalledTimes(0)
    expect(memberDaoMock.createNewMemberCompany).toHaveBeenCalledTimes(0)
    expect(memberDaoMock.updateOwner).toHaveBeenCalledTimes(0)
    expect(memberDaoMock.updateResolver).toHaveBeenCalledTimes(0)
    expect(memberDaoMock.updateAddress).toHaveBeenCalledTimes(0)
    expect(memberDaoMock.addEthPubKey).toHaveBeenCalledTimes(0)
    expect(memberDaoMock.revokeEthPubKey).toHaveBeenCalledTimes(0)
    expect(memberDaoMock.addKomgoMessagingPubKey).toHaveBeenCalledTimes(0)
    expect(memberDaoMock.revokeKomgoMessagingPubKey).toHaveBeenCalledTimes(0)
    expect(memberDaoMock.addVaktMessagingPubKey).toHaveBeenCalledTimes(0)
    expect(memberDaoMock.revokeVaktMessagingPubKey).toHaveBeenCalledTimes(0)
    expect(memberDaoMock.updateReverseNode).toHaveBeenCalledTimes(0)
    expect(memberDaoMock.updateAbi).toHaveBeenCalledTimes(0)
  })
})
