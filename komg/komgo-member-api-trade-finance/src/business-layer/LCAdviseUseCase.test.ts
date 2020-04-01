import 'reflect-metadata'

import { LCAdviseUseCase } from './LCAdviseUseCase'
import { LC_STATE } from './events/LC/LCStates'
import { ILCTransactionManager } from './blockchain/ILCTransactionManager'
import { ILCTaskProcessor } from './tasks/LCTaskProcessor'
import createMockInstance from 'jest-create-mock-instance'
import { COMPANY_LC_ROLE } from './CompanyRole'
import { LCCacheDataAgent } from '../data-layer/data-agents'
import { TaskStatus } from '@komgo/notification-publisher'

describe('LCAdviseUseCase', () => {
  let lcAdviseUseCase: LCAdviseUseCase
  const mockTxManager: ILCTransactionManager = {
    deployLC: jest.fn(),
    issueLC: jest.fn(),
    adviseLC: jest.fn(),
    acknowledgeLC: jest.fn(),
    requestRejectLC: jest.fn(),
    issuedLCRejectByBeneficiary: jest.fn(),
    issuedLCRejectByAdvisingBank: jest.fn()
  }

  const lc: any = { _id: 1 }

  const mockTaskProcessor: ILCTaskProcessor = {
    updateTask: jest.fn(),
    createTask: jest.fn(),
    resolveTask: jest.fn(),
    sendStateUpdatedNotification: jest.fn()
  }

  const lcDataAgentMock = createMockInstance(LCCacheDataAgent)

  beforeEach(() => {
    lcAdviseUseCase = new LCAdviseUseCase('company1', mockTxManager, mockTaskProcessor, lcDataAgentMock)
  })

  it('should not call txManager if not allowed', async () => {
    lcAdviseUseCase.adviseLC({
      _id: '1',
      beneficiaryBankId: 'company2',
      beneficiaryBankRole: 'ADVISING'
    } as any)

    expect(mockTxManager.adviseLC).not.toHaveBeenCalled()
  })

  it('should call txManager if advising bank', async () => {
    const lcObj = {
      _id: '1',
      beneficiaryBankId: 'company1',
      beneficiaryBankRole: 'ADVISING',
      status: LC_STATE.ISSUED
    } as any
    await lcAdviseUseCase.adviseLC(lcObj)

    expect(mockTxManager.adviseLC).toHaveBeenCalled()
    expect(mockTaskProcessor.updateTask).toHaveBeenCalledWith(
      lcObj,
      LC_STATE.ADVISED,
      COMPANY_LC_ROLE.AdvisingBank,
      TaskStatus.Pending
    )
  })

  it('should throw if cannot process because of invalid LC state', async () => {
    await expect(
      lcAdviseUseCase.adviseLC({
        _id: '1',
        beneficiaryBankId: 'company1',
        beneficiaryBankRole: 'ADVISING',
        status: LC_STATE.INITIALISING
      } as any)
    ).rejects.toEqual(
      new Error(
        `Only lc in status [${LC_STATE.ISSUED}] can be processed. Currently status is: [${LC_STATE.INITIALISING}]`
      )
    )
  })

  it('should throw if direct LC', async () => {
    await expect(
      lcAdviseUseCase.adviseLC({
        _id: '1',
        issuingBankId: 'company1',
        issuingBankRole: 'ADVISING',
        status: LC_STATE.ADVISED
      } as any)
    ).rejects.toEqual(new Error(`Action not allowed for direct LC`))
  })

  it('should fail if the destination state has already been set on the lc', async () => {
    const lcObj = {
      _id: '1',
      beneficiaryBankId: 'company1',
      beneficiaryBankRole: 'ADVISING',
      status: LC_STATE.ISSUED
    } as any
    lcObj.destinationState = LC_STATE.ADVISED

    await expect(lcAdviseUseCase.adviseLC(lcObj)).rejects.toMatchObject({
      message: `Lc transition to ${lcObj.destinationState} is already in progress`
    })

    expect(mockTaskProcessor.updateTask).not.toHaveBeenCalled()
    expect(mockTxManager.issueLC).not.toHaveBeenCalled()
  })

  it('should set task to pending and back to ToDo if the transaction fails', async () => {
    mockTxManager.adviseLC = jest.fn().mockImplementation(() => {
      throw Error()
    })
    const lcObj = {
      _id: '1',
      beneficiaryBankId: 'company1',
      beneficiaryBankRole: 'ADVISING',
      status: LC_STATE.ISSUED
    } as any

    let err
    try {
      await lcAdviseUseCase.adviseLC(lcObj)
    } catch (e) {
      err = e
    }
    expect(err).toBeDefined()
    expect(mockTaskProcessor.updateTask).toHaveBeenCalledWith(
      lcObj,
      LC_STATE.ADVISED,
      COMPANY_LC_ROLE.AdvisingBank,
      TaskStatus.Pending
    )
    expect(mockTaskProcessor.updateTask).toHaveBeenCalledWith(
      lcObj,
      LC_STATE.ADVISED,
      COMPANY_LC_ROLE.AdvisingBank,
      TaskStatus.ToDo
    )
  })
})
