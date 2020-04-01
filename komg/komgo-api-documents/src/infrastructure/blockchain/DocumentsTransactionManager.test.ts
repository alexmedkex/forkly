import 'jest'
import 'reflect-metadata'

import { SignerApi } from '@komgo/api-blockchain-signer-client'
import createMockInstance from 'jest-create-mock-instance'

import { DocumentsTransactionManager } from './DocumentsTransactionManager'

const contractAddress = '0x123456'
const abi = ['abi']
const networkId = 'networkId'

const documentContent = 'somecontent'
const documentContentSigned = 'somecontentsigned'

const documentHash = 'documentHash'
const documentID = 'documentID'
const transactionId = 'transactionId'

const publishDocumentHashTX = { encodeABI: jest.fn() }
const docRegistrationInfo = {
  companyStaticId: 'static-id',
  timestamp: 1566388650000
}
const getRegistrationInfoMock = {
  call: jest.fn().mockResolvedValue([docRegistrationInfo.companyStaticId, `${docRegistrationInfo.timestamp / 1000}`])
}

const mockedWeb3Contract = {
  methods: {
    publishDocumentHash: jest.fn(() => publishDocumentHashTX),
    getRegistrationInfo: jest.fn(() => getRegistrationInfoMock),
    register: jest.fn(() => publishDocumentHashTX)
  }
}

const mockedWeb3 = {
  eth: {
    Contract: jest.fn(() => mockedWeb3Contract),
    net: {
      getId: jest.fn().mockResolvedValue(networkId)
    }
  }
}

const mockedTxObject = {
  to: contractAddress,
  value: '0x00',
  data: publishDocumentHashTX.encodeABI(),
  requestOrigin: 'apiDocuments'
}

describe('DocumentsTransactionManager', () => {
  let signerApi: jest.Mocked<SignerApi>
  let instance: DocumentsTransactionManager
  beforeEach(() => {
    signerApi = createMockInstance(SignerApi)
    instance = new DocumentsTransactionManager(mockedWeb3, contractAddress, abi, signerApi)
  })

  it('hashes a document', async () => {
    const hash: Buffer = await instance.hash(documentContent)
    expect(hash).toBeDefined()
  })

  it('signs a document', async () => {
    signerApi.sign.mockResolvedValue({
      data: documentContentSigned
    })
    const documentSigned: string = await instance.signDocument(documentContent)
    expect(signerApi.sign).toBeCalledWith({
      payload: documentContent
    })
    expect(documentSigned).toEqual(documentContentSigned)
  })

  it('submits document hashes', async () => {
    signerApi.sendTx.mockResolvedValue({
      data: transactionId
    })
    const submittedTxID: string = await instance.submitDocHashes([documentHash])
    expect(signerApi.sendTx).toBeCalledWith(mockedTxObject)
    expect(submittedTxID).toEqual(transactionId)
  })

  it('returns document registration info', async () => {
    const result = await instance.findDocument('docHash')
    expect(result).toEqual(docRegistrationInfo)
  })

  it('calls getRegistrationInfo with a document hash', async () => {
    await instance.findDocument('docHash')
    expect(mockedWeb3Contract.methods.getRegistrationInfo).toBeCalledWith('docHash')
  })
})
