import 'reflect-metadata'

jest.mock('uuid', () => ({
  v4: () => LC_AMENDMENT_STATIC_ID
}))

import { ILCCacheDataAgent, ILCAmendmentDataAgent } from '../data-layer/data-agents'
import IUser from './IUser'
import { ILCAmendmentUseCase } from './ILCAmendmentUseCase'
import { ILCAmendmentTransactionManager } from './blockchain/ILCAmendmentTransactionManager'
import { LCAmendmentUseCase } from './LCAmendmentUseCase'
import { sampleLC } from './messaging/mock-data/mock-lc'
import { LCAmendmentStatus, buildFakeAmendmentBase } from '@komgo/types'
import Uploader from '../service-layer/utils/Uploader'
import { createMockInstance } from 'jest-create-mock-instance'
import { DocumentService } from './documents/DocumentService'
import { IDocumentRegisterResponse } from './documents/IDocumentRegisterResponse'
import { ContentNotFoundException } from '../exceptions'

const LC_AMENDMENT_STATIC_ID = 'aade86bf-0e49-43af-89dd-d14fb89500b3'
const LC_AMENDMENT_TX_HASH = '0x0001'

const user: IUser = {
  id: '1',
  firstName: 'Super',
  lastName: 'User',
  email: 'super@komgo.io'
}

const lcCacheDataAgentMock: ILCCacheDataAgent = {
  saveLC: jest.fn(),
  updateField: jest.fn(),
  updateStatus: jest.fn(),
  getLC: jest.fn().mockImplementation(() => {
    return sampleLC
  }),
  getLCs: jest.fn(),
  updateLcByReference: jest.fn(),
  getNonce: jest.fn(),
  count: jest.fn()
}

const lcAmendmentDataAgentMock: ILCAmendmentDataAgent = {
  create: jest.fn().mockImplementation(() => Promise.resolve(LC_AMENDMENT_STATIC_ID)),
  update: jest.fn(),
  find: jest.fn(),
  get: jest.fn(),
  count: jest.fn(),
  delete: jest.fn(),
  getByAddress: jest.fn()
}

const lcAmendmentTransactionManagerMock: ILCAmendmentTransactionManager = {
  deployInitial: jest.fn().mockImplementation(() => Promise.resolve(LC_AMENDMENT_TX_HASH)),
  rejectByIssuingBank: jest.fn(),
  approveByIssuingBank: jest.fn()
}

const uploaderMock = createMockInstance(Uploader)
const documentServiceMock = createMockInstance(DocumentService)
const fileMock = {
  data: {},
  file: {}
}

const documentMock: IDocumentRegisterResponse = {
  hash: '0x0',
  name: 'DocumentName',
  category: undefined,
  content: undefined,
  context: undefined,
  id: '12345',
  metadata: undefined,
  owner: undefined,
  product: undefined,
  registrationDate: undefined,
  sharedBy: undefined,
  sharedWith: undefined,
  type: undefined
}

