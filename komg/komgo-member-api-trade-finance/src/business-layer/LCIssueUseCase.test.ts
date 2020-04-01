import 'reflect-metadata'

import { COMPANY_LC_ROLE } from './CompanyRole'
import { LC_STATE } from './events/LC/LCStates'
import { LCIssueUseCase } from './LCIssueUseCase'
import { documentResponse, user } from './test-entities'
import { DOCUMENT_TYPE } from './documents/documentTypes'
import { ILCTaskProcessor } from './tasks/LCTaskProcessor'
import { LCCacheDataAgent } from '../data-layer/data-agents'
import { TaskStatus } from '@komgo/notification-publisher'
import createMockInstance from 'jest-create-mock-instance'
import { DocumentService } from './documents/DocumentService'
import IDocumentService from './documents/IDocumentService'

describe('LCIssueUseCase', () => {
  let lCIssueUseCase: LCIssueUseCase
  let mockTxManager

  const mockDocumentService = {
    registerLcDocument: jest.fn(),
    registerLcPresentationDocument: jest.fn(),
    registerLCAmendmentDocument: jest.fn(),
    registerSBLCIssuingDocument: jest.fn(),
    registerLetterOfCreditIssuingDocument: jest.fn()
  }

  const mockLCDocManager = {
    shareDocument: jest.fn(),
    deleteDocument: jest.fn()
  }

  let lc
  const lcDataAgentMock = createMockInstance(LCCacheDataAgent)
  const mockTaskProcessor: ILCTaskProcessor = {
    updateTask: jest.fn(),
    createTask: jest.fn(),
    resolveTask: jest.fn(),
    sendStateUpdatedNotification: jest.fn()
  }
  beforeEach(() => {
    mockTxManager = getMockTxManager()
    lc = { _id: 1, contractAddress: '0x0', issuingBankId: 'company1', status: LC_STATE.REQUESTED }
    lCIssueUseCase = new LCIssueUseCase(
      'company1',
      mockTxManager,
      mockDocumentService,
      mockLCDocManager,
      mockTaskProcessor,
      lcDataAgentMock
    )

    mockTxManager.issueLC.mockResolvedValue('0xLCIssued')
    mockDocumentService.registerLcDocument.mockResolvedValue(documentResponse())
  })

  it('should fails if not issuing bank', async () => {
    lc.issuingBankId = '----'
    await expect(lCIssueUseCase.issueLC(lc, {} as any, 'some', user())).rejects.toMatchObject(
      new Error(`Only company with LC role [ISSUING] can execute. Currently company is: [${COMPANY_LC_ROLE.NotParty}]`)
    )
  })

  it('should fails if not in requested state', async () => {
    lc.status = LC_STATE.ACKNOWLEDGED
    await expect(lCIssueUseCase.issueLC(lc, {} as any, 'some', user())).rejects.toMatchObject(
      new Error(`Only lc in status [requested] can be processed. Currently status is: [${lc.status}]`)
    )
  })

  it('should submit document and issue request', async () => {
    const hash = await lCIssueUseCase.issueLC(lc, {} as any, 'some', user())

    expect(mockTxManager.issueLC).toHaveBeenCalled()
    expect(mockDocumentService.registerLcDocument).toHaveBeenCalled()
    expect(hash).toBe('0xLCIssued')
    expect(mockTaskProcessor.updateTask).toHaveBeenCalledWith(
      lc,
      LC_STATE.ISSUED,
      COMPANY_LC_ROLE.IssuingBank,
      TaskStatus.Pending
    )
  })

  it('should fail if the destination state has already been set on the lc', async () => {
    lc.destinationState = LC_STATE.ISSUED
    expect(lCIssueUseCase.issueLC(lc, {} as any, 'some', user())).rejects.toMatchObject({
      message: `Lc transition to ${lc.destinationState} is already in progress`
    })

    expect(mockTaskProcessor.updateTask).not.toHaveBeenCalled()
    expect(mockTxManager.issueLC).not.toHaveBeenCalled()
  })

  it('should delete doc and retrow error if issue fails', async () => {
    const rejection = 'Failed'
    mockTxManager.issueLC.mockRejectedValueOnce(rejection)

    const call = lCIssueUseCase.issueLC(lc, {} as any, 'some', user())

    await expect(call).rejects.toMatch(rejection)
    expect(mockLCDocManager.deleteDocument).toHaveBeenCalledWith(lc, DOCUMENT_TYPE.LC)
  })

  it('should set task to pending and back to ToDo if the transaction fails', async () => {
    mockTxManager.issueLC = jest.fn().mockImplementation(() => {
      throw Error()
    })
    let err
    try {
      await lCIssueUseCase.issueLC(lc, {} as any, 'some', user())
    } catch (e) {
      err = e
    }
    expect(err).toBeDefined()
    expect(mockTaskProcessor.updateTask).toHaveBeenNthCalledWith(
      1,
      lc,
      LC_STATE.ISSUED,
      COMPANY_LC_ROLE.IssuingBank,
      TaskStatus.Pending
    )
    expect(mockTaskProcessor.updateTask).toHaveBeenNthCalledWith(
      2,
      lc,
      LC_STATE.ISSUED,
      COMPANY_LC_ROLE.IssuingBank,
      TaskStatus.ToDo
    )
  })

  function getMockTxManager() {
    return {
      rejectLC: jest.fn(),
      deployLC: jest.fn(),
      initialiseLC: jest.fn(),
      issueLC: jest.fn().mockImplementation(() => {
        return '0xLCIssued'
      }),
      requestRejectLC: jest.fn(),
      issuedLCRejectByBeneficiary: jest.fn(),
      issuedLCRejectByAdvisingBank: jest.fn(),
      adviseLC: jest.fn(),
      acknowledgeLC: jest.fn()
    }
  }
})
