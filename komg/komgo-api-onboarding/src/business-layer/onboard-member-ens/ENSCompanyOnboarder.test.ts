import namehash = require('eth-ens-namehash')
import 'jest'
import * as jestMock from 'jest-mock'
import 'reflect-metadata'

import { IAPIRegistryCompany } from '../../infrastructure/api-registry/IAPIRegistryCompany'
import { ContractArtifacts } from '../../utils/contract-artifacts'

import { ENSCompanyOnboarder } from './ENSCompanyOnboarder'
import { IOnboardedCompany, IUpdateCompanyInfo } from './interfaces'

function mock(classType) {
  const mockType = jestMock.generateFromMetadata(jestMock.getMetadata(classType))
  return new mockType()
}

const mockContractArtifacts = mock(ContractArtifacts)
const mockWeb3inst = {
  eth: { getAccounts: jest.fn() }
}

const companyPackageMock: IOnboardedCompany = {
  x500Name: {
    CN: 'string',
    O: 'string',
    C: 'string',
    L: 'string',
    STREET: 'string',
    PC: 'string'
  },
  hasSWIFTKey: true,
  isFinancialInstitution: true,
  isMember: true,
  staticId: 'string',
  komgoMnid: 'string',
  messagingPublicKey: {
    validFrom: 'string',
    validTo: 'string',
    key: {
      kty: 'string',
      kid: 'string',
      e: 'string',
      n: 'string'
    }
  },
  vakt: {
    staticId: 'string',
    mnid: 'string',
    messagingPublicKey: {
      validFrom: 'string',
      validTo: 'string',
      key: {
        kty: 'string',
        kid: 'string',
        e: 'string',
        n: 'string'
      }
    }
  },
  ethereumPublicKey: {
    validFrom: 'string',
    validTo: 'string',
    address: 'string',
    key: 'string'
  },
  nodeKeys: 'string'
}

describe('ENSCompanyOnboarder', () => {
  let onboarder
  let addTextEntries
  let revokeVaktMessagingPublicKey
  let setVaktMessgingPublicKey
  let setOwnerMock

  beforeEach(() => {
    onboarder = new ENSCompanyOnboarder(mockContractArtifacts, '', mockWeb3inst)
    jest.resetAllMocks()
    mockWeb3inst.eth.getAccounts.mockResolvedValue(['0x00'])
    mockContractArtifacts.komgoRegistrar.mockResolvedValue({
      methods: {
        registerAndSetResolvers: jest.fn(() => ({ send: jest.fn().mockResolvedValue({ transactionHash: 'string' }) }))
      }
    })
    revokeVaktMessagingPublicKey = jest.fn(() => ({ send: jest.fn() }))
    setVaktMessgingPublicKey = jest.fn(() => ({ send: jest.fn() }))
    addTextEntries = jest.fn(() => ({ send: jest.fn() }))
    mockContractArtifacts.komgoOnboarder.mockResolvedValue({
      methods: {
        addCompanyOnboardingInformation: jest.fn(() => ({ send: jest.fn() })),
        addTextEntries,
        revokeVaktMessagingPublicKey,
        setVaktMessgingPublicKey,
        transferCompanyNodes: jest.fn(() => ({ send: jest.fn() }))
      },
      options: {
        address: 'string'
      }
    })

    setOwnerMock = jest.fn(() => ({ send: jest.fn() }))
    mockContractArtifacts.ensRegistry.mockResolvedValue({
      methods: {
        setOwner: setOwnerMock
      }
    })

    mockContractArtifacts.komgoMetaResolver.mockResolvedValue({
      methods: {
        staticId: jest.fn(() => ({ call: jest.fn().mockResolvedValue('string') }))
      }
    })
  })

  it('should onboard member', async () => {
    await onboarder.onboard(companyPackageMock)
    expect(mockContractArtifacts.komgoOnboarder).toBeCalled()
  })

  it('should deactivate company in ens registry', async () => {
    await onboarder.setDeactivated('some-id', false)
    expect(addTextEntries).toBeCalled()
  })

  it('updates company in ENS', async () => {
    const updateCompany: IUpdateCompanyInfo = {
      staticId: 'staticId',
      x500Name: companyPackageMock.x500Name,
      hasSWIFTKey: false,
      isFinancialInstitution: true,
      isMember: true,
      memberType: 'SMS'
    }
    const messagingPublicKey = {
      key: {
        kty: 'RSA',
        kid: 'kGsQES01QZxZp9wpd5Qx1oxT0SqG6NoQ4MfvLvt9acc',
        e: 'AQAB',
        n: 'n'
      },
      validFrom: '2019-06-24T13:43:55Z',
      validTo: '2020-06-24T16:43:55Z'
    }
    const companyFromENS: IAPIRegistryCompany = {
      node: 'node',
      komgoMessagingPubKeys: [],
      ethPubKeys: [],
      vaktMessagingPubKeys: [
        {
          key: JSON.stringify(messagingPublicKey.key),
          termDate: 123,
          current: false,
          revoked: true
        },
        {
          key: JSON.stringify(messagingPublicKey.key),
          termDate: 345,
          current: true,
          revoked: false
        }
      ],
      x500Name: companyPackageMock.x500Name,
      hasSWIFTKey: true,
      isFinancialInstitution: true,
      isMember: true,
      vaktMnid: 'vaktMnid',
      vaktStaticId: 'vaktStaticId',
      staticId: companyPackageMock.staticId,
      komgoMnid: companyPackageMock.komgoMnid,
      nodeKeys: '["my node key"]'
    }
    await onboarder.update(updateCompany, companyFromENS)

    expect(revokeVaktMessagingPublicKey).toHaveBeenCalledWith(namehash.hash(`${updateCompany.staticId}.meta.komgo`))
  })

  it('it should call setOwner when transfering ownership', async () => {
    await onboarder.transferEnsNodesOwnership('node', 'address')

    expect(setOwnerMock).toHaveBeenCalledWith('node', 'address')
  })

  it('updates non member company in ENS', async () => {
    const updateCompany: IUpdateCompanyInfo = {
      staticId: 'staticId',
      x500Name: companyPackageMock.x500Name,
      hasSWIFTKey: false,
      isFinancialInstitution: true,
      isMember: true
    }

    const companyFromENS = {
      node: 'node',
      x500Name: companyPackageMock.x500Name,
      hasSWIFTKey: true,
      isFinancialInstitution: true,
      isMember: false,
      staticId: companyPackageMock.staticId,
      komgoMnid: companyPackageMock.komgoMnid,
      nodeKeys: '["my node key"]'
    }

    await onboarder.update(updateCompany, companyFromENS)

    expect(addTextEntries).toHaveBeenCalled()
    expect(revokeVaktMessagingPublicKey).not.toHaveBeenCalled()
    expect(setVaktMessgingPublicKey).not.toHaveBeenCalled()
  })
})
