import { ErrorCode } from '@komgo/error-utilities'
import {
  buildFakeReceivablesDiscountingBase,
  IReceivablesDiscountingBase,
  SupportingInstrument,
  FinancialInstrument
} from '@komgo/types'
import Axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

import { Corporate } from './utils/Corporate'
import { FinancialInstitution } from './utils/FinancialInstitution'
import IntegrationEnvironment from './utils/IntegrationEnvironment'
import MessagingTestUtility from './utils/MessagingTestUtility'
import RFPMockUtils from './utils/RFP.mockutils'
import { createAcceptedRD, assertEntriesOrdered } from './utils/test-utils'

describe('RD.GetRDHistory integration test', () => {
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
      rdBase.supportingInstruments = [SupportingInstrument.FinancialInstrument, SupportingInstrument.CreditInsurance]
      rdBase.financialInstrumentInfo = {
        financialInstrument: FinancialInstrument.Other,
        financialInstrumentIssuerName: 'Komgo',
        financialInstrumentIfOther: 'otherInstrument'
      }
      const res = await createAcceptedRD(trader, bank, rdBase, mockUtils)
      rdId = res.rdId
    })

    it('should get RD history when calling GET on the /rd/{id}/history endpoint', async () => {
      const initialRD = (await trader.getRDInfo(rdId)).rd
      const rdUpdate: IReceivablesDiscountingBase = {
        ...rdBase,
        invoiceAmount: 123,
        supportingInstruments: [SupportingInstrument.FinancialInstrument, SupportingInstrument.BillOfExchange]
      }
      rdUpdate.financialInstrumentInfo.financialInstrumentIfOther = 'anotherInstrument'

      const response = await trader.updateRD(rdId, rdUpdate)
      expect(response.status).toBe(200)

      const rdAfterUpdate = (await trader.getRDInfo(rdId)).rd
      const historyResp = await trader.getRDHistory(rdId)

      expect(historyResp).toEqual({
        id: initialRD.staticId,
        historyEntry: {
          financialInstrumentInfo: {
            historyEntry: {
              financialInstrumentIfOther: [
                {
                  updatedAt: rdAfterUpdate.updatedAt,
                  value: 'anotherInstrument'
                },
                {
                  updatedAt: initialRD.updatedAt,
                  value: 'otherInstrument'
                }
              ]
            }
          },
          invoiceAmount: [
            { updatedAt: rdAfterUpdate.updatedAt, value: 123 },
            { updatedAt: initialRD.updatedAt, value: 1000 }
          ],
          supportingInstruments: [
            {
              updatedAt: rdAfterUpdate.updatedAt,
              value: [SupportingInstrument.FinancialInstrument, SupportingInstrument.BillOfExchange]
            },
            {
              updatedAt: initialRD.updatedAt,
              value: [SupportingInstrument.FinancialInstrument, SupportingInstrument.CreditInsurance]
            }
          ]
        }
      })
    })

    it('should get an empty history object if the RD has not been updated', async () => {
      const historyResp = await trader.getRDHistory(rdId)
      expect(historyResp).toEqual({})
    })

    it('should get RD history when different fields have been updated each update', async () => {
      const initialRD = (await trader.getRDInfo(rdId)).rd

      const rdUpdate1 = createUpdatedRD(rdBase, '2020-10-10', 1001, '2020-11-10')
      await trader.updateRD(rdId, rdUpdate1)
      const rdAfterUpdate1 = (await trader.getRDInfo(rdId)).rd

      const rdUpdate2 = { ...rdUpdate1, invoiceAmount: 1002 }
      await trader.updateRD(rdId, rdUpdate2)
      const rdAfterUpdate2 = (await trader.getRDInfo(rdId)).rd

      const rdHistory = await trader.getRDHistory(rdId)

      // check rdHistory only contains 4 fields which are invoiceAmount, discountingDate, dateOfPerformance
      expect(Object.keys(rdHistory.historyEntry).length).toBe(3)
      assertEntriesOrdered(rdHistory.historyEntry, 'invoiceAmount', [rdAfterUpdate2, rdAfterUpdate1, initialRD])
      assertEntriesOrdered(rdHistory.historyEntry, 'discountingDate', [rdAfterUpdate1, initialRD])
      assertEntriesOrdered(rdHistory.historyEntry, 'dateOfPerformance', [rdAfterUpdate1, initialRD])
    })

    it('should get RD history for an RD that has been updated multiple times', async () => {
      const initialRD = (await trader.getRDInfo(rdId)).rd
      const rdUpdate1 = createUpdatedRD(rdBase, '2020-10-10', 10001, '2020-11-10')
      const rdUpdate2 = createUpdatedRD(rdUpdate1, '2020-10-11', 10010, '2020-11-11')
      const rdUpdate3 = createUpdatedRD(rdUpdate2, '2020-10-12', 10020, '2020-11-12')

      await trader.updateRD(rdId, rdUpdate1)
      const rdAfterUpdate1 = (await trader.getRDInfo(rdId)).rd
      await trader.updateRD(rdId, rdUpdate2)
      const rdAfterUpdate2 = (await trader.getRDInfo(rdId)).rd
      await trader.updateRD(rdId, rdUpdate3)
      const rdAfterUpdate3 = (await trader.getRDInfo(rdId)).rd

      const rdHistory = await trader.getRDHistory(rdId)

      expect(Object.keys(rdHistory.historyEntry).length).toBe(3)
      const expectedEntryOrder = [rdAfterUpdate3, rdAfterUpdate2, rdAfterUpdate1, initialRD]
      assertEntriesOrdered(rdHistory.historyEntry, 'invoiceAmount', expectedEntryOrder)
      assertEntriesOrdered(rdHistory.historyEntry, 'discountingDate', expectedEntryOrder)
      assertEntriesOrdered(rdHistory.historyEntry, 'dateOfPerformance', expectedEntryOrder)
    })
  })

  describe('failures', () => {
    it('fails if RD does not exist', async () => {
      try {
        await trader.getRDHistory('invalidRdId')
        fail('Expected failure')
      } catch (error) {
        expect(error.response.status).toBe(404)
        expect(error.response.data.errorCode).toBe(ErrorCode.DatabaseMissingData)
      }
    })
  })

  function createUpdatedRD(
    rd: IReceivablesDiscountingBase,
    discountingDate: string,
    invoiceAmount: number,
    dateOfPerformance: string
  ) {
    return {
      ...rd,
      invoiceAmount,
      discountingDate,
      dateOfPerformance
    }
  }
})
