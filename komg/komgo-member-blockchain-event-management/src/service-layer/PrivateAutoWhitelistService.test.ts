import createMockInstance from 'jest-create-mock-instance'
import 'reflect-metadata'

import { PrivateAutoWhitelister } from '../business-layer/auto-whitelist/PrivateAutoWhitelister'
import { BlockchainConnectionError } from '../business-layer/errors'
import { EventProcessedDataAgent } from '../data-layer/data-agents'
import { AutoWhitelistDataAgent } from '../data-layer/data-agents/AutoWhitelistDataAgent'

import PrivateAutoWhitelistService from './PrivateAutoWhitelistService'

const autoWhitelistBeforeBlock = 2

describe('PrivateAutoWhitelistService', () => {
  let privateAutoWhitelistService: PrivateAutoWhitelistService
  let eventProcessedDataAgentMock: EventProcessedDataAgent
  let privateAutoWhitelisterMock: PrivateAutoWhitelister
  let autoWhitelistDataAgentMock: AutoWhitelistDataAgent

  beforeEach(() => {
    privateAutoWhitelisterMock = createMockInstance(PrivateAutoWhitelister)
    eventProcessedDataAgentMock = createMockInstance(EventProcessedDataAgent)
    autoWhitelistDataAgentMock = createMockInstance(AutoWhitelistDataAgent)
    autoWhitelistDataAgentMock.getStopBlockNumber.mockResolvedValue(null)
    privateAutoWhitelistService = new PrivateAutoWhitelistService(
      eventProcessedDataAgentMock,
      autoWhitelistDataAgentMock,
      privateAutoWhitelisterMock,
      autoWhitelistBeforeBlock
    )
  })

  it('should not set auto whitelist threshold if already set', async () => {
    autoWhitelistDataAgentMock.getStopBlockNumber.mockResolvedValueOnce(1)

    await privateAutoWhitelistService.start()

    expect(autoWhitelistDataAgentMock.setStopBlockNumber).not.toHaveBeenCalled()
  })

  it('should set the auto whitelist threshold to the block number argument -1 instead of the last block processed', async () => {
    eventProcessedDataAgentMock.getLastEventProcessed.mockResolvedValueOnce({ blockNumber: 3 })

    await privateAutoWhitelistService.start()

    expect(autoWhitelistDataAgentMock.setStopBlockNumber).toHaveBeenCalledWith(autoWhitelistBeforeBlock - 1)
  })

  it('should set the auto whitelist threshold to the last event processed if the block number argument is 0', async () => {
    privateAutoWhitelistService = new PrivateAutoWhitelistService(
      eventProcessedDataAgentMock,
      autoWhitelistDataAgentMock,
      privateAutoWhitelisterMock,
      0
    )
    eventProcessedDataAgentMock.getLastEventProcessed.mockResolvedValueOnce({ blockNumber: 3 })

    await privateAutoWhitelistService.start()

    expect(autoWhitelistDataAgentMock.setStopBlockNumber).toHaveBeenCalledWith(3)
  })

  it('should set the stop block number to -1 when there is no preferred number and no last event in database', async () => {
    privateAutoWhitelistService = new PrivateAutoWhitelistService(
      eventProcessedDataAgentMock,
      autoWhitelistDataAgentMock,
      privateAutoWhitelisterMock,
      0
    )
    eventProcessedDataAgentMock.getLastEventProcessed.mockResolvedValueOnce(null)

    await privateAutoWhitelistService.start()

    expect(autoWhitelistDataAgentMock.setStopBlockNumber).toHaveBeenCalledWith(-1)
  })

  it('should process events', async () => {
    await privateAutoWhitelistService.start()

    expect(privateAutoWhitelisterMock.processEvents).toHaveBeenCalled()
  })

  it('should fail if processing events fails', async () => {
    privateAutoWhitelisterMock.processEvents.mockRejectedValueOnce(new BlockchainConnectionError('msg', {}))

    await expect(privateAutoWhitelistService.start()).rejects.toThrow(BlockchainConnectionError)
  })

  it('should fail if getting the stop block number fails', async () => {
    autoWhitelistDataAgentMock.getStopBlockNumber.mockRejectedValueOnce(new Error())

    await expect(privateAutoWhitelistService.start()).rejects.toThrow(Error)
  })

  it('should fail if getting the last events fails', async () => {
    privateAutoWhitelistService = new PrivateAutoWhitelistService(
      eventProcessedDataAgentMock,
      autoWhitelistDataAgentMock,
      privateAutoWhitelisterMock,
      0
    )
    eventProcessedDataAgentMock.getLastEventProcessed.mockRejectedValueOnce(new Error())

    await expect(privateAutoWhitelistService.start()).rejects.toThrow(Error)
  })

  it('should prefer to auto whitelist using block number argument', async () => {
    privateAutoWhitelistService = new PrivateAutoWhitelistService(
      eventProcessedDataAgentMock,
      autoWhitelistDataAgentMock,
      privateAutoWhitelisterMock,
      10
    )
    eventProcessedDataAgentMock.getLastEventProcessed.mockResolvedValueOnce({ blockNumber: 7 })

    await privateAutoWhitelistService.start()

    expect(privateAutoWhitelisterMock.processEvents).toHaveBeenCalled()
  })

  it('should auto whitelist until ( including ) last block processed if block number argument is 0', async () => {
    privateAutoWhitelistService = new PrivateAutoWhitelistService(
      eventProcessedDataAgentMock,
      autoWhitelistDataAgentMock,
      privateAutoWhitelisterMock,
      0
    )
    eventProcessedDataAgentMock.getLastEventProcessed.mockResolvedValueOnce({ blockNumber: 7 })

    await privateAutoWhitelistService.start()

    expect(privateAutoWhitelisterMock.processEvents).toHaveBeenCalled()
  })
})