describe('LCAmendmentUseCase', () => {
  let lcAmendmentUseCase: ILCAmendmentUseCase

  beforeEach(() => {
    lcAmendmentUseCase = new LCAmendmentUseCase(
      lcAmendmentDataAgentMock,
      lcAmendmentTransactionManagerMock,
      lcCacheDataAgentMock,
      'companyId',
      uploaderMock,
      documentServiceMock
    )
    documentServiceMock.registerLCAmendmentDocument.mockImplementationOnce(() => documentMock)
    jest.restoreAllMocks()
  })

  describe('success', () => {
    it('deploys the smart contract', async () => {
      expect.assertions(3)
      const amendment = buildFakeAmendmentBase()
      const [txHash, staticId] = await lcAmendmentUseCase.create(amendment, user)

      expect(txHash).toEqual(LC_AMENDMENT_TX_HASH)
      expect(staticId).toEqual(LC_AMENDMENT_STATIC_ID)

      const { applicantId, beneficiaryId, issuingBankId, beneficiaryBankId } = sampleLC

      const parties: string[] = [applicantId, beneficiaryId, issuingBankId].concat(
        beneficiaryBankId ? [beneficiaryBankId] : []
      )

      expect(lcAmendmentTransactionManagerMock.deployInitial).toHaveBeenCalledWith(
        sampleLC,
        {
          ...amendment,
          status: LCAmendmentStatus.Pending,
          staticId: LC_AMENDMENT_STATIC_ID,
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        },
        parties
      )
    })

    describe('Approval by issuing bank', () => {
      const requestMock: Express.Request = {}

      let amendmentStaticId
      let amendment
      beforeEach(async () => {
        lcCacheDataAgentMock.getLC = jest.fn().mockImplementation(() => {
          return Promise.resolve(sampleLC)
        })
        amendment = buildFakeAmendmentBase()
        const [txHash, lcAmendmentStaticId] = await lcAmendmentUseCase.create(amendment, user)
        amendmentStaticId = lcAmendmentStaticId
        uploaderMock.resolveMultipartData.mockRestore()
        uploaderMock.resolveMultipartData.mockImplementationOnce(() => fileMock)
      })

      it('issuing bank approves', async () => {
        lcAmendmentUseCase = new LCAmendmentUseCase(
          lcAmendmentDataAgentMock,
          lcAmendmentTransactionManagerMock,
          lcCacheDataAgentMock,
          'bank',
          uploaderMock,
          documentServiceMock
        )
        lcAmendmentDataAgentMock.get = jest.fn().mockImplementationOnce(() => {
          return Promise.resolve(amendment)
        })
        await lcAmendmentUseCase.approve(amendmentStaticId, requestMock, user)
        expect(uploaderMock.resolveMultipartData).toHaveBeenCalledTimes(1)
        expect(lcAmendmentTransactionManagerMock.approveByIssuingBank).toHaveBeenCalledTimes(1)
      })

      it('another party cannot approve', async () => {
        lcAmendmentUseCase = new LCAmendmentUseCase(
          lcAmendmentDataAgentMock,
          lcAmendmentTransactionManagerMock,
          lcCacheDataAgentMock,
          'unknownguy',
          uploaderMock,
          documentServiceMock
        )
        lcAmendmentDataAgentMock.get = jest.fn().mockImplementationOnce(() => {
          return Promise.resolve(amendment)
        })
        await expect(lcAmendmentUseCase.approve(amendmentStaticId, requestMock, user)).rejects.toThrowError()
        expect(uploaderMock.resolveMultipartData).toHaveBeenCalledTimes(1)
        expect(lcAmendmentTransactionManagerMock.approveByIssuingBank).toHaveBeenCalledTimes(0)
      })

      it('issuing bank rejects', async () => {
        lcAmendmentUseCase = new LCAmendmentUseCase(
          lcAmendmentDataAgentMock,
          lcAmendmentTransactionManagerMock,
          lcCacheDataAgentMock,
          'bank',
          uploaderMock,
          documentServiceMock
        )
        lcAmendmentDataAgentMock.get = jest.fn().mockImplementationOnce(() => {
          return Promise.resolve(amendment)
        })
        await lcAmendmentUseCase.reject(amendmentStaticId, 'comments')
        expect(lcAmendmentTransactionManagerMock.rejectByIssuingBank).toHaveBeenCalledTimes(1)
      })

      it('another party cannot reject', async () => {
        lcAmendmentUseCase = new LCAmendmentUseCase(
          lcAmendmentDataAgentMock,
          lcAmendmentTransactionManagerMock,
          lcCacheDataAgentMock,
          'unknownguy',
          uploaderMock,
          documentServiceMock
        )
        lcAmendmentDataAgentMock.get = jest.fn().mockImplementationOnce(() => {
          return Promise.resolve(amendment)
        })
        await expect(lcAmendmentUseCase.reject(amendmentStaticId, 'comments')).rejects.toThrowError()
        expect(lcAmendmentTransactionManagerMock.rejectByIssuingBank).toHaveBeenCalledTimes(0)
      })
    })

    describe('deploy amendment failure', () => {
      it('fails to find the parent LC', async () => {
        lcCacheDataAgentMock.getLC = jest.fn().mockImplementationOnce(() => {
          return null
        })
        const amendment = buildFakeAmendmentBase()
        await expect(lcAmendmentUseCase.create(amendment, user)).rejects.toThrowError(
          `Parent LC ${amendment.lcStaticId} doesn't exist`
        )
      })

      it('fails to find all the parties involved', async () => {
        const letterOfCredit = { ...sampleLC }
        const { beneficiaryId, issuingBankId, beneficiaryBankId } = letterOfCredit

        lcCacheDataAgentMock.getLC = jest.fn().mockImplementation(() => {
          delete letterOfCredit.applicantId
          return letterOfCredit
        })
        const amendment = buildFakeAmendmentBase()
        await expect(lcAmendmentUseCase.create(amendment, user)).rejects.toBeInstanceOf(ContentNotFoundException)
      })

      it('fails to save the amendment', async () => {
        const boom = new Error('Boom!')
        lcCacheDataAgentMock.getLC = jest.fn().mockImplementationOnce(() => {
          return Promise.resolve(sampleLC)
        })
        lcAmendmentDataAgentMock.create = jest.fn().mockImplementationOnce(() => {
          return Promise.reject(boom)
        })
        const amendment = buildFakeAmendmentBase()
        await expect(lcAmendmentUseCase.create(amendment, user)).rejects.toThrow(boom)
      })

      it('fails to deploy contract, state of amendment is FAILED', async () => {
        const amendment = buildFakeAmendmentBase()
        const error = new Error('Nope!')
        lcCacheDataAgentMock.getLC = jest.fn().mockImplementationOnce(() => {
          return Promise.resolve(sampleLC)
        })
        lcAmendmentTransactionManagerMock.deployInitial = jest.fn().mockImplementationOnce(() => {
          throw error
        })
        const call = lcAmendmentUseCase.create(amendment, user)
        await expect(call).rejects.toThrowError()
        const expectedArgument = { ...amendment, status: LCAmendmentStatus.Failed }
        expect(lcAmendmentDataAgentMock.update).toHaveBeenCalledTimes(1)
      })
    })
  })
})
