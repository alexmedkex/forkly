import { Currency, DepositLoanPeriod, DepositLoanType, IDisclosedDepositLoan } from '@komgo/types'
import 'reflect-metadata'
import { v4 as uuid4 } from 'uuid'

import { FeatureType } from '../src/business-layer/enums/feature'
import { ISharedDepositLoanMessage } from '../src/business-layer/messaging/messages/IShareDepositLoanMessage'
import { MessageType } from '../src/business-layer/messaging/MessageTypes'

import { members } from './sampledata/members'
import { axiosMock, postAPI, getAPI, putAPI, deleteAPI } from './utils/axios-utils'
import { IntegrationEnvironment, sleep } from './utils/environment'

const waitForExpect = require('wait-for-expect')

const companyStaticId = uuid4()
let ownerStaticId = uuid4()
let periodDuration = 0

const integrationEnvironment: IntegrationEnvironment = new IntegrationEnvironment()
jest.setTimeout(90000)

const buildMessage = (): ISharedDepositLoanMessage => {
  periodDuration++
  return {
    version: 1,
    messageType: MessageType.ShareCreditLine,
    recepientStaticId: companyStaticId,
    ownerStaticId,
    featureType: FeatureType.Deposit,
    staticId: uuid4,
    payload: {
      currency: Currency.USD,
      period: DepositLoanPeriod.Months,
      periodDuration,
      type: DepositLoanType.Deposit,
      data: {
        appetite: true,
        pricing: 1.0
      }
    }
  }
}

describe('Disclose deposit loan', () => {
  beforeAll(async () => {
    await integrationEnvironment.start(companyStaticId)
  })
  afterAll(async () => {
    await integrationEnvironment.stop(axiosMock)
  })
  beforeEach(async () => {
    ownerStaticId = uuid4()
    const companies = members.concat([
      {
        ...members[0],
        staticId: ownerStaticId,
        isFinancialInstitution: true,
        vaktStaticId: uuid4(),
        komgoMnid: uuid4()
      },
      {
        ...members[1],
        staticId: companyStaticId,
        isFinancialInstitution: false,
        vaktStaticId: uuid4(),
        komgoMnid: uuid4()
      }
    ])

    await integrationEnvironment.beforeEach(axiosMock, companies)
  })
  afterEach(async () => {
    await integrationEnvironment.afterEach()
  })

  it('disclose deposit loan', async () => {
    const message = buildMessage()
    await integrationEnvironment.publisher.publishCritical(MessageType.ShareCreditLine, message)

    await sleep(1000)

    await waitForExpect(async () => {
      const filter = {
        currency: Currency.USD,
        period: DepositLoanPeriod.Months,
        periodDuration
      }
      const query = JSON.stringify(filter)
      const disclosedDepositLoan = await getAPI<any>(`disclosed-deposit-loans/deposit?query=${query}`)

      expect(disclosedDepositLoan.data).toBeDefined()
      expect(disclosedDepositLoan.data[0]).toMatchObject({
        currency: Currency.USD,
        period: DepositLoanPeriod.Months,
        periodDuration
      })
    })
  })

  it('update disclosed deposit loan', async () => {
    const message = buildMessage()
    await integrationEnvironment.publisher.publishCritical(MessageType.ShareCreditLine, message)

    await sleep(1000)

    await waitForExpect(async () => {
      const filter = {
        currency: Currency.USD,
        period: DepositLoanPeriod.Months,
        periodDuration
      }
      const query = JSON.stringify(filter)
      const disclosedDepositLoan = await getAPI<IDisclosedDepositLoan[]>(
        `disclosed-deposit-loans/deposit?query=${query}`
      )

      expect(disclosedDepositLoan.data).toBeDefined()
      expect(disclosedDepositLoan.data[0]).toMatchObject({
        currency: Currency.USD,
        period: DepositLoanPeriod.Months,
        periodDuration
      })
    })

    message.payload.data.pricing = 20
    await integrationEnvironment.publisher.publishCritical(MessageType.ShareCreditLine, message)

    await waitForExpect(async () => {
      const filter = {
        currency: Currency.USD,
        period: DepositLoanPeriod.Months,
        periodDuration
      }
      const query = JSON.stringify(filter)
      const disclosedDepositLoan = await getAPI<IDisclosedDepositLoan[]>(
        `disclosed-deposit-loans/deposit?query=${query}`
      )

      expect(disclosedDepositLoan.data).toBeDefined()
      expect(disclosedDepositLoan.data[0]).toMatchObject({
        currency: Currency.USD,
        period: DepositLoanPeriod.Months,
        periodDuration,
        pricing: 20
      })
    })
  })

  it('revoke deposit loan', async () => {
    const message = buildMessage()
    await integrationEnvironment.publisher.publishCritical(MessageType.ShareCreditLine, message)

    await sleep(1000)

    await waitForExpect(async () => {
      const filter = {
        currency: Currency.USD,
        period: DepositLoanPeriod.Months,
        periodDuration
      }
      const query = JSON.stringify(filter)
      const disclosedDepositLoan = await getAPI<IDisclosedDepositLoan[]>(
        `disclosed-deposit-loans/deposit?query=${query}`
      )

      expect(disclosedDepositLoan.data).toBeDefined()
      expect(disclosedDepositLoan.data[0]).toMatchObject({
        currency: Currency.USD,
        period: DepositLoanPeriod.Months,
        periodDuration,
        appetite: true
      })
    })

    message.messageType = MessageType.RevokeCreditLine
    await integrationEnvironment.publisher.publishCritical(MessageType.RevokeCreditLine, message)

    await waitForExpect(async () => {
      const filter = {
        currency: Currency.USD,
        period: DepositLoanPeriod.Months,
        periodDuration
      }
      const query = JSON.stringify(filter)
      const disclosedDepositLoan = await getAPI<IDisclosedDepositLoan[]>(
        `disclosed-deposit-loans/deposit?query=${query}`
      )

      expect(disclosedDepositLoan.data).toBeDefined()
      expect(disclosedDepositLoan.data[0]).not.toHaveProperty('appetite')
    })
  })
})
