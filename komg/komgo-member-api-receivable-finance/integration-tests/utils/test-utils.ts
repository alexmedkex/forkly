import { IRFPMessage, IRFPResponsePayload, IRFPRequestPayload, RFPMessageType } from '@komgo/messaging-types'
import {
  ReplyType,
  ITradeSnapshot,
  IReceivablesDiscounting,
  buildFakeReceivablesDiscountingExtended,
  IQuote,
  buildFakeQuote,
  IReceivablesDiscountingBase,
  IReceivablesDiscountingInfo,
  RDStatus,
  TradeSource,
  buildFakeTradeSnapshot,
  IHistoryEntry,
  RequestType,
  DiscountingType,
  buildFakeQuoteBase,
  IQuoteBase
} from '@komgo/types'
import * as moment from 'moment'
import { v4 as uuid4 } from 'uuid'
import waitForExpect from 'wait-for-expect'

import {
  ADD_DISCOUNTING_TYPE_ROUTING_KEY_PREFIX,
  UPDATE_TYPE_ROUTING_KEY_PREFIX,
  RFP_ROUTING_KEY_PREFIX
} from '../../src/business-layer/messaging/constants'
import {
  buildFakeRequestPayload,
  buildFakeRFPMessage,
  buildFakeResponsePayload
} from '../../src/business-layer/messaging/faker'
import { AddDiscountingRequestType } from '../../src/business-layer/messaging/types/AddDiscountingRequestType'
import { IProductResponse, IProductRequest, UpdateType } from '../../src/business-layer/types'
import { buildFakeReply, mockTrade } from '../../src/data-layer/data-agents/utils/faker'
import { QuoteModel } from '../../src/data-layer/models/quote/QuoteModel'
import { ReceivablesDiscountingModel } from '../../src/data-layer/models/receivables-discounting/ReceivablesDiscountingModel'
import { IReply } from '../../src/data-layer/models/replies/IReply'
import { ReplyModel } from '../../src/data-layer/models/replies/ReplyModel'
import { RFPRequestModel } from '../../src/data-layer/models/rfp/RFPRequestModel'
import { TradeSnapshotModel } from '../../src/data-layer/models/trade-snapshot/TradeSnapshotModel'

import { Corporate } from './Corporate'
import { FinancialInstitution } from './FinancialInstitution'
import { Member } from './Member'
import RFPMockUtils from './RFP.mockutils'

export const DEFAULT_COMMENT = 'myComment'
export const MOCK_DATE = '2019-01-31'

export const buildRFPRoutingKey = (rfpType: RFPMessageType): string => {
  return RFP_ROUTING_KEY_PREFIX + rfpType.toString()
}

export const buildUpdateRoutingKey = (updateType: UpdateType): string => {
  return UPDATE_TYPE_ROUTING_KEY_PREFIX + updateType.toString()
}

export const buildAddDiscountingRoutingKey = (addDiscountingType: AddDiscountingRequestType): string => {
  return ADD_DISCOUNTING_TYPE_ROUTING_KEY_PREFIX + addDiscountingType.toString()
}

export function createRequestMessage(
  deleteCreatedAt = true,
  rd: IReceivablesDiscounting = buildFakeReceivablesDiscountingExtended(true)
): IRFPMessage<IRFPRequestPayload<IProductRequest>> {
  if (deleteCreatedAt) {
    delete rd.createdAt
  }

  const tradeSnapshot: ITradeSnapshot = buildFakeTradeSnapshot()
  tradeSnapshot.source = rd.tradeReference.source
  tradeSnapshot.sourceId = rd.tradeReference.sourceId
  tradeSnapshot.trade = {
    ...mockTrade,
    source: rd.tradeReference.source,
    sourceId: rd.tradeReference.sourceId,
    createdAt: new Date().toISOString()
  }

  return buildFakeRFPMessage(buildFakeRequestPayload(rd, tradeSnapshot, true))
}

export function createResponseMessage(
  rdId: string,
  participantStaticId: string,
  senderStaticId: string,
  type: ReplyType,
  quote: IQuote = buildFakeQuote({}, true, RequestType.Discount, DiscountingType.WithoutRecourse)
): IRFPMessage<IRFPResponsePayload<IProductResponse>> {
  const date: any = new Date()
  const reply: IReply = buildFakeReply(
    {
      rdId,
      participantId: participantStaticId,
      senderStaticId,
      type,
      comment: DEFAULT_COMMENT,
      createdAt: date,
      updatedAt: date
    },
    true
  )

  if (quote) {
    reply.quoteId = quote.staticId
    return buildFakeRFPMessage(buildFakeResponsePayload(reply, quote))
  }

  return buildFakeRFPMessage(buildFakeResponsePayload(reply))
}

