import 'reflect-metadata'

import { LCRejectBeneficiaryUseCase } from './LCRejectBeneficiaryUseCase'
import { LC_STATE } from './events/LC/LCStates'
import { ILCTransactionManager } from './blockchain/ILCTransactionManager'
import { ILCTaskProcessor } from './tasks/LCTaskProcessor'
import createMockInstance from 'jest-create-mock-instance'
import { COMPANY_LC_ROLE } from './CompanyRole'
import { LCCacheDataAgent } from '../data-layer/data-agents'
import { TaskStatus } from '@komgo/notification-publisher'

describe('LCRejectBeneficiaryUseCase', () => {
  let lcRejectBeneficiaryUseCase: LCRejectBeneficiaryUseCase
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
  let lc

  beforeEach(() => {
    lc = getValidLc()
    lcRejectBeneficiaryUseCase = new LCRejectBeneficiaryUseCase(
      'company1',
      mockTxManager,
      mockTaskProcessor,
      mockLcDataAgent
    )
  })

  it('should not call txManager if not allowed', () => {
    lcRejectBeneficiaryUseCase.rejectBeneficiaryLC(
      {
        _id: '1',
        applicantId: 'company1'
      } as any,
      'comment'
    )

    expect(mockTxManager.acknowledgeLC).not.toHaveBeenCalled()
  })

  it('should call txManager if beneficiary and directLC', async () => {
    await lcRejectBeneficiaryUseCase.rejectBeneficiaryLC(lc, 'comment')

    expect(mockTxManager.issuedLCRejectByBeneficiary).toHaveBeenCalledWith(lc.contractAddress, 'comment')
    expect(mockTaskProcessor.updateTask).toHaveBeenCalledWith(
      lc,
      LC_STATE.ISSUED_LC_REJECTED,
      COMPANY_LC_ROLE.Beneficiary,
      TaskStatus.Pending
    )
  })

  it('should call txManager if beneficiary and advised', async () => {
    await lcRejectBeneficiaryUseCase.rejectBeneficiaryLC(lc, 'comment')
    expect(mockTaskProcessor.updateTask).toHaveBeenCalledWith(
      lc,
      LC_STATE.ISSUED_LC_REJECTED,
      COMPANY_LC_ROLE.Beneficiary,
      TaskStatus.Pending
    )
    expect(mockTxManager.issuedLCRejectByBeneficiary).toHaveBeenCalled()
  })

  it('should throw if LC cannot be processed because of incorrect status', async () => {
    lc.status = LC_STATE.INITIALISING
    await expect(lcRejectBeneficiaryUseCase.rejectBeneficiaryLC(lc, 'comment')).rejects.toEqual(
      new Error(
        `Only lc in status [${LC_STATE.ADVISED}] if not directLC, or [${
          LC_STATE.ISSUED
        }] for direct LC can be processed.`
      )
    )
  })

  it('should set task to pending and back to ToDo if the transaction fails', async () => {
    mockTxManager.issuedLCRejectByBeneficiary = jest.fn().mockImplementation(() => {
      throw Error()
    })

    let err
    try {
      await lcRejectBeneficiaryUseCase.rejectBeneficiaryLC(lc, 'comment')
    } catch (e) {
      err = e
    }
    expect(err).toBeDefined()
    expect(mockTaskProcessor.updateTask).toHaveBeenNthCalledWith(
      1,
      lc,
      LC_STATE.ISSUED_LC_REJECTED,
      COMPANY_LC_ROLE.Beneficiary,
      TaskStatus.Pending
    )
    expect(mockTaskProcessor.updateTask).toHaveBeenNthCalledWith(
      2,
      lc,
      LC_STATE.ISSUED_LC_REJECTED,
      COMPANY_LC_ROLE.Beneficiary,
      TaskStatus.ToDo
    )
  })

  it('should fail if the destination state has already been set on the lc', async () => {
    lc.destinationState = LC_STATE.ISSUED_LC_REJECTED
    await expect(lcRejectBeneficiaryUseCase.rejectBeneficiaryLC(lc, 'comment')).rejects.toMatchObject({
      message: `Lc transition to ${lc.destinationState} is already in progress`
    })

    expect(mockTaskProcessor.updateTask).not.toHaveBeenCalled()
    expect(mockTxManager.requestRejectLC).not.toHaveBeenCalled()
  })

  function getValidLc() {
    return {
      _id: '1',
      beneficiaryId: 'company1',
      beneficiaryBankId: 'bank1',
      status: LC_STATE.ADVISED,
      contractAddress: '0xef3fbc3e228dbdc523ce5e58530874005553eb2e'
    } as any
  }
})
