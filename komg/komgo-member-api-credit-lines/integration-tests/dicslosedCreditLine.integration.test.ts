import { Currency } from '@komgo/types'
import 'reflect-metadata'
import { v4 as uuid4 } from 'uuid'

import { FeatureType } from '../src/business-layer/enums/feature'
import { ISharedCreditLineMessage } from '../src/business-layer/messaging/messages/IShareCreditLineMessage'
import { MessageType } from '../src/business-layer/messaging/MessageTypes'
import { PRODUCT_ID, SUB_PRODUCT_ID } from '../src/business-layer/notifications'
import { IDisclosedCreditLine } from '../src/data-layer/models/IDisclosedCreditLine'

import { members } from './sampledata/members'
import { axiosMock, postAPI, getAPI, putAPI, deleteAPI } from './utils/axios-utils'
import { IntegrationEnvironment, sleep } from './utils/environment'

const waitForExpect = require('wait-for-expect')

let counterpartyStaticId
const companyStaticId = uuid4()
const ownerStaticId = members[0].staticId

const integrationEnvironment: IntegrationEnvironment = new IntegrationEnvironment()
jest.setTimeout(90000)

const buildMessage = (): ISharedCreditLineMessage => ({
  version: 1,
  featureType: FeatureType.RiskCover,
  messageType: MessageType.ShareCreditLine,
  ownerStaticId,
  staticId: uuid4,
  recepientStaticId: companyStaticId,
  payload: {
    context: {
      productId: PRODUCT_ID.TradeFinance,
      subProductId: SUB_PRODUCT_ID.RiskCover
    },
    counterpartyStaticId,
    data: {
      appetite: true,
      availability: true,
      creditLimit: 1000,
      currency: Currency.USD
    }
  }
})

describe('Share Credit Line', () => {
  beforeAll(async () => {
    await integrationEnvironment.start(companyStaticId)
  })
  afterAll(async () => {
    await integrationEnvironment.stop(axiosMock)
  })
  beforeEach(async () => {
    counterpartyStaticId = uuid4()
    const companies = members.concat([
      {
        ...members[1],
        staticId: counterpartyStaticId,
        isFinancialInstitution: false,
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

  it('disclose credit line', async () => {
    const message = buildMessage()
    await integrationEnvironment.publisher.publishCritical(MessageType.ShareCreditLine, message)

    await sleep(1000)

    const context = message.payload.context
    await waitForExpect(async () => {
      const disclosedCreditLine = await getAPI<any>(
        `disclosed-credit-lines/product/${context.productId}/sub-product/${context.subProductId}/${counterpartyStaticId}`
      )
      const data = message.payload.data

      expect(disclosedCreditLine.data).toBeDefined()
      expect(disclosedCreditLine.data[0]).toMatchObject({
        creditLimit: data.creditLimit,
        availability: data.availability,
        appetite: data.appetite
      })
    })
  })

  it('update disclosed credit line', async () => {
    const message = buildMessage()

    await integrationEnvironment.publisher.publishCritical(MessageType.ShareCreditLine, message)

    await sleep(1000)

    let context = message.payload.context
    await waitForExpect(async () => {
      const disclosedCreditLine = await getAPI<any>(
        `disclosed-credit-lines/product/${context.productId}/sub-product/${context.subProductId}/${counterpartyStaticId}`
      )
      const data = message.payload.data

      expect(disclosedCreditLine.data).toBeDefined()
      expect(disclosedCreditLine.data[0]).toMatchObject({
        creditLimit: data.creditLimit,
        availability: data.availability,
        appetite: data.appetite
      })
    })

    message.payload.data.creditLimit = 9999
    await integrationEnvironment.publisher.publishCritical(MessageType.ShareCreditLine, message)

    context = message.payload.context
    await waitForExpect(async () => {
      const disclosedCreditLine = await getAPI<any>(
        `disclosed-credit-lines/product/${context.productId}/sub-product/${context.subProductId}/${counterpartyStaticId}`
      )
      const data = message.payload.data

      expect(disclosedCreditLine.data).toBeDefined()
      expect(disclosedCreditLine.data[0]).toMatchObject({
        creditLimit: data.creditLimit,
        availability: data.availability,
        appetite: data.appetite
      })
    })
  })

  it('revoke credit line', async () => {
    const message = buildMessage()

    await integrationEnvironment.publisher.publishCritical(MessageType.ShareCreditLine, message)

    await sleep(1000)
    let context = message.payload.context

    await waitForExpect(async () => {
      const disclosedCreditLine = await getAPI<any>(
        `disclosed-credit-lines/product/${context.productId}/sub-product/${context.subProductId}/${counterpartyStaticId}`
      )
      const data = message.payload.data

      expect(disclosedCreditLine.data).toBeDefined()
      expect(disclosedCreditLine.data[0]).toMatchObject({
        creditLimit: data.creditLimit,
        availability: data.availability,
        appetite: data.appetite
      })
    })

    message.messageType = MessageType.RevokeCreditLine
    await integrationEnvironment.publisher.publishCritical(MessageType.RevokeCreditLine, message)
    await sleep(1000)
    context = message.payload.context
    await waitForExpect(async () => {
      const disclosedCreditLine = await getAPI<IDisclosedCreditLine[]>(
        `disclosed-credit-lines/product/${context.productId}/sub-product/${context.subProductId}/${counterpartyStaticId}`
      )
      expect(disclosedCreditLine.data).toBeDefined()
      expect(disclosedCreditLine.data[0]).not.toHaveProperty('appetite')
    })
  })
})