export function createParticipantList(numberOfParticipants: number): string[] {
  const participants = []
  for (let i = 0; i < numberOfParticipants; i++) {
    participants.push(uuid4())
  }

  return participants
}

export async function assertRDMatches(
  expectedRD: IReceivablesDiscountingBase,
  rd: IReceivablesDiscounting
): Promise<void> {
  // We don't save the version yet
  delete expectedRD.version

  const expectedRDWithDatesFixed = convertAllDatesToIsoString({ ...expectedRD, createdAt: expect.any(String) })
  expect(rd).toMatchObject(expectedRDWithDatesFixed)
}

function convertAllDatesToIsoString(rd: IReceivablesDiscountingBase | IReceivablesDiscounting) {
  return Object.keys(rd).reduce((memo: any, key: any) => {
    if (moment(rd[key], 'YYYY-MM-DD', true).isValid()) {
      return {
        [key]: new Date(rd[key]).toISOString(),
        ...memo
      }
    } else {
      return {
        [key]: rd[key],
        ...memo
      }
    }
  }, {})
}

export async function assertRFPCreatedInDB(rdId: string): Promise<void> {
  // @ts-ignore
  await waitForExpect(async () => {
    const rd = await ReceivablesDiscountingModel.findOne({ staticId: rdId })

    expect(rd).not.toBeNull()

    const tradeSnapshot = await TradeSnapshotModel.findOne({
      source: rd.tradeReference.source,
      sourceId: rd.tradeReference.sourceId
    })
    expect(tradeSnapshot).not.toBeNull()

    const rfpRequest = await RFPRequestModel.findOne({ rdId })
    expect(rfpRequest.rfpId).not.toBeNull()
  })
}

export async function assertRFPCreatedInDBFromMessage(
  message: IRFPMessage<IRFPRequestPayload<IProductRequest>>,
  member: Member
): Promise<void> {
  const rd: IReceivablesDiscounting = message.data.productRequest.rd
  const tradeSnapshot: ITradeSnapshot = message.data.productRequest.trade
  const rfpId = message.data.rfpId

  // @ts-ignore
  await waitForExpect(async () => {
    await assertRDMatches(rd, await getRDFromApi(member, rd.staticId))

    const savedTradeSnapshot = await TradeSnapshotModel.findOne({
      source: rd.tradeReference.source,
      sourceId: rd.tradeReference.sourceId
    })
    expect(savedTradeSnapshot.source).toEqual(tradeSnapshot.source)
    expect(savedTradeSnapshot.sourceId).toEqual(tradeSnapshot.sourceId)
    expect(savedTradeSnapshot.movements.length).toEqual(tradeSnapshot.movements.length)

    const savedRFPRequest = await RFPRequestModel.findOne({ rdId: rd.staticId })
    expect(savedRFPRequest.rfpId).toEqual(rfpId)

    // should use the createdAt and updatedAt from the message
    expect(savedRFPRequest.createdAt).toEqual(message.data.productRequest.createdAt)
    expect(savedRFPRequest.updatedAt).toEqual(message.data.productRequest.updatedAt)
  })
}

export async function assertReplyCreatedInDB(rdId: string, type: ReplyType, quoteId?: string, comment?: string) {
  // @ts-ignore
  await waitForExpect(async () => {
    await assertRFPCreatedInDB(rdId)

    if (quoteId) {
      await assertQuoteCreatedInDB(quoteId)
    }

    const reply = await ReplyModel.findOne({ rdId, type })
    expect(reply).toMatchObject({ rdId, type, comment })
  })
}

export async function assertRFPReplyCreatedInDB(
  rdId: string,
  type: ReplyType,
  quoteId?: string,
  comment = DEFAULT_COMMENT
) {
  await assertReplyCreatedInDB(rdId, type, quoteId, comment)
}

export async function assertRFPReplyCreatedInDBFromMessage(
  message: IRFPMessage<IRFPResponsePayload<IProductResponse>>
) {
  const rfpReply = message.data.response.rfpReply

  // @ts-ignore
  await waitForExpect(async () => {
    const savedReply: IReply = await ReplyModel.findOne({
      staticId: rfpReply.staticId
    })

    expect(savedReply).toMatchObject({ ...rfpReply })

    if (rfpReply.quoteId) {
      await assertQuoteCreatedInDB(rfpReply.quoteId)
    }
  })
}

