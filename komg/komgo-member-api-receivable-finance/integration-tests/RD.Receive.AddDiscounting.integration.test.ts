import {
  RequestType,
  IReceivablesDiscounting,
  IReceivablesDiscountingInfo,
  ReplyType,
  IParticipantRFPReply,
  buildFakeReceivablesDiscountingExtended,
  buildFakeQuoteBase,
  IQuoteBase
} from '@komgo/types'
import Axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { v4 as uuid4 } from 'uuid'
import waitForExpect from 'wait-for-expect'

import { buildFakeAddDiscountingMessage } from '../src/business-layer/messaging/faker'
import { AddDiscountingRequestType } from '../src/business-layer/messaging/types/AddDiscountingRequestType'
import { buildFakeReply } from '../src/data-layer/data-agents/utils/faker'
import { IReply } from '../src/data-layer/models/replies/IReply'

import { Corporate } from './utils/Corporate'
import { FinancialInstitution } from './utils/FinancialInstitution'
import IntegrationEnvironment from './utils/IntegrationEnvironment'
import MessagingTestUtility from './utils/MessagingTestUtility'
import RFPMockUtils from './utils/RFP.mockutils'
import { receiveAcceptedRD, createSubmittedQuote, receiveRFP } from './utils/test-utils'

const MOCK_DATE = '2020-03-23T00:00:00.000Z'
const mockNumberOfDaysDiscounting = 24

describe('RD.Receive.AddDiscounting.integration.test', () => {
  let iEnv: IntegrationEnvironment
  let mockUtils: RFPMockUtils
  let trader: Corporate
  let bank: FinancialInstitution
  let messagingTestUtility: MessagingTestUtility

  beforeAll(async () => {
    trader = new Corporate()
    bank = new FinancialInstitution()

    mockUtils = new RFPMockUtils(new MockAdapter(Axios))

    iEnv = new IntegrationEnvironment(bank.companyStaticId)
    await iEnv.setup()

    messagingTestUtility = new MessagingTestUtility(iEnv)

    await iEnv.start()
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

  describe('Success', () => {
    let originalRd: IReceivablesDiscounting
    let originalQuoteBase: IQuoteBase

    beforeEach(async () => {
      originalRd = buildFakeReceivablesDiscountingExtended(true, {
        riskCoverDate: MOCK_DATE,
        numberOfDaysRiskCover: 100,
        requestType: RequestType.RiskCoverDiscounting
      })
      originalQuoteBase = buildFakeQuoteBase(undefined, RequestType.RiskCoverDiscounting)
    })

    it('should receive the add discounting request and save the reply from the trader', async () => {
      const { rd } = await receiveAcceptedQuoteForRd(originalQuoteBase, originalRd)
      await publishAddDiscountingRequestMessage(rd)

      await waitForExpect(async () => {
        const { replies } = await bank.getParticipantRFPSummary(rd.staticId, bank.companyStaticId)
        expectContainsAddDiscountingReply(replies)
      })

      await waitForExpect(async () => {
        const { rd: saved } = await trader.getRDInfo(rd.staticId)
        expect(saved).toMatchObject(rd)
      })
    })
  })

  describe('Failures', () => {
    let originalRd: IReceivablesDiscounting
    let originalQuoteBase: IQuoteBase

    beforeEach(async () => {
      originalRd = buildFakeReceivablesDiscountingExtended(true, {
        riskCoverDate: MOCK_DATE,
        numberOfDaysRiskCover: 100,
        requestType: RequestType.RiskCoverDiscounting
      })
      originalQuoteBase = buildFakeQuoteBase(undefined, RequestType.RiskCoverDiscounting)
    })

    it('should reject the message if the RD requestType is not RiskCoverDiscounting', async () => {
      originalRd = buildFakeReceivablesDiscountingExtended(true, {
        requestType: RequestType.Discount
      })
      const { rd } = await receiveAcceptedQuoteForRd(originalQuoteBase, originalRd)

      const options = { messageId: uuid4() }
      await publishAddDiscountingRequestMessage(rd, options)

      await messagingTestUtility.assertRejectedMessageFromEventManagement(options.messageId)
    })

    it('should reject the message if the RD does not exist', async () => {
      const options = { messageId: uuid4() }
      await publishAddDiscountingRequestMessage(originalRd, options)

      await messagingTestUtility.assertRejectedMessageFromEventManagement(options.messageId)
    })

    it('should reject the message if the quote sent has not been accepted', async () => {
      const rdId = await receiveRFP(trader, mockUtils)
      const { rd } = await trader.getRDInfo(rdId)
      await createSubmittedQuote(rdId, bank, mockUtils)

      const options = { messageId: uuid4() }
      await publishAddDiscountingRequestMessage(rd, options)

      await messagingTestUtility.assertRejectedMessageFromEventManagement(options.messageId)
    })

    it('should reject the message if mandatory fields are missing from the RD', async () => {
      const { rd } = await receiveAcceptedQuoteForRd(originalQuoteBase, originalRd)
      delete rd.numberOfDaysDiscounting
      delete rd.discountingDate

      const options = { messageId: uuid4() }
      await publishAddDiscountingRequestMessage(rd, options)

      await messagingTestUtility.assertRejectedMessageFromEventManagement(options.messageId)
    })

    it('should reject the message if an add discounting request was already received for RD', async () => {
      const { rd } = await receiveAcceptedQuoteForRd(originalQuoteBase, originalRd)

      const options1 = { messageId: uuid4() }
      await publishAddDiscountingRequestMessage(rd, options1)

      await waitForExpect(async () => {
        const { replies } = await bank.getParticipantRFPSummary(rd.staticId, bank.companyStaticId)
        expectContainsAddDiscountingReply(replies)
      })

      await waitForExpect(async () => {
        const { rd: saved } = await trader.getRDInfo(rd.staticId)
        expect(saved).toMatchObject(rd)
      })

      const options2 = { messageId: uuid4() }
      await publishAddDiscountingRequestMessage(rd, options2)
      await messagingTestUtility.assertRejectedMessageFromEventManagement(options2.messageId)
    })
  })

  const receiveAcceptedQuoteForRd = async (originalQuoteBase: IQuoteBase, originalRd: IReceivablesDiscounting) => {
    const rdId = await receiveAcceptedRD(trader, bank, mockUtils, undefined, originalRd, originalQuoteBase)
    const { rd }: IReceivablesDiscountingInfo = await trader.getRDInfo(rdId)
    const updatedRd = {
      ...rd,
      discountingDate: MOCK_DATE,
      numberOfDaysDiscounting: mockNumberOfDaysDiscounting
    }
    return { rd: updatedRd }
  }

  const expectContainsAddDiscountingReply = (replies: IParticipantRFPReply[]) => {
    expect(replies.some(reply => reply.type === ReplyType.AddDiscountingRequest)).toBeTruthy()
  }

  const publishAddDiscountingRequestMessage = async (rd: IReceivablesDiscounting, options?: any) => {
    const msg = buildFakeAddDiscountingMessage(
      rd.staticId,
      rd,
      AddDiscountingRequestType.Add,
      createReply({ rdId: rd.staticId }),
      trader.companyStaticId
    )
    mockUtils.mockSuccessfulGetCompanyEntry()
    await trader.publishAddDiscountingRequest(msg, options)
  }

  const createReply = (overrides: Partial<IReply>) =>
    buildFakeReply(
      {
        senderStaticId: trader.companyStaticId,
        type: ReplyType.AddDiscountingRequest,
        participantId: bank.companyStaticId,
        ...overrides
      },
      true
    )
})
