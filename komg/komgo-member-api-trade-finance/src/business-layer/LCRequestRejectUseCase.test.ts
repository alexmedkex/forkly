import 'reflect-metadata'
import { LCRequestRejectUseCase } from './LCRequestRejectUseCase'
import { ILCTransactionManager } from './blockchain/ILCTransactionManager'
import { ILCTaskProcessor } from '../business-layer/tasks/LCTaskProcessor'
import { LC_STATE } from './events/LC/LCStates'
import { COMPANY_LC_ROLE } from './CompanyRole'
import { LCCacheDataAgent } from '../data-layer/data-agents'
import { createMockInstance } from 'jest-create-mock-instance'
import { TaskStatus } from '@komgo/notification-publisher'

describe('LCRequestRejectUseCase', () => {
  let lCRejectUseCase: LCRequestRejectUseCase
  const mockTxManager: ILCTransactionManager = {
    deployLC: jest.fn(),
    issueLC: jest.fn(),
    adviseLC: jest.fn(),
    acknowledgeLC: jest.fn(),
    requestRejectLC: jest.fn(),
    issuedLCRejectByBeneficiary: jest.fn(),
    issuedLCRejectByAdvisingBank: jest.fn()
  }
  const hash = '0x123'
  let lc: any

  const mockTaskProcessor: ILCTaskProcessor = {
    updateTask: jest.fn(),
    createTask: jest.fn(),
    resolveTask: jest.fn(),
    sendStateUpdatedNotification: jest.fn()
  }

  const mockLcDataAgent = createMockInstance(LCCacheDataAgent)

  beforeEach(() => {
    jest.resetAllMocks()
    lc = getValidLc()
    lCRejectUseCase = new LCRequestRejectUseCase('company1', mockTxManager, mockTaskProcessor, mockLcDataAgent)
  })

  it('should call txManager, set Task to pending and update lc destinationState', async () => {
    await lCRejectUseCase.rejectLC(lc, 'comment')

    expect(mockTxManager.requestRejectLC).toHaveBeenCalledWith(hash, 'comment')
    expect(mockTaskProcessor.updateTask).toHaveBeenCalledWith(
      lc,
      LC_STATE.REQUEST_REJECTED,
      COMPANY_LC_ROLE.IssuingBank,
      TaskStatus.Pending
    )
    expect(mockLcDataAgent.updateField).toBeCalledWith(lc._id, 'destinationState', LC_STATE.REQUEST_REJECTED)
  })

  it('should set task to pending and back to ToDo if the transaction fails', async () => {
    mockTxManager.requestRejectLC = jest.fn().mockImplementation(() => {
      throw Error()
    })

    let err
    try {
      await lCRejectUseCase.rejectLC(lc, 'comment')
    } catch (e) {
      err = e
    }
    expect(err).toBeDefined()
    expect(mockTaskProcessor.updateTask).toHaveBeenNthCalledWith(
      1,
      lc,
      LC_STATE.REQUEST_REJECTED,
      COMPANY_LC_ROLE.IssuingBank,
      TaskStatus.Pending
    )
    expect(mockTaskProcessor.updateTask).toHaveBeenNthCalledWith(
      2,
      lc,
      LC_STATE.REQUEST_REJECTED,
      COMPANY_LC_ROLE.IssuingBank,
      TaskStatus.ToDo
    )
  })

  it('should return transaction if set task pending fails', async () => {
    mockTaskProcessor.updateTask = jest.fn().mockImplementation(() => {
      throw new Error()
    })
    const txHash = '0x7618b289'
    mockTxManager.requestRejectLC = jest.fn().mockImplementation(() => {
      return '0x7618b289'
    })
    const result = await lCRejectUseCase.rejectLC(lc, 'comment')

    expect(result).toEqual(txHash)
  })

  it('should return transaction if lc destinationState update fails', async () => {
    const txHash = '0x7618b289'
    mockTxManager.requestRejectLC = jest.fn().mockImplementation(() => {
      return '0x7618b289'
    })
    const result = await lCRejectUseCase.rejectLC(lc, 'comment')

    expect(result).toEqual(txHash)
  })

  it('should return transaction if lc destinationState update and set task pending fails', async () => {
    mockTaskProcessor.updateTask = jest.fn().mockImplementation(() => {
      throw new Error()
    })
    const txHash = '0x7618b289'
    mockTxManager.requestRejectLC = jest.fn().mockImplementation(() => {
      return '0x7618b289'
    })
    const result = await lCRejectUseCase.rejectLC(lc, 'comment')

    expect(result).toEqual(txHash)
  })

  it('should fail if not issuingBankId', async () => {
    expect(lCRejectUseCase.rejectLC({ ...lc, issuingBankId: 'none' }, 'some')).rejects.toMatchObject({
      message: 'Only company with LC role [ISSUING] can execute. Currently company is: [NOT_PARTY]'
    })

    expect(mockTaskProcessor.updateTask).not.toHaveBeenCalled()
    expect(mockTxManager.requestRejectLC).not.toHaveBeenCalled()
  })

  it('should fail if not requested', async () => {
    expect(lCRejectUseCase.rejectLC({ ...lc, status: 'issued' }, 'some')).rejects.toMatchObject({
      message: 'Only lc in status [requested] can be processed. Currently status is: [issued]'
    })

    expect(mockTxManager.requestRejectLC).not.toHaveBeenCalled()
    expect(mockTaskProcessor.updateTask).not.toHaveBeenCalled()
  })

  it('should fail if the destination state has already been set on the lc', async () => {
    lc.destinationState = LC_STATE.REQUEST_REJECTED
    await expect(lCRejectUseCase.rejectLC(lc, 'comment')).rejects.toMatchObject({
      message: `Lc transition to ${lc.destinationState} is already in progress`
    })

    expect(mockTaskProcessor.updateTask).not.toHaveBeenCalled()
    expect(mockTxManager.requestRejectLC).not.toHaveBeenCalled()
  })

  function getValidLc() {
    return {
      _id: '1',
      issuingBankId: 'company1',
      status: 'requested',
      contractAddress: hash
    } as any
  }
})
