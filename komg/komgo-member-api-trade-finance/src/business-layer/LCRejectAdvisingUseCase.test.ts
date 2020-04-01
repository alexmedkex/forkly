import 'reflect-metadata'

import { LCRejectAdvisingUseCase } from './LCRejectAdvisingUseCase'
import { LC_STATE } from './events/LC/LCStates'
import { ILCTransactionManager } from './blockchain/ILCTransactionManager'
import { ILCTaskProcessor } from './tasks/LCTaskProcessor'
import { LCCacheDataAgent } from '../data-layer/data-agents'
import createMockInstance from 'jest-create-mock-instance'

describe('LCRejectAdvisingUseCase', () => {
  let lcRejectAdvisingUseCase: LCRejectAdvisingUseCase
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

  const mockLcDataAgent = createMockInstance(LCCacheDataAgent)

  const lc: any = { _id: 1 }

  beforeEach(() => {
    jest.resetAllMocks()
    lcRejectAdvisingUseCase = new LCRejectAdvisingUseCase('company1', mockTxManager, mockTaskProcessor, mockLcDataAgent)
  })

  it('should not call txManager if not allowed', async () => {
    lcRejectAdvisingUseCase.rejectAdvisingLC(
      {
        _id: '1',
        beneficiaryBankId: 'company2',
        beneficiaryBankRole: 'ADVISING'
      } as any,
      'comment'
    )

    expect(mockTxManager.issuedLCRejectByAdvisingBank).not.toHaveBeenCalled()
  })

  it('should call txManager if advising bank', async () => {
    await lcRejectAdvisingUseCase.rejectAdvisingLC(getValidLc() as any, 'comment')

    expect(mockTxManager.issuedLCRejectByAdvisingBank).toHaveBeenCalled()
  })

  it('should not call txManager if beneficiary and directLC', () => {
    lcRejectAdvisingUseCase.rejectAdvisingLC(
      {
        _id: '1',
        beneficiaryId: 'company1',
        beneficiaryBankId: null,
        status: LC_STATE.ISSUED
      } as any,
      'comment'
    )

    expect(mockTxManager.issuedLCRejectByAdvisingBank).not.toHaveBeenCalled()
  })

  it('should throw if LC cannot be processed because of incorrect status', async () => {
    await expect(
      lcRejectAdvisingUseCase.rejectAdvisingLC(
        {
          _id: '1',
          beneficiaryBankId: 'company1',
          beneficiaryBankRole: 'ADVISING',
          status: LC_STATE.INITIALISING
        } as any,
        'comment'
      )
    ).rejects.toEqual(
      new Error(
        `Only lc in status [${LC_STATE.ISSUED}] can be processed. Currently status is: [${LC_STATE.INITIALISING}]`
      )
    )
  })

  it('should fail if the destination state has already been set on the lc', async () => {
    const validLc = getValidLc() as any
    validLc.destinationState = LC_STATE.ISSUED_LC_REJECTED
    await expect(lcRejectAdvisingUseCase.rejectAdvisingLC(validLc, 'comment')).rejects.toMatchObject({
      message: `Lc transition to ${validLc.destinationState} is already in progress`
    })

    expect(mockTaskProcessor.updateTask).not.toHaveBeenCalled()
    expect(mockTxManager.requestRejectLC).not.toHaveBeenCalled()
  })

  function getValidLc() {
    return {
      _id: '1',
      beneficiaryBankId: 'company1',
      beneficiaryBankRole: 'ADVISING',
      status: LC_STATE.ISSUED
    }
  }
})
