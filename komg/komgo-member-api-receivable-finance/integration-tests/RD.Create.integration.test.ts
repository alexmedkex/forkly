import {
  buildFakeReceivablesDiscountingBase,
  FinancialInstrument,
  SupportingInstrument,
  RequestType,
  DiscountingType,
  IReceivablesDiscountingBase
} from '@komgo/types'

import { Corporate } from './utils/Corporate'
import IntegrationEnvironment from './utils/IntegrationEnvironment'
import { assertRDMatches, getRDFromApi } from './utils/test-utils'

/**
 * This integration test uses a MongoDB real container.
 */
describe('RD.Create integration test', () => {
  let trader: Corporate
  let iEnv: IntegrationEnvironment

  beforeAll(async () => {
    trader = new Corporate()
    iEnv = new IntegrationEnvironment(trader.companyStaticId) // Creating RDs is done by traders only
    await iEnv.setup()

    await iEnv.start()
  })

  beforeEach(async () => {
    await trader.beforeEach(iEnv.iocContainer)
  })

  afterAll(async () => {
    await iEnv.afterAll()
  })

  afterEach(async () => {
    await trader.afterEach()
  })

  describe('Discounting', () => {
    describe('validation', () => {
      it('should fail if tradeReference has invalid data', async () => {
        const rdData = buildFakeReceivablesDiscountingBase()
        rdData.tradeReference.sellerEtrmId = ''
        rdData.tradeReference.sourceId = ''
        rdData.tradeReference.source = ''

        try {
          await trader.createNewRD(rdData)
          fail('Expected failure')
        } catch (e) {
          expect(e.response.status).toBe(422)
          expect(e.response.data.fields).toMatchObject({
            'tradeReference.sellerEtrmId': [`'tradeReference.sellerEtrmId' should not be empty`],
            'tradeReference.sourceId': [`'tradeReference.sourceId' should not be empty`],
            'tradeReference.source': [`'tradeReference.source' should not be empty`]
          })
        }
      })

      it('should fail if invalid date data', async () => {
        const rdData = buildFakeReceivablesDiscountingBase()
        rdData.dateOfPerformance = 'stringdate'
        rdData.discountingDate = 'stringdate'
        rdData.riskCoverDate = 'stringdate'

        try {
          await trader.createNewRD(rdData)
          fail('Expected failure')
        } catch (e) {
          expect(e.response.status).toBe(422)
          expect(e.response.data.fields).toMatchObject({
            discountingDate: [`'discountingDate' should match format "date"`],
            riskCoverDate: [`'riskCoverDate' should match format "date"`],
            dateOfPerformance: [`'dateOfPerformance' should match format "date"`]
          })
        }
      })

      it('should fail if minimum number validation fails', async () => {
        const rdData = buildFakeReceivablesDiscountingBase()
        rdData.advancedRate = 0
        rdData.numberOfDaysDiscounting = 0

        try {
          await trader.createNewRD(rdData)
          fail('Expected failure')
        } catch (e) {
          expect(e.response.status).toBe(422)
          expect(e.response.data.fields).toMatchObject({
            advancedRate: [`'advancedRate' should be higher than or equal to 1`],
            numberOfDaysDiscounting: [`'numberOfDaysDiscounting' should be higher than or equal to 1`]
          })
        }
      })

      it('should fail if maximum number validation fails', async () => {
        const rdData = buildFakeReceivablesDiscountingBase()
        rdData.advancedRate = 101

        try {
          await trader.createNewRD(rdData)
          fail('Expected failure')
        } catch (e) {
          expect(e.response.status).toBe(422)
          expect(e.response.data.fields).toMatchObject({
            advancedRate: [`'advancedRate' should be less than or equal to 100`]
          })
        }
      })

      it('should fail with 409 if a trade with a duplicate sourceId is used for mulitple receivables discounting requests', async () => {
        const rdData = buildFakeReceivablesDiscountingBase()
        await trader.createNewRD(rdData)

        try {
          const newRdData = buildFakeReceivablesDiscountingBase(true)
          newRdData.tradeReference.sourceId = rdData.tradeReference.sourceId
          await trader.createNewRD(newRdData)
          fail('Expected failure')
        } catch (e) {
          expect(e.response.status).toBe(409)
        }
      })

      it('should fail with 409 if a trade with a duplicate sellerEtrmId is used for mulitple receivables discounting requests', async () => {
        const rdData = buildFakeReceivablesDiscountingBase()
        await trader.createNewRD(rdData)
        try {
          const newRdData = buildFakeReceivablesDiscountingBase(true)
          newRdData.tradeReference.sellerEtrmId = rdData.tradeReference.sellerEtrmId
          await trader.createNewRD(newRdData)
          fail('Expected failure')
        } catch (e) {
          expect(e.response.status).toBe(409)
        }
      })

      it('should require financial info if FinancialInstrument is given as a supported instrument', async () => {
        const rdData = buildFakeReceivablesDiscountingBase()
        rdData.supportingInstruments = [SupportingInstrument.FinancialInstrument]

        try {
          await trader.createNewRD(rdData)
          fail('Expected failure')
        } catch (e) {
          expect(e.response.status).toBe(422)
          expect(e.response.data.fields).toMatchObject({
            financialInstrumentInfo: [expect.any(String)]
          })
        }
      })

      it('should require guarantor if ParentCompanyGuarantee is given as a supported instrument', async () => {
        const rdData = buildFakeReceivablesDiscountingBase()
        rdData.supportingInstruments = [SupportingInstrument.ParentCompanyGuarantee]

        try {
          await trader.createNewRD(rdData)
          fail('Expected failure')
        } catch (e) {
          expect(e.response.status).toBe(422)
          expect(e.response.data.fields).toMatchObject({
            guarantor: [expect.any(String)]
          })
        }
      })

      it('should fail if financialInstrumentIfOther is empty and financialInstrument.Other is given', async () => {
        const rdData = enrichWithOtherFinancialInstrument(buildFakeReceivablesDiscountingBase(true))
        delete rdData.financialInstrumentInfo.financialInstrumentIfOther
        delete rdData.dateOfPerformance

        try {
          await trader.createNewRD(rdData)
          fail('Expected failure')
        } catch (e) {
          expect(e.response.status).toBe(422)
          expect(e.response.data.fields).toMatchObject({
            financialInstrumentIfOther: [`should have required property 'financialInstrumentIfOther'`]
          })
        }
      })
    })

    describe('success', () => {
      it('should create receivables discounting data with valid data', async () => {
        const rdData = buildFakeReceivablesDiscountingBase(true)
        rdData.comment = 'comment'
        delete rdData.dateOfPerformance

        const rdId = await trader.createNewRD(rdData)
        await assertRDMatches(rdData, await getRDFromApi(trader, rdId))
      })

      it('should create receivables discounting data with valid supportingInstruments: Financial Instrument', async () => {
        const rdData = buildFakeReceivablesDiscountingBase(true)
        delete rdData.dateOfPerformance
        rdData.supportingInstruments = [SupportingInstrument.FinancialInstrument, SupportingInstrument.CreditInsurance]
        rdData.financialInstrumentInfo = {
          financialInstrument: FinancialInstrument.LC,
          financialInstrumentIssuerName: 'Komgo'
        }

        const rdId = await trader.createNewRD(rdData)
        await assertRDMatches(rdData, await getRDFromApi(trader, rdId))
      })

      it('should create receivables discounting data with valid supportingInstruments: FinancialInstrument and ParentCompanyGuarantee', async () => {
        const rdData = buildFakeReceivablesDiscountingBase(true)
        delete rdData.dateOfPerformance
        rdData.supportingInstruments = [
          SupportingInstrument.FinancialInstrument,
          SupportingInstrument.ParentCompanyGuarantee
        ]
        rdData.financialInstrumentInfo = {
          financialInstrument: FinancialInstrument.LC,
          financialInstrumentIssuerName: 'Komgo'
        }
        rdData.guarantor = 'SomeGuy'

        const rdId = await trader.createNewRD(rdData)
        await assertRDMatches(rdData, await getRDFromApi(trader, rdId))
      })

      it('should create receivables discounting data with Other financialInstrumentInfo and financialInstrumentIfOther populated', async () => {
        const rdData = enrichWithOtherFinancialInstrument(buildFakeReceivablesDiscountingBase(true))
        delete rdData.dateOfPerformance

        const rdId = await trader.createNewRD(rdData)
        await assertRDMatches(rdData, await getRDFromApi(trader, rdId))
      })

      it('should create multiple receivables discounting data with valid data', async () => {
        const rdData0 = buildFakeReceivablesDiscountingBase(true)
        const rdId0 = await trader.createNewRD(rdData0)

        const rdData1 = buildFakeReceivablesDiscountingBase(true)
        const rdId1 = await trader.createNewRD(rdData1)

        const rdData2 = buildFakeReceivablesDiscountingBase(true)
        const rdId2 = await trader.createNewRD(rdData2)

        await assertRDMatches(rdData0, await getRDFromApi(trader, rdId0))
        await assertRDMatches(rdData1, await getRDFromApi(trader, rdId1))
        await assertRDMatches(rdData2, await getRDFromApi(trader, rdId2))
      })

      it('should create receivables discounting data with optional fields not populated', async () => {
        const rdData = buildFakeReceivablesDiscountingBase()
        delete rdData.advancedRate

        const rdId = await trader.createNewRD(rdData)
        await assertRDMatches(rdData, await getRDFromApi(trader, rdId))
      })
    })

    describe('Risk cover only', () => {
      let rdData: IReceivablesDiscountingBase
      beforeEach(() => {
        rdData = enrichWithOtherFinancialInstrument(buildFakeReceivablesDiscountingBase(true))
        delete rdData.dateOfPerformance
        delete rdData.discountingDate
        delete rdData.advancedRate
        delete rdData.numberOfDaysDiscounting

        rdData.requestType = RequestType.RiskCover
        delete rdData.discountingType
        rdData.riskCoverDate = '2019-01-31'
        rdData.numberOfDaysRiskCover = 50
      })

      describe('success', () => {
        it('Risk cover - should create receivables discounting data for risk cover', async () => {
          const rdId = await trader.createNewRD(rdData)
          await assertRDMatches(rdData, await getRDFromApi(trader, rdId))
        })
      })

      describe('validation', () => {
        it('Risk cover - should fail validation if risk cover mandatory fields are not provided', async () => {
          delete rdData.riskCoverDate
          delete rdData.numberOfDaysRiskCover

          try {
            await trader.createNewRD(rdData)
            fail('Expected failure')
          } catch (e) {
            expect(e.response.data.fields).toEqual({
              riskCoverDate: [`should have required property 'riskCoverDate'`],
              numberOfDaysRiskCover: [`should have required property 'numberOfDaysRiskCover'`]
            })
          }
        })

        it('Risk cover - should fail if minimum number validation fails', async () => {
          rdData.numberOfDaysRiskCover = 0

          try {
            await trader.createNewRD(rdData)
            fail('Expected failure')
          } catch (e) {
            expect(e.response.status).toBe(422)
            expect(e.response.data.fields).toMatchObject({
              numberOfDaysRiskCover: [`'numberOfDaysRiskCover' should be higher than or equal to 1`]
            })
          }
        })
      })
    })

    describe('Discount with discounting type blended', () => {
      let rdData: IReceivablesDiscountingBase
      beforeEach(() => {
        rdData = buildFakeReceivablesDiscountingBase(true)
        rdData.requestType = RequestType.Discount
        rdData.discountingType = DiscountingType.Blended
        rdData.riskCoverDate = '2019-01-31'
        rdData.numberOfDaysRiskCover = 50
      })

      describe('success', () => {
        it('Discount/Blended - should create receivables discounting data', async () => {
          const rdId = await trader.createNewRD(rdData)
          await assertRDMatches(rdData, await getRDFromApi(trader, rdId))
        })
      })

      describe('validation', () => {
        it('Discount/Blended - should fail if mandatory fields not provided', async () => {
          delete rdData.riskCoverDate
          delete rdData.numberOfDaysRiskCover
          delete rdData.numberOfDaysDiscounting
          delete rdData.advancedRate
          delete rdData.discountingDate
          delete rdData.riskCoverDate
          delete rdData.numberOfDaysDiscounting

          try {
            await trader.createNewRD(rdData)
            fail('Expected failure')
          } catch (e) {
            expect(e.response.status).toBe(422)
            expect(e.response.data.fields).toMatchObject({
              riskCoverDate: [`should have required property 'riskCoverDate'`],
              numberOfDaysRiskCover: [`should have required property 'numberOfDaysRiskCover'`],
              discountingDate: [`should have required property 'discountingDate'`],
              numberOfDaysDiscounting: [`should have required property 'numberOfDaysDiscounting'`]
            })
          }
        })
      })
    })

    describe('Risk cover with discounting', () => {
      let rdData: IReceivablesDiscountingBase
      beforeEach(() => {
        rdData = enrichWithOtherFinancialInstrument(buildFakeReceivablesDiscountingBase(true))
        delete rdData.dateOfPerformance
        rdData.requestType = RequestType.RiskCoverDiscounting
        rdData.riskCoverDate = '2019-01-31'
        rdData.numberOfDaysRiskCover = 50
      })

      describe('success', () => {
        it('Risk cover with discounting - should create receivables discounting data', async () => {
          const rdId = await trader.createNewRD(rdData)
          await assertRDMatches(rdData, await getRDFromApi(trader, rdId))
        })
      })

      describe('validation', () => {
        it('Risk cover with discounting - should fail if minimum number validation fails', async () => {
          rdData.numberOfDaysRiskCover = 0
          rdData.numberOfDaysDiscounting = 0
          rdData.advancedRate = 0

          try {
            await trader.createNewRD(rdData)
            fail('Expected failure')
          } catch (e) {
            expect(e.response.status).toBe(422)
            expect(e.response.data.fields).toMatchObject({
              numberOfDaysRiskCover: [`'numberOfDaysRiskCover' should be higher than or equal to 1`],
              numberOfDaysDiscounting: [`'numberOfDaysDiscounting' should be higher than or equal to 1`],
              advancedRate: [`'advancedRate' should be higher than or equal to 1`]
            })
          }
        })

        it('Risk cover with discounting - should fail if maximum number validation fails', async () => {
          rdData.advancedRate = 101

          try {
            await trader.createNewRD(rdData)
            fail('Expected failure')
          } catch (e) {
            expect(e.response.status).toBe(422)
            expect(e.response.data.fields).toMatchObject({
              advancedRate: [`'advancedRate' should be less than or equal to 100`]
            })
          }
        })
      })
    })
  })

  function enrichWithOtherFinancialInstrument(rd: IReceivablesDiscountingBase) {
    rd.supportingInstruments = [SupportingInstrument.FinancialInstrument, SupportingInstrument.CreditInsurance]
    rd.financialInstrumentInfo = {
      financialInstrument: FinancialInstrument.Other,
      financialInstrumentIfOther: 'Hughgo',
      financialInstrumentIssuerName: 'Komgo'
    }
    return rd
  }
})
