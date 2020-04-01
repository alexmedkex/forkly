import { buildFakeReceivablesDiscountingBase, IReceivablesDiscountingBase } from '@komgo/types'
import Axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

import { Corporate } from './utils/Corporate'
import { FinancialInstitution } from './utils/FinancialInstitution'
import IntegrationEnvironment from './utils/IntegrationEnvironment'
import MessagingTestUtility from './utils/MessagingTestUtility'
import RFPMockUtils from './utils/RFP.mockutils'
import { createRFP } from './utils/test-utils'

describe('RD.Replace integration test', () => {
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
    it('should update receivables discounting data with valid data', async () => {
      rdBase.numberOfDaysDiscounting = 20
      const rdId = await trader.createNewRD(rdBase)
      const originalRd = (await trader.getRDInfo(rdId)).rd

      const rdUpdate = cleanEmptyFields({
        ...rdBase,
        invoiceAmount: 12312312,
        discountingDate: '2019-06-01T00:00:00.000Z',
        dateOfPerformance: '2019-05-19T00:00:00.000Z',
        numberOfDaysDiscounting: 5
      }) as IReceivablesDiscountingBase

      const response = await trader.replaceRD(rdId, rdUpdate)

      const { version, ...updateWithoutVersion } = rdUpdate
      expect(response.status).toBe(200)
      expect(response.data).toMatchObject(cleanEmptyFields({ staticId: rdId, ...updateWithoutVersion }))
      expect(response.data.numberOfDaysDiscounting).toBe(5)
      expect(response.data.updatedAt).toBeDefined()

      expect(response.data.createdAt).toEqual(originalRd.createdAt)
      expect(Date.parse(response.data.updatedAt)).toBeGreaterThan(Date.parse(response.data.createdAt))
      expect(Date.parse(response.data.updatedAt)).toBeGreaterThan(Date.parse(originalRd.updatedAt))
    })
  })

  describe('Failures', () => {
    it('should fail if the RD does not exist', async () => {
      const rdId = 'test-rd-id'
      const rdUpdate = cleanEmptyFields({
        ...rdBase,
        invoiceAmount: 12312312
      }) as IReceivablesDiscountingBase

      try {
        await trader.replaceRD(rdId, rdUpdate)
        fail('Expected failure')
      } catch (e) {
        expect(e.response).toMatchObject({
          status: 404,
          data: {
            errorCode: 'EDAT01',
            message: 'RD with ID "test-rd-id" was not found'
          }
        })
      }
    })

    it('should fail if the request has been pushed to market', async () => {
      const rdId = await createRFP(trader, bank, rdBase, mockUtils)
      const rdUpdate = cleanEmptyFields({
        ...rdBase,
        invoiceAmount: 12312312
      }) as IReceivablesDiscountingBase

      try {
        await trader.replaceRD(rdId, rdUpdate)
        fail('Expected failure')
      } catch (e) {
        expect(e.response).toMatchObject({
          status: 422,
          data: {
            errorCode: 'EVAL06',
            message: `An RFP already exists for this RD`
          }
        })
      }
    })

    it('should fail if it fails initial JSON schema validation', async () => {
      const rdId = await trader.createNewRD(rdBase)
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
        await trader.replaceRD(rdId, rdUpdate)
        fail('Expected failure')
      } catch (e) {
        expect(e.response).toMatchObject({
          status: 422,
          data: {
            fields: {
              discountingDate: [`'discountingDate' should match format "date"`],
              advancedRate: [`'advancedRate' should be higher than or equal to 1`],
              dateOfPerformance: [`'dateOfPerformance' should match format "date"`],
              numberOfDaysDiscounting: [`'numberOfDaysDiscounting' should be higher than or equal to 1`],
              'tradeReference.sellerEtrmId': [`'tradeReference.sellerEtrmId' should not be empty`],
              'tradeReference.sourceId': [`'tradeReference.sourceId' should not be empty`],
              'tradeReference.source': [`'tradeReference.source' should not be empty`]
            }
          }
        })
      }
    })
  })

  const cleanEmptyFields = (obj: object) =>
    Object.entries(obj)
      .filter(([_, value]) => ![null, undefined].includes(value))
      .reduce((memo, [key, value]) => ({ ...memo, [key]: value }), {})
})