export async function assertAutoRFPDeclineCreatedInDBFromMessage() {
  // @ts-ignore
  await waitForExpect(async () => {
    const savedReply: IReply = await ReplyModel.findOne({
      type: ReplyType.Declined,
      autoGenerated: true
    })

    expect(savedReply).not.toBeNull()
  })
}

export async function assertQuoteCreatedInDB(quoteId: string) {
  const quote = await QuoteModel.findOne({ staticId: quoteId })
  expect(quote).not.toBeNull()
}

export async function assertReceivedQuoteCreatedInDB(quote: Partial<IQuote>) {
  // @ts-ignore
  await waitForExpect(async () => {
    const saved = await QuoteModel.findOne({ staticId: quote.staticId, createdAt: quote.createdAt })

    expect(saved).not.toBeNull()
  })
}

export async function assertReceivedTradeSnapshotCreatedInDB(tradeSnapShot: Partial<ITradeSnapshot>) {
  // @ts-ignore
  await waitForExpect(async () => {
    const saved = await TradeSnapshotModel.findOne({
      sourceId: tradeSnapShot.sourceId,
      createdAt: tradeSnapShot.createdAt
    })
    expect(saved).not.toBeNull()
  })
}

export function assertRDInfo(
  rdInfo: IReceivablesDiscountingInfo,
  expectedRD: IReceivablesDiscountingBase,
  expectedStatus: RDStatus,
  participantStaticIds?: string[]
) {
  // We don't save the version yet
  delete expectedRD.version

  expect(rdInfo.rd).toMatchObject({
    ...expectedRD,
    dateOfPerformance: expect.any(String),
    discountingDate: expect.any(String)
  })
  // ensure the BE is not returning the internal mongo Object _id
  expect(rdInfo.rd._id).toBe(undefined)

  expect(rdInfo.status).toBe(expectedStatus)

  if (rdInfo.rfp) {
    expect(rdInfo.rfp.participantStaticIds).toEqual(participantStaticIds)
    expect(rdInfo.tradeSnapshot).toBeDefined()
  }
}

export function assertRDsMatchIgnoringCreatedAt(rd1: IReceivablesDiscounting, rd2: IReceivablesDiscounting) {
  const bareRD1: any = stripDbFieldsFromRD(rd1, true)
  const bareRD2: any = stripDbFieldsFromRD(rd2, true)
  expect(convertAllDatesToIsoString(bareRD1)).toEqual(convertAllDatesToIsoString(bareRD2))
}

export function assertRDsMatch(rd1: IReceivablesDiscounting, rd2: IReceivablesDiscounting) {
  const bareRD1: any = stripDbFieldsFromRD(rd1, false)
  const bareRD2: any = stripDbFieldsFromRD(rd2, false)
  expect(convertAllDatesToIsoString(bareRD1)).toEqual(convertAllDatesToIsoString(bareRD2))
}

function stripDbFieldsFromRD(rd: IReceivablesDiscounting, stripCreatedAt: boolean = false) {
  const bareRD: any = { ...rd }
  if (stripCreatedAt) {
    delete bareRD.createdAt
    delete bareRD.tradeReference.createdAt
  }
  delete bareRD.tradeReference.updatedAt
  delete bareRD.updatedAt
  delete bareRD.version

  return bareRD
}

export async function createSubmittedQuote(
  rdId: string,
  bank: FinancialInstitution,
  mockUtils: RFPMockUtils
): Promise<{ quoteId: string }> {
  mockUtils.mockSuccessfulRFPReply()
  mockUtils.mockSuccessfulTaskOrNotification()

  const quoteId = await bank.createNewQuote()
  await bank.createNewQuoteSubmission(rdId, quoteId)
  await assertRFPReplyCreatedInDB(rdId, ReplyType.Submitted)

  return { quoteId }
}

export async function receiveSubmittedQuote(
  rdId: string,
  bank: FinancialInstitution,
  mockUtils: RFPMockUtils,
  quote?: IQuote
): Promise<void> {
  mockUtils.mockSuccessfulGetCompanyEntry()
  mockUtils.mockSuccessfulTaskOrNotification()
  const quoteSubmissionMessage = createResponseMessage(
    rdId,
    bank.companyStaticId,
    bank.companyStaticId,
    ReplyType.Submitted,
    quote
  )
  await bank.publishRFPResponse(quoteSubmissionMessage)
  await assertRFPReplyCreatedInDB(rdId, ReplyType.Submitted)

  const quoteSaved = await bank.getQuote(quote.staticId)
  expect(quote).toEqual(quoteSaved)
}

