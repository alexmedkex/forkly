import { ErrorCode } from '@komgo/error-utilities'
import {
  buildFakeReceivablesDiscountingBase,
  IReceivablesDiscountingBase,
  Currency,
  ReplyType,
  IReceivablesDiscounting,
  RequestType,
  DiscountingType
} from '@komgo/types'
import Axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { compressToEncodedURIComponent } from 'lz-string'

import { Corporate } from './utils/Corporate'
import { FinancialInstitution } from './utils/FinancialInstitution'
import IntegrationEnvironment from './utils/IntegrationEnvironment'
import MessagingTestUtility from './utils/MessagingTestUtility'
import RFPMockUtils from './utils/RFP.mockutils'
import {
  createResponseMessage,
  updateRDMultipleTimes,
  createRFP,
  createAcceptedRD,
  assertRDsMatchIgnoringCreatedAt
} from './utils/test-utils'

const MOCK_DATE = '2019-01-31'

describe('RD.Update integration test', () => {
  let iEnv: IntegrationEnvironment
  let mockUtils: RFPMockUtils
  let trader: Corporate
  let bank: FinancialInstitution
  let messagingTestUtility: MessagingTestUtility
  let rdBase: IReceivablesDiscountingBase

  beforeAll(async () => {
    trader = new Corporate()
    bank = new FinancialInstitution()

    mockUtils = new RFPMockUtils(new MockAdapter(Axios))

    iEnv = new IntegrationEnvironment(trader.companyStaticId) // Accept quote flow is done by corporates
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

    rdBase = buildFakeReceivablesDiscountingBase(true)
    rdBase.advancedRate = 10
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

  describe('success', () => {
    let rdId: string
    beforeEach(async () => {
      const res = await createAcceptedRD(trader, bank, rdBase, mockUtils)
      rdId = res.rdId
    })

    it('should update receivables discounting data with valid data', async () => {
      const rdUpdate: IReceivablesDiscountingBase = {
        ...rdBase,
        invoiceAmount: 12312312,
        discountingDate: '2019-06-01T00:00:00.000Z',
        dateOfPerformance: '2019-05-19T00:00:00.000Z',
        numberOfDaysDiscounting: rdBase.numberOfDaysDiscounting + 1,
        comment: 'comment'
      }

      const response = await trader.updateRD(rdId, rdUpdate)
      const { version, numberOfDaysDiscounting, ...updateWithoutVersion } = rdUpdate

      expect(response.status).toBe(200)
      expect(response.data).toEqual(expect.objectContaining(updateWithoutVersion))
      expect(response.data.createdAt).toBeDefined()
      expect(response.data.staticId).toBeDefined()
    })

    it('should get the updated RD when calling the GET', async () => {
      const rdUpdate: IReceivablesDiscountingBase = {
        ...rdBase,
        invoiceAmount: 123
      }
      const response = await trader.updateRD(rdId, rdUpdate)
      expect(response.status).toBe(200)

      const rd = (await trader.getRDInfo(rdId)).rd
      assertRDsMatchIgnoringCreatedAt(rd, { ...rdUpdate, staticId: rdId })
      expect(rd._id).toBe(undefined)
    })

    it('should strip out staticId, createdAt, _id, updatedAt before it updates the RD', async () => {
      const rdUpdate: IReceivablesDiscounting = {
        ...rdBase,
        invoiceAmount: 123,
        staticId: rdId,
        createdAt: '2019-06-04',
        updatedAt: '2019-07-04'
      }

      const response = await trader.updateRD(rdId, rdUpdate)
      expect(response.status).toBe(200)

      const rd = (await trader.getRDInfo(rdId)).rd
      assertRDsMatchIgnoringCreatedAt(rd, { ...rdUpdate, staticId: rdId })
      expect(rd._id).toBe(undefined)
      expect(new Date(rd.createdAt).toJSON()).not.toEqual(new Date(rdUpdate.createdAt).toJSON())
    })
  })

  describe('success with deleted optional values', () => {
    it('should be able to update an RD when it has deleted optional values', async () => {
      delete rdBase.advancedRate
      const { rdId } = await createAcceptedRD(trader, bank, rdBase, mockUtils)

      const rdUpdate: IReceivablesDiscountingBase = {
        ...rdBase,
        invoiceAmount: 123
      }
      const response = await trader.updateRD(rdId, rdUpdate)
      expect(response.status).toBe(200)

      const rd = (await trader.getRDInfo(rdId)).rd
      assertRDsMatchIgnoringCreatedAt(rd, { ...rdUpdate, staticId: rdId })
      expect(rd._id).toBe(undefined)
    })

    it('should be able to update an RD when it initally has deleted optional values, which then get set in an update', async () => {
      delete rdBase.dateOfPerformance
      const { rdId } = await createAcceptedRD(trader, bank, rdBase, mockUtils)

      const rdUpdate: IReceivablesDiscountingBase = {
        ...rdBase,
        dateOfPerformance: '2019-06-04'
      }
      const rdBeforeUpdate = (await trader.getRDInfo(rdId)).rd
      const response = await trader.updateRD(rdId, rdUpdate)
      expect(response.status).toBe(200)

      const rd = (await trader.getRDInfo(rdId)).rd
      assertRDsMatchIgnoringCreatedAt(rd, { ...rdUpdate, staticId: rd.staticId })
      expect(rd._id).toBe(undefined)
      expect(new Date(rd.createdAt).toJSON()).not.toEqual(new Date(rdBeforeUpdate.createdAt).toJSON())
    })
  })

  describe('GET RDs after multiple updates', () => {
    describe.each([1, 2, 5])('Update multiple RDs and GET', numberOfRDs => {
      it('should getAll RDs after each one has been updated multiple times', async () => {
        const updatesPerRD = 3

        const createdRds = await createAcceptedRDs(numberOfRDs)
        for (let i = 0; i < numberOfRDs; i++) {
          await updateRDMultipleTimes(trader, createdRds[i], updatesPerRD)
        }

        const rdInfos = (await trader.getRDInfoWithFilter()).items
        expect(rdInfos.length).toBe(numberOfRDs)

        const rdInfosIds = rdInfos.map(rdInfo => {
          return rdInfo.rd.staticId
        })
        const createdRdIds = createdRds.map(rd => {
          return rd.staticId
        })
        expect(rdInfosIds.sort()).toMatchObject(createdRdIds.sort())
      })

      it('should get RDs with traderSourceId filter after each one has been updated multiple times', async () => {
        const updatesPerRD = 3

        const createdRds = await createAcceptedRDs(numberOfRDs)
        for (let i = 0; i < numberOfRDs - 1; i++) {
          await updateRDMultipleTimes(trader, createdRds[i], updatesPerRD)
        }

        const tradeSourceIds = createdRds.map(rd => {
          return rd.tradeReference.sourceId
        })
        const filterQueryParam = compressToEncodedURIComponent(JSON.stringify({ tradeSourceIds }))
        const rdInfos = (await trader.getRDInfoWithFilter(filterQueryParam)).items
        expect(rdInfos.length).toBe(tradeSourceIds.length)

        const rdInfosIds = rdInfos.map(rdInfo => {
          return rdInfo.rd.staticId
        })
        const createdRdIds = createdRds.map(rd => {
          return rd.staticId
        })
        expect(rdInfosIds.sort()).toMatchObject(createdRdIds.sort())
      })
    })

    it('should get a set of RDs limited by traderSourceId filter after each one has been updated multiple times', async () => {
      const updatesPerRD = 3
      const numberOfRDs = 5

      const createdRds = await createAcceptedRDs(numberOfRDs)
      for (let i = 0; i < numberOfRDs - 1; i++) {
        await updateRDMultipleTimes(trader, createdRds[i], updatesPerRD)
      }

      const tradeSourceIds = [createdRds[0].tradeReference.sourceId, createdRds[1].tradeReference.sourceId]
      const filterQueryParam = compressToEncodedURIComponent(JSON.stringify({ tradeSourceIds }))
      const rdInfos = (await trader.getRDInfoWithFilter(filterQueryParam)).items
      expect(rdInfos.length).toBe(tradeSourceIds.length)

      const rdsTradeSourceIds = rdInfos.map(rdInfo => {
        return rdInfo.rd.tradeReference.sourceId
      })
      expect(rdsTradeSourceIds.sort()).toMatchObject(tradeSourceIds.sort())
    })
  })

  describe('failures', () => {
    it('fails if RD does not exist', async () => {
      try {
        await trader.updateRD('invalidRdId', { ...rdBase, invoiceAmount: 1000000 })
        fail('Expected failure')
      } catch (error) {
        expect(error.response.status).toBe(404)
        expect(error.response.data.errorCode).toBe(ErrorCode.DatabaseMissingData)
      }
    })

    it('fails if RD has not been accepted', async () => {
      const id = await createRFP(trader, bank, rdBase, mockUtils)
      const quoteSubmissionMessage = createResponseMessage(
        id,
        bank.companyStaticId,
        bank.companyStaticId,
        ReplyType.Submitted
      )
      await bank.publishRFPResponse(quoteSubmissionMessage)
      await trader.createNewQuote()
      await mockUtils.mockSuccessfulRFPReplyAccept()

      try {
        await trader.updateRD(id, { ...rdBase, invoiceAmount: 1000000 })
        fail('Expected failure')
      } catch (error) {
        expect(error.response.status).toBe(422)
        expect(error.response.data.errorCode).toBe(ErrorCode.ValidationInvalidOperation)
      }
    })

    describe('Field Validation failures', () => {
      it('fails if all uneditable fields are changed', async () => {
        const { rdId } = await createAcceptedRD(trader, bank, rdBase, mockUtils)
        const rdUpdate: IReceivablesDiscountingBase = {
          ...rdBase,
          tradeReference: { ...rdBase.tradeReference, sellerEtrmId: 'changedEtrmId' },
          advancedRate: 85,
          currency: rdBase.currency === Currency.USD ? Currency.EUR : Currency.USD
        }

        try {
          await trader.updateRD(rdId, rdUpdate)
          fail('Expected failure')
        } catch (error) {
          expect(error.response.data.fields).toMatchObject({
            advancedRate: ['Field is not editable'],
            currency: ['Field is not editable'],
            tradeReference: ['Field is not editable']
          })
        }
      })

      it('fails if uneditable optional fields are deleted', async () => {
        const { rdId } = await createAcceptedRD(trader, bank, rdBase, mockUtils)
        const rdUpdate: IReceivablesDiscountingBase = {
          ...rdBase
        }
        delete rdUpdate.advancedRate

        try {
          await trader.updateRD(rdId, rdUpdate)
          fail('Expected failure')
        } catch (error) {
          expect(error.response.data.fields).toMatchObject({
            advancedRate: ['Field is not editable']
          })
        }
      })

      it('fails if uneditable optional fields are added', async () => {
        const rdUpdate: IReceivablesDiscountingBase = {
          ...rdBase
        }
        delete rdBase.advancedRate

        const { rdId } = await createAcceptedRD(trader, bank, rdBase, mockUtils)

        try {
          await trader.updateRD(rdId, rdUpdate)
          fail('Expected failure')
        } catch (error) {
          expect(error.response.data.fields).toMatchObject({
            advancedRate: ['Field is not editable']
          })
        }
      })

      it('should fail if it fails initial JSON schema validation', async () => {
        const { rdId } = await createAcceptedRD(trader, bank, rdBase, mockUtils)
        const rdUpdate: IReceivablesDiscountingBase = {
          ...rdBase
        }
        rdUpdate.tradeReference.sellerEtrmId = ''
        rdUpdate.tradeReference.sourceId = ''
        rdUpdate.tradeReference.source = ''
        rdUpdate.advancedRate = 0
        rdUpdate.numberOfDaysDiscounting = 0
        rdUpdate.dateOfPerformance = 'stringdate'
        rdUpdate.discountingDate = 'stringdate'

        try {
          await trader.updateRD(rdId, rdUpdate)
          fail('Expected failure')
        } catch (e) {
          expect(e.response.status).toBe(422)
          expect(e.response.data.fields).toMatchObject({
            discountingDate: [`'discountingDate' should match format "date"`],
            advancedRate: [`'advancedRate' should be higher than or equal to 1`],
            dateOfPerformance: [`'dateOfPerformance' should match format "date"`],
            numberOfDaysDiscounting: [`'numberOfDaysDiscounting' should be higher than or equal to 1`],
            'tradeReference.sellerEtrmId': [`'tradeReference.sellerEtrmId' should not be empty`],
            'tradeReference.sourceId': [`'tradeReference.sourceId' should not be empty`],
            'tradeReference.source': [`'tradeReference.source' should not be empty`]
          })
        }
      })
    })

    describe('optionals dateOfPerformance and discountingDate validation', () => {
      let rdId: string
      beforeEach(async () => {
        delete rdBase.dateOfPerformance
        const res = await createAcceptedRD(trader, bank, rdBase, mockUtils)
        rdId = res.rdId
      })

      it('should update RD data without optional dateOfPerformance', async () => {
        const rdUpdate: IReceivablesDiscountingBase = {
          ...rdBase,
          invoiceAmount: 12312312,
          discountingDate: '2019-06-01T00:00:00.000Z'
        }

        const response = await trader.updateRD(rdId, rdUpdate)
        const { version, numberOfDaysDiscounting, ...updateWithoutVersion } = rdUpdate

        expect(response.status).toBe(200)
        expect(response.data).toEqual(expect.objectContaining(updateWithoutVersion))
      })

      it('should update RD when optional dateOfPerformance is added in update', async () => {
        const rdUpdate: IReceivablesDiscountingBase = {
          ...rdBase,
          invoiceAmount: 12312312,
          discountingDate: '2019-06-01T00:00:00.000Z',
          dateOfPerformance: '2019-06-02T00:00:00.000Z'
        }

        const response = await trader.updateRD(rdId, rdUpdate)
        const { version, numberOfDaysDiscounting, ...updateWithoutVersion } = rdUpdate

        expect(response.status).toBe(200)
        expect(response.data).toEqual(expect.objectContaining(updateWithoutVersion))
      })

      it('should fail if discountingDate is removed in update for Discount RequestType', async () => {
        const rdUpdate: IReceivablesDiscountingBase = {
          ...rdBase,
          invoiceAmount: 12312312,
          discountingDate: undefined
        }

        try {
          await trader.updateRD(rdId, rdUpdate)
          fail('Expected failure')
        } catch (e) {
          expect(e.response.status).toBe(422)
          expect(e.response.data.fields).toMatchObject({
            // tslint:disable-next-line: quotemark
            discountingDate: ["should have required property 'discountingDate'"]
          })
        }
      })
    })

    describe.each([RequestType.RiskCoverDiscounting, RequestType.RiskCover])(
      'RiskCover & RiskCoverDiscounting update',
      requestType => {
        let rdData: IReceivablesDiscountingBase
        let rdId: string

        beforeEach(async () => {
          rdData = buildFakeReceivablesDiscountingBase(true)
          rdData.requestType = requestType
          rdData.riskCoverDate = MOCK_DATE
          rdData.numberOfDaysRiskCover = 50

          const res = await createAcceptedRD(trader, bank, rdData, mockUtils)
          rdId = res.rdId
        })

        it(`success ${requestType}`, async () => {
          const rdUpdate = { ...rdData, numberOfDaysRiskCover: 99 }
          await trader.updateRD(rdId, { ...rdData, numberOfDaysRiskCover: 99 })

          const rd = (await trader.getRDInfo(rdId)).rd
          assertRDsMatchIgnoringCreatedAt(rd, { ...rdUpdate, staticId: rd.staticId })
        })

        it(`validate missing mandatory fields ${requestType}`, async () => {
          const rdUpdate = { ...rdData }
          delete rdUpdate.riskCoverDate
          delete rdUpdate.numberOfDaysRiskCover
          try {
            await trader.updateRD(rdId, rdUpdate)
            fail('Expected failure')
          } catch (e) {
            expect(e.response.data.fields).toEqual({
              riskCoverDate: ["should have required property 'riskCoverDate'"],
              numberOfDaysRiskCover: ["should have required property 'numberOfDaysRiskCover'"]
            })
          }
        })
      }
    )

    describe('Discount Blended update', () => {
      let rdId: string

      beforeEach(async () => {
        rdBase.requestType = RequestType.Discount
        rdBase.discountingType = DiscountingType.Blended
        rdBase.riskCoverDate = MOCK_DATE
        rdBase.numberOfDaysRiskCover = 50
        rdBase.numberOfDaysDiscounting = 10
        rdBase.discountingDate = MOCK_DATE

        const res = await createAcceptedRD(trader, bank, rdBase, mockUtils)
        rdId = res.rdId
      })

      it('success', async () => {
        const rdUpdate = { ...rdBase, dateOfPerformance: MOCK_DATE }
        await trader.updateRD(rdId, rdUpdate)

        const rd = (await trader.getRDInfo(rdId)).rd
        assertRDsMatchIgnoringCreatedAt(rd, { ...rdUpdate, staticId: rd.staticId })
      })

      it('validate missing mandatory fields ', async () => {
        const rdUpdate = { ...rdBase }
        delete rdUpdate.riskCoverDate
        delete rdUpdate.numberOfDaysRiskCover
        delete rdUpdate.discountingDate
        delete rdUpdate.numberOfDaysDiscounting

        try {
          await trader.updateRD(rdId, rdUpdate)
          fail('Expected failure')
        } catch (e) {
          expect(e.response.data.fields).toEqual({
            riskCoverDate: ["should have required property 'riskCoverDate'"],
            numberOfDaysRiskCover: ["should have required property 'numberOfDaysRiskCover'"],
            discountingDate: ["should have required property 'discountingDate'"],
            numberOfDaysDiscounting: ["should have required property 'numberOfDaysDiscounting'"]
          })
        }
      })
    })
  })

  async function createAcceptedRDs(count: number): Promise<any[]> {
    const rds = []
    for (let i = 0; i < count; i++) {
      const rdB = buildFakeReceivablesDiscountingBase(true)
      rdB.advancedRate = 89
      const { rdId: id } = await createAcceptedRD(trader, bank, rdB, mockUtils)
      rds.push({ ...rdB, staticId: id })
    }
    return rds
  }
})
