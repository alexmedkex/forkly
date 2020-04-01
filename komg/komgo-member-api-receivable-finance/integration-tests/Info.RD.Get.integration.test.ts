import { buildFakeReceivablesDiscountingBase, IReceivablesDiscountingInfo, RDStatus, ReplyType } from '@komgo/types'
import Axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { compressToEncodedURIComponent } from 'lz-string'

import { Corporate } from './utils/Corporate'
import { FinancialInstitution } from './utils/FinancialInstitution'
import IntegrationEnvironment from './utils/IntegrationEnvironment'
import MessagingTestUtility from './utils/MessagingTestUtility'
import RFPMockUtils from './utils/RFP.mockutils'
import {
  assertRFPReplyCreatedInDB,
  createParticipantList,
  assertRDInfo,
  createResponseMessage
} from './utils/test-utils'

/**
 * This integration test uses a MongoDB real container.
 */
describe('Info.RD.Get', () => {
  let iEnv: IntegrationEnvironment
  let mockUtils: RFPMockUtils
  let trader: Corporate
  let bank: FinancialInstitution
  let messagingTestUtility: MessagingTestUtility

  beforeAll(async () => {
    trader = new Corporate()
    bank = new FinancialInstitution()

    mockUtils = new RFPMockUtils(new MockAdapter(Axios))

    iEnv = new IntegrationEnvironment(trader.companyStaticId)
    await iEnv.setup()

    messagingTestUtility = new MessagingTestUtility(iEnv)

    await iEnv.start()
  })

  afterAll(async () => {
    await iEnv.afterAll()
  })

  beforeEach(async () => {
    await trader.beforeEach(iEnv.iocContainer)
    await bank.beforeEach(iEnv.iocContainer)
  })

  afterAll(async () => {
    await iEnv.afterAll()
  })

  afterEach(async () => {
    mockUtils.reset()

    await trader.afterEach()
    await bank.afterEach()

    await messagingTestUtility.afterEach()
  })

  describe('get', () => {
    it('get IReceivableDiscountingInfo with PENDING_REQUEST status', async () => {
      const rdData = buildFakeReceivablesDiscountingBase()
      const rdId = await trader.createNewRD(rdData)

      const data = await trader.getRDInfo(rdId)

      assertRDInfo(data, rdData, RDStatus.PendingRequest)
    })

    it('get IReceivableDiscountingInfo with RFP and REQUESTED status', async () => {
      const rdData = buildFakeReceivablesDiscountingBase()
      const rdId = await trader.createNewRD(rdData)

      const participantStaticIds = createParticipantList(3)
      mockUtils.mockSuccessfullRFPRequest(participantStaticIds)
      await trader.createNewRFPRequest(rdId, participantStaticIds)

      const data = await trader.getRDInfo(rdId)

      assertRDInfo(data, rdData, RDStatus.Requested, participantStaticIds)
    })

    it('get IReceivableDiscountingInfo with RFP and REQUESTED status', async () => {
      const rdData = buildFakeReceivablesDiscountingBase()
      const rdId = await trader.createNewRD(rdData)

      const participantStaticIds = createParticipantList(3)
      mockUtils.mockSuccessfullRFPRequest(participantStaticIds)
      await trader.createNewRFPRequest(rdId, participantStaticIds)

      const data = await trader.getRDInfo(rdId)

      assertRDInfo(data, rdData, RDStatus.Requested, participantStaticIds)
    })

    it('get IReceivableDiscountingInfo with RFP and QuoteAccepted status', async () => {
      const rdData = buildFakeReceivablesDiscountingBase()
      const rdId = await trader.createNewRD(rdData)

      const participantStaticIds = [bank.companyStaticId]
      mockUtils.mockSuccessfullRFPRequest(participantStaticIds, false)
      await trader.createNewRFPRequest(rdId, participantStaticIds)

      // Trader receives submission from bank
      const quoteSubmissionMessage = createResponseMessage(
        rdId,
        bank.companyStaticId,
        bank.companyStaticId,
        ReplyType.Submitted
      )
      await bank.publishRFPResponse(quoteSubmissionMessage)
      await assertRFPReplyCreatedInDB(rdId, ReplyType.Submitted)

      // Trader accepts quote
      const quoteId = await trader.createNewQuote()
      await mockUtils.mockSuccessfulRFPReplyAccept()
      await trader.createNewQuoteAccept(rdId, quoteId, bank.companyStaticId)
      await assertRFPReplyCreatedInDB(rdId, ReplyType.Accepted, quoteId)

      const data = await trader.getRDInfo(rdId)

      assertRDInfo(data, rdData, RDStatus.QuoteAccepted, participantStaticIds)
      expect(data.acceptedParticipantStaticId).toEqual(bank.companyStaticId)
    })

    it('get fails when rdId is not found', async () => {
      try {
        await trader.getRDInfo('nonExistentRdId')
        fail('Expected failure')
      } catch (error) {
        expect(error.response.status).toBe(404)
      }
    })
  })

  describe('find', () => {
    describe.each([1, 2, 5, 10])('multiple trades', numberOfRdsToCreate => {
      it(`with no filter returns IReceivableDiscountingInfos for all RDs in DB for ${numberOfRdsToCreate} trades`, async () => {
        const rdsMap = await createMultipleRDs(numberOfRdsToCreate)

        const rdInfos = await trader.getRDInfoWithFilter()

        expect(rdInfos.items.length).toBe(numberOfRdsToCreate)
        expect(rdInfos.total).toBe(numberOfRdsToCreate)
        assertRDInfosOrderedByDescendingDate(rdInfos.items)
        for (const rdInfo of rdInfos.items) {
          await assertRDInfo(rdInfo, rdsMap[rdInfo.rd.staticId], RDStatus.PendingRequest)
        }
      })

      it(`with filter returns IReceivableDiscountingInfos for matching RDs in DB for ${numberOfRdsToCreate} trades`, async () => {
        const rdsMap = await createMultipleRDs(numberOfRdsToCreate)

        const tradeSourceIds: string[] = []
        Object.keys(rdsMap).forEach(function(key) {
          tradeSourceIds.push(rdsMap[key].tradeReference.sourceId)
        })
        const filterQueryParam = compressToEncodedURIComponent(JSON.stringify({ tradeSourceIds }))

        // Do the get with the filter
        const rdInfos = await trader.getRDInfoWithFilter(filterQueryParam)

        expect(rdInfos.items.length).toBe(numberOfRdsToCreate)
        assertRDInfosOrderedByDescendingDate(rdInfos.items)
        for (const rdInfo of rdInfos.items) {
          await assertRDInfo(rdInfo, rdsMap[rdInfo.rd.staticId], RDStatus.PendingRequest)
        }
      })

      it(`with filter returns IReceivableDiscountingInfos with RFP for matching RDs in DB for ${numberOfRdsToCreate} trades`, async () => {
        const participantStaticIds = createParticipantList(3)
        const rdsMap = await createMultipleRFPs(numberOfRdsToCreate, participantStaticIds)

        const tradeSourceIds: string[] = []
        Object.keys(rdsMap).forEach(function(key) {
          tradeSourceIds.push(rdsMap[key].tradeReference.sourceId)
        })
        const filterQueryParam = compressToEncodedURIComponent(JSON.stringify({ tradeSourceIds }))

        // Do the get with the filter
        const rdInfos = await trader.getRDInfoWithFilter(filterQueryParam)

        expect(rdInfos.items.length).toBe(numberOfRdsToCreate)
        assertRDInfosOrderedByDescendingDate(rdInfos.items)
        for (const rdInfo of rdInfos.items) {
          await assertRDInfo(rdInfo, rdsMap[rdInfo.rd.staticId], RDStatus.Requested, participantStaticIds)
        }
      })
    })

    it('returns empty if the filter contains trades without an RD', async () => {
      await trader.createNewRD()

      const filter = {
        tradeSourceIds: ['trade123']
      }
      const queryparm = compressToEncodedURIComponent(JSON.stringify(filter))
      const rdInfos = await trader.getRDInfoWithFilter(queryparm)

      expect(rdInfos.items.length).toBe(0)
    })

    it('fails if the filter is invalid', async () => {
      try {
        const filterQueryParam = compressToEncodedURIComponent(JSON.stringify({ tradeSourceIds: 'NotAnArray' }))
        await trader.getRDInfoWithFilter(filterQueryParam)
        fail('Expected failure')
      } catch (error) {
        expect(error.response.status).toBe(422)
      }
    })
  })

  async function createMultipleRDs(numberOfRds: number): Promise<{}> {
    const savedRdsMap = {}
    for (let i = 0; i < numberOfRds; i++) {
      const rdData = buildFakeReceivablesDiscountingBase(true)
      const rdId = await trader.createNewRD(rdData)
      savedRdsMap[rdId] = rdData
    }

    return savedRdsMap
  }

  async function createMultipleRFPs(numberOfRds: number, participantStaticIds: string[]): Promise<{}> {
    const savedRdsMap = {}
    for (let i = 0; i < numberOfRds; i++) {
      const rdData = buildFakeReceivablesDiscountingBase(true)
      const rdId = await trader.createNewRD(rdData)

      mockUtils.mockSuccessfullRFPRequest(participantStaticIds, false)
      mockUtils.passThroughRF()
      await trader.createNewRFPRequest(rdId, participantStaticIds)
      savedRdsMap[rdId] = rdData
    }

    return savedRdsMap
  }

  function assertRDInfosOrderedByDescendingDate(rdInfos: IReceivablesDiscountingInfo[]) {
    for (let i = 0; i < rdInfos.length; i++) {
      if (i > 0 && i < rdInfos.length - 1) {
        const prevRdInfo: IReceivablesDiscountingInfo = rdInfos[i - 1]
        const currentRdInfo = rdInfos[i]
        const nextRdInfo = rdInfos[i + 1]
        // check that the previous is the newest, the current is the middle and the next is the oldest
        expect(
          currentRdInfo.rd.createdAt < prevRdInfo.rd.createdAt && currentRdInfo.rd.createdAt > nextRdInfo.rd.createdAt
        )
      }
    }
  }
})