export async function createAcceptedRD(
  trader: Corporate,
  bank: FinancialInstitution,
  rdData: IReceivablesDiscountingBase,
  mockUtils: RFPMockUtils
): Promise<{ rdId: string; quote: IQuote }> {
  const rdId = await createRFP(trader, bank, rdData, mockUtils)
  await receiveSubmittedQuote(
    rdId,
    bank,
    mockUtils,
    buildFakeQuote({}, true, rdData.requestType, rdData.discountingType)
  )

  // Trader accepts quote
  const quoteId = await trader.createNewQuote(buildFakeQuoteBase({}, rdData.requestType, rdData.discountingType))
  const quote = await trader.getQuote(quoteId)
  await mockUtils.mockSuccessfulRFPReplyAccept()
  await trader.createNewQuoteAccept(rdId, quoteId, bank.companyStaticId)
  await assertRFPReplyCreatedInDB(rdId, ReplyType.Accepted, quoteId)
  return { rdId, quote }
}

export const createRFP = async (
  trader: Corporate,
  bank: FinancialInstitution,
  rdData: IReceivablesDiscountingBase,
  mockUtils: RFPMockUtils
) => {
  const participantStaticIds = [bank.companyStaticId]
  mockUtils.mockSuccessfullRFPRequest(
    participantStaticIds,
    false,
    rdData.tradeReference.sourceId,
    TradeSource[rdData.tradeReference.source]
  )

  const rdStaticId = await trader.createNewRD(rdData)
  await trader.createNewRFPRequest(rdStaticId, participantStaticIds)

  return rdStaticId
}

export async function receiveRFP(trader: Corporate, mockUtils: RFPMockUtils): Promise<string> {
  mockUtils.mockSuccessfulGetCompanyEntry()
  mockUtils.mockSuccessfulTaskOrNotification()

  const rdId = await trader.publishRFPRequest()
  await assertRFPCreatedInDB(rdId)
  return rdId
}

export async function receiveAcceptedRD(
  trader: Corporate,
  bank: FinancialInstitution,
  mockUtils: RFPMockUtils,
  messageOptions?: any,
  rd?: IReceivablesDiscounting,
  quoteBase?: IQuoteBase
) {
  // Bank receives a RFP Request from trader
  mockUtils.mockSuccessfulGetCompanyEntry()
  mockUtils.mockSuccessfulTaskOrNotification()
  const msg = createRequestMessage(undefined, rd)
  const rdId = await trader.publishRFPRequest(msg)
  await assertRFPCreatedInDB(rdId)

  // Banks submits  to trader
  mockUtils.mockSuccessfulRFPReply()
  mockUtils.mockSuccessfulTaskOrNotification()
  const quoteId = await bank.createNewQuote(quoteBase)
  await bank.createNewQuoteSubmission(rdId, quoteId)

  // Bank receives accept quote from trader
  const quote = await trader.getQuote(quoteId)
  const message = createResponseMessage(rdId, bank.companyStaticId, trader.companyStaticId, ReplyType.Accepted, quote)
  mockUtils.mockSuccessfulGetCompanyEntry()
  mockUtils.mockSuccessfulTaskOrNotification()

  await trader.publishRFPAccept(message, messageOptions)
  await assertRFPReplyCreatedInDBFromMessage(message)

  return rdId
}

export async function updateRDMultipleTimes(trader: Corporate, rd: IReceivablesDiscounting, count: number) {
  for (let i = 0; i < count; i++) {
    const response = await trader.updateRD(rd.staticId, { ...rd, invoiceAmount: i + 1000 })
    expect(response.status).toBe(200)
  }
}

export function assertEntriesOrdered(
  rdHistoryEntry: IHistoryEntry<any>,
  fieldName: string,
  orderedRDs: IReceivablesDiscounting[]
) {
  const orderedEntries = orderedRDs.map(rd => {
    return { updatedAt: rd.updatedAt, value: rd[fieldName] }
  })
  expect(rdHistoryEntry[fieldName]).toEqual(orderedEntries)
}

export async function getRDFromApi(member: Member, rdId: string) {
  return (await member.getRDInfo(rdId)).rd
}
