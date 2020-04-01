import 'reflect-metadata'

import { LCAcknowledgeUseCase } from './LCAcknowledgeUseCase'
import { LC_STATE } from './events/LC/LCStates'
import { ILCTransactionManager } from './blockchain/ILCTransactionManager'
import { ILCTaskProcessor } from './tasks/LCTaskProcessor'
import createMockInstance from 'jest-create-mock-instance'
import { COMPANY_LC_ROLE } from './CompanyRole'
import { LCCacheDataAgent } from '../data-layer/data-agents'
import { TaskStatus } from '@komgo/notification-publisher'
import { InvalidOperationException } from '../exceptions'

describe('LCAcknowledgeUseCase', () => {
  let lcAcknowledgeUseCase: LCAcknowledgeUseCase
  const mockTxManager: ILCTransactionManager = {
    deployLC: jest.fn(),
    issueLC: jest.fn(),
    adviseLC: jest.fn(),
    acknowledgeLC: jest.fn(),
    requestRejectLC: jest.fn(),
    issuedLCRejectByBeneficiary: jest.fn(),
    issuedLCRejectByAdvisingBank: jest.fn()
  }

  const mockTaskProcessor: ILCTaskProcessor = {
    updateTask: jest.fn(),
    createTask: jest.fn(),
    resolveTask: jest.fn(),
    sendStateUpdatedNotification: jest.fn()
  }

  const lcDataAgentMock = createMockInstance(LCCacheDataAgent)

  let lc

  beforeEach(() => {
    lc = getValidLc()
    lcAcknowledgeUseCase = new LCAcknowledgeUseCase('company1', mockTxManager, mockTaskProcessor, lcDataAgentMock)
  })

  it('should not call txManager if not allowed', async () => {
    try {
      await lcAcknowledgeUseCase.acknowledgeLC({
        _id: '1',
        applicantId: 'company1'
      } as any)
    } catch (e) {
      expect(mockTxManager.acknowledgeLC).not.toHaveBeenCalled()
    }
  })

  it('should call txManager if beneficiary and directLC', async () => {
    await lcAcknowledgeUseCase.acknowledgeLC(lc)

    expect(mockTxManager.acknowledgeLC).toHaveBeenCalled()
    expect(mockTaskProcessor.updateTask).toHaveBeenCalledWith(
      lc,
      LC_STATE.ACKNOWLEDGED,
      COMPANY_LC_ROLE.Beneficiary,
      TaskStatus.Pending
    )
  })

  it('should call txManager if beneficiary and advised', async () => {
    await lcAcknowledgeUseCase.acknowledgeLC(lc)

    expect(mockTxManager.acknowledgeLC).toHaveBeenCalled()
    expect(mockTaskProcessor.updateTask).toHaveBeenCalledWith(
      lc,
      LC_STATE.ACKNOWLEDGED,
      COMPANY_LC_ROLE.Beneficiary,
      TaskStatus.Pending
    )
  })

  it('should throw if lc status cannot be processed', async () => {
    lc.status = LC_STATE.INITIALISING
    await expect(lcAcknowledgeUseCase.acknowledgeLC(lc)).rejects.toBeInstanceOf(InvalidOperationException)
  })

  it('should fail if the destination state has already been set on the lc', async () => {
    lc.destinationState = LC_STATE.ACKNOWLEDGED

    await expect(lcAcknowledgeUseCase.acknowledgeLC(lc)).rejects.toMatchObject({
      message: `Lc transition to ${lc.destinationState} is already in progress`
    })

    expect(mockTaskProcessor.updateTask).not.toHaveBeenCalled()
    expect(mockTxManager.issueLC).not.toHaveBeenCalled()
  })

  it('should fail if the destination state has already been set on the lc', async () => {
    lc.destinationState = LC_STATE.ACKNOWLEDGED

    await expect(lcAcknowledgeUseCase.acknowledgeLC(lc)).rejects.toMatchObject({
      message: `Lc transition to ${lc.destinationState} is already in progress`
    })

    expect(mockTaskProcessor.updateTask).not.toHaveBeenCalled()
    expect(mockTxManager.issueLC).not.toHaveBeenCalled()
  })

  it('should set task to pending and back to ToDo if the transaction fails', async () => {
    mockTxManager.acknowledgeLC = jest.fn().mockImplementation(() => {
      throw Error()
    })
    let err
    try {
      await lcAcknowledgeUseCase.acknowledgeLC(lc)
    } catch (e) {
      err = e
    }
    expect(err).toBeDefined()
    expect(mockTaskProcessor.updateTask).toHaveBeenNthCalledWith(
      1,
      lc,
      LC_STATE.ACKNOWLEDGED,
      COMPANY_LC_ROLE.Beneficiary,
      TaskStatus.Pending
    )
    expect(mockTaskProcessor.updateTask).toHaveBeenNthCalledWith(
      2,
      lc,
      LC_STATE.ACKNOWLEDGED,
      COMPANY_LC_ROLE.Beneficiary,
      TaskStatus.ToDo
    )
  })

  function getValidLc() {
    return {
      _id: '1',
      beneficiaryId: 'company1',
      beneficiaryBankId: null,
      status: LC_STATE.ISSUED
    } as any
  }
})
