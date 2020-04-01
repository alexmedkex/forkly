import { ICreateRFPRequest } from '@komgo/types'
import Axios, { AxiosRequestConfig } from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { v4 as uuid4 } from 'uuid'

import { RFPRequestModel } from '../src/data-layer/models/rfp/RFPRequestModel'

import { Corporate } from './utils/Corporate'
import IntegrationEnvironment from './utils/IntegrationEnvironment'
import RFPMockUtils from './utils/RFP.mockutils'
import { createParticipantList, assertRFPCreatedInDB } from './utils/test-utils'

/**
 * This integration test uses a MongoDB real container.
 */
describe('RFP.Send.Request', () => {
  let member = new Corporate()
  let mockUtils: RFPMockUtils
  let iEnv: IntegrationEnvironment

  beforeAll(async () => {
    member = new Corporate()
    mockUtils = new RFPMockUtils(new MockAdapter(Axios))
    iEnv = new IntegrationEnvironment(member.companyStaticId) // Request flow is done by traders
    await iEnv.setup()

    await iEnv.start()
  })

  beforeEach(async () => {
    await member.beforeEach(iEnv.iocContainer)
  })

  afterAll(async () => {
    await iEnv.afterAll()
  })

  afterEach(async () => {
    await member.afterEach()

    mockUtils.reset()
  })

  describe('validation', () => {
    it('should fail validation if rdId and participantStaticIds are not defined', async () => {
      try {
        await member.createNewRFPRequest()
        fail('Expected failure')
      } catch (error) {
        const { status, data } = error.response
        expect(status).toEqual(400)
        expect(data.fields.rfpRequest.rdId).toBeDefined()
        expect(data.fields.rfpRequest.participantStaticIds).toBeDefined()
      }
    })

    it('should fail validation if rdId is not uuid and participantStaticIds is empty', async () => {
      try {
        await member.createNewRFPRequest('invalidRdId', [])
        fail('Expected failure')
      } catch (error) {
        const { status, data } = error.response
        expect(status).toEqual(422)
        expect(data.fields.rdId).toBeDefined()
        expect(data.fields.participantStaticIds).toBeDefined()
      }
    })

    it('should fail validation if rdId does not exist in DB', async () => {
      const nbParticipans = 3
      const participantStaticIds = createParticipantList(nbParticipans)

      try {
        await member.createNewRFPRequest(uuid4(), participantStaticIds)
        fail('Expected failure')
      } catch (error) {
        const { status, data } = error.response
        expect(status).toEqual(422)
        expect(data.fields.rdId).toEqual(['The specified Receivable discounting data could not be found'])
      }
    })

    it('should fail validation if an RFP Request already exists with given rdId', async () => {
      const nbParticipans = 3
      const participantStaticIds = createParticipantList(nbParticipans)
      mockUtils.mockSuccessfullRFPRequest(participantStaticIds)

      const rdId = await member.createNewRD()

      try {
        await member.createNewRFPRequest(rdId, participantStaticIds)
        await member.createNewRFPRequest(rdId, participantStaticIds)
        fail('Expected failure')
      } catch (error) {
        const { status, data } = error.response
        expect(status).toEqual(409)
        expect(data.message).toEqual('A Request for proposal already exists for the chosen RD application')
      }
    })

    it('should fail validation if not all participants are komgo members', async () => {
      const nbParticipans = 3
      const participantStaticIds = createParticipantList(nbParticipans)
      mockUtils.mockParticipantsNotMembers()

      const rdId = await member.createNewRD()

      try {
        await member.createNewRFPRequest(rdId, participantStaticIds)
        fail('Expected failure')
      } catch (error) {
        const { status, data } = error.response
        expect(status).toEqual(422)
        expect(data.fields.participantStaticIds).toEqual(['All participants should be komgo members'])
      }
    })
  })

  describe('success', () => {
    it('should create a RFP Request successfully', async () => {
      const nbParticipans = 3
      const participantStaticIds = createParticipantList(nbParticipans)

      let postData: ICreateRFPRequest
      mockUtils.captureRFPRequest(participantStaticIds, (cfg: AxiosRequestConfig) => {
        postData = JSON.parse(cfg.data)
      })

      const rdId = await member.createNewRD()

      await member.createNewRFPRequest(rdId, participantStaticIds)
      await assertRFPCreatedInDB(rdId)
      const rfpRequest = await RFPRequestModel.findOne({ rdId })

      expect(postData.participantStaticIds).toEqual(participantStaticIds)
      expect(postData.rfp.context).toMatchObject({ productId: 'tradeFinance', subProductId: 'rd', rdId })
      expect(postData.rfp.productRequest).toMatchObject({
        createdAt: new Date(rfpRequest.createdAt).toJSON(),
        updatedAt: new Date(rfpRequest.updatedAt).toJSON()
      })
      expect(postData.rfp.productRequest.rd).toMatchObject({
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      })
      expect(postData.rfp.productRequest.trade).toMatchObject({
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      })
    })
  })

  describe('failures and retries', () => {
    it('should create a RFP Request successfully if first attempt fails at api-registry', async () => {
      const nbParticipans = 3
      const participantStaticIds = createParticipantList(nbParticipans)
      mockUtils.mockErrorApiRegistryAndRetry(participantStaticIds)

      const rdId = await member.createNewRD()
      try {
        await member.createNewRFPRequest(rdId, participantStaticIds)
        fail('Expected failure')
      } catch (error) {
        const { status } = error.response
        expect(status).toEqual(500)
      }

      await member.createNewRFPRequest(rdId, participantStaticIds)
      await assertRFPCreatedInDB(rdId)
    })

    it('should create a RFP Request successfully if first attempt fails at api-trade-cargo', async () => {
      const nbParticipans = 3
      const participantStaticIds = createParticipantList(nbParticipans)
      mockUtils.mockErrorApiTradeCargoAndRetry(participantStaticIds)

      const rdId = await member.createNewRD()
      try {
        await member.createNewRFPRequest(rdId, participantStaticIds)
        fail('Expected failure')
      } catch (error) {
        const { status } = error.response
        expect(status).toEqual(500)
      }

      await member.createNewRFPRequest(rdId, participantStaticIds)
      await assertRFPCreatedInDB(rdId)
    })

    it('should create a RFP Request successfully if first attempt fails at api-rfp', async () => {
      const nbParticipans = 3
      const participantStaticIds = createParticipantList(nbParticipans)
      mockUtils.mockErrorApiRFPAndRetry(participantStaticIds)

      const rdId = await member.createNewRD()
      try {
        await member.createNewRFPRequest(rdId, participantStaticIds)
        fail('Expected failure')
      } catch (error) {
        const { status } = error.response
        expect(status).toEqual(500)
      }

      await member.createNewRFPRequest(rdId, participantStaticIds)
      await assertRFPCreatedInDB(rdId)
    })
  })
})
