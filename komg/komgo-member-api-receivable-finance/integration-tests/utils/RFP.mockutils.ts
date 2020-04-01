import { TradeSource, Grade } from '@komgo/types'
import { AxiosRequestConfig } from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { v4 as uuid4 } from 'uuid'

import { defaultAxiosRetries } from '../../src/utils/axiosRetryFactory'

export default class RFPMockUtils {
  constructor(protected readonly axiosMock: MockAdapter) {}

  public reset() {
    this.axiosMock.reset()
  }

  /**
   * Mocks a successful RFP creation flow
   */
  public mockSuccessfullRFPRequest(
    participantStaticIds: string[],
    passThrough = true,
    sourceId = uuid4(),
    source = TradeSource.Komgo
  ) {
    this.mockSuccessfullMembers(participantStaticIds)
    this.mockSuccessfulTradeAndCargo(sourceId, source)
    this.mockSuccessfulRFPCreation(participantStaticIds)

    if (passThrough) {
      this.passThroughRemaining()
    }
  }

  /**
   * Mocks a successful RFP creation flow, capturing the RFP request through a callback
   */
  public captureRFPRequest(
    participantStaticIds: string[],
    fn: (cfg: AxiosRequestConfig) => void,
    passThrough = true,
    sourceId = uuid4(),
    source = TradeSource.Komgo
  ) {
    this.mockSuccessfullMembers(participantStaticIds)
    this.mockSuccessfulTradeAndCargo(sourceId, source)
    this.captureRFPCreation(participantStaticIds, fn)

    if (passThrough) {
      this.passThroughRemaining()
    }
  }

  /**
   * Mocks a call flow returning a list of members that do not correspond to the participants list
   */
  public mockParticipantsNotMembers() {
    // API-Registry returns random members
    this.axiosMock.onGet(/api-registry.*/).replyOnce(200, [{ staticId: uuid4() }])

    this.passThroughRemaining()
  }

  /**
   * Mocks a call flow returning a network error from api-registry and a successfull flow on retry
   */
  public mockErrorApiRegistryAndRetry(participantStaticIds: string[]) {
    // API-Registry fails
    this.failCall(() => {
      this.axiosMock.onGet(/api-registry.*/).networkErrorOnce(500)
    })

    // Retry succeeds
    this.mockSuccessfullRFPRequest(participantStaticIds)
  }

  /**
   * Mocks a call flow returning a network error from api-trade-cargo and a successfull flow on retry
   */
  public mockErrorApiTradeCargoAndRetry(participantStaticIds: string[]) {
    this.mockSuccessfullMembers(participantStaticIds)

    // API-Trade-Cargo fails
    this.failCall(() => {
      this.axiosMock.onGet(/api-trade-cargo.*/).networkErrorOnce(500)
    })

    // Retry succeeds
    this.mockSuccessfullRFPRequest(participantStaticIds)
  }

  /**
   * Mocks a call flow returning a network error from api-rfp and a successfull flow on retry
   */
  public mockErrorApiRFPAndRetry(participantStaticIds: string[]) {
    this.mockSuccessfullMembers(participantStaticIds)
    this.mockSuccessfulTradeAndCargo()

    // API-RFP fails
    this.axiosMock.onPost(/api-rfp.*/).networkErrorOnce(500)

    // Retry succeeds
    this.mockSuccessfullRFPRequest(participantStaticIds)
  }

  /**
   * Mocks a successful RFP response flow
   */
  public mockSuccessfulRFPReply(captureData?: (config: any) => void) {
    this.axiosMock.onPost(/api-rfp.*/).replyOnce(config => {
      if (captureData) {
        captureData(config.data)
      }
      return [
        200,
        {
          rfpId: 'rfpId',
          actionStatus: { field: 'someField' }
        }
      ]
    })

    this.passThroughRF()
  }

  public mockSuccessfulRFPReplyAccept(captureData?: (config: any) => void) {
    this.axiosMock.onPost(new RegExp(`.*api-rfp.*/v0/accept/.*`)).reply(config => {
      if (captureData) {
        captureData(config.data)
      }
      return [
        200,
        {
          rfpId: 'rfpId',
          actionStatuses: [{ field: 'someField' }]
        }
      ]
    })
  }

  /**
   * Mocks a call flow returning a network error from api-rfp and a successfull flow on retry for replies
   */
  public mockErrorApiRFPAndRetryRFPReply(isAcceptReply?: boolean) {
    // API-RFP fails
    this.axiosMock.onPost(/api-rfp.*/).networkErrorOnce(500)

    // Retry succeeds
    if (isAcceptReply) {
      this.mockSuccessfulRFPReplyAccept()
    } else {
      this.mockSuccessfulRFPReply()
    }
  }

  /**
   * Mocks a successful call to api-registry to get the entry of a member
   */
  public mockSuccessfulGetCompanyEntry(overrides: object = {}) {
    this.axiosMock.onGet(/api-registry.*/).replyOnce(200, [{ x500Name: { O: 'Company name' }, ...overrides }])
  }

  /**
   * Mocks a successful call to api-notif to post a notification
   */
  public mockSuccessfulTaskOrNotification() {
    this.axiosMock.onPost(/api-notif.*/).reply(200, [{}])
  }

  public captureSuccessfulTaskOrNotifiation(fn: (cfg: AxiosRequestConfig) => void) {
    this.axiosMock.onPost(/api-notif.*/).reply((config: AxiosRequestConfig) => {
      fn(config)
      return [200, [{}]]
    })
  }

  public mockSuccessfulTaskOrNotificationAll() {
    this.axiosMock.onPost(/api-notif.*/).reply(200, [{}])
  }

  public mockErrorTaskOrNotificationAll() {
    this.axiosMock.onPost(/api-notif.*/).networkError()
  }

  public passThroughRF() {
    this.axiosMock.onPost(/localhost:8080.*/).passThrough()
  }

  /**
   * API trade cargo returns a trade and multiple movements for that trade
   */
  protected mockSuccessfulTradeAndCargo(sourceId = 'sourceID', source = TradeSource.Komgo) {
    this.axiosMock
      .onGet(new RegExp(`.*api-trade-cargo.*/v0/trades/.*/movements`))
      .reply(200, [
        {
          _id: 'movement0',
          grade: Grade.Brent,
          sourceId,
          source,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'movement1',
          grade: Grade.Ekofisk,
          sourceId,
          source,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ])
      .onGet(new RegExp(`.*api-trade-cargo.*/v0/trades`))
      .reply(200, {
        total: 1,
        items: [
          {
            _id: 'tradeId',
            sourceId,
            source,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      })
  }

  // ---------------------------------

  /**
   * This will exhaust the axios-retry calls for the httpCall
   */
  private failCall(httpCall: () => void) {
    // Total calls axios-retry will make is the first call + the number of retries
    for (let i = 0; i < defaultAxiosRetries + 1; i++) {
      httpCall()
    }
  }

  /**
   * API-registry returns members
   */
  private mockSuccessfullMembers(participantStaticIds: string[]) {
    const members = []

    for (const staticId of participantStaticIds) {
      members.push({ staticId })
    }

    this.axiosMock.onGet(/api-registry.*/).reply(200, members)
  }

  /**
   * API-RFP returns the rfpId and actionStatuses
   */
  private mockSuccessfulRFPCreation = (participantStaticIds: string[]) => {
    const actionStatuses = Array(participantStaticIds.length).fill({ field: 'someField' })

    this.axiosMock.onPost(new RegExp(`.*api-rfp.*/v0/request`)).reply(200, {
      staticId: uuid4(),
      actionStatuses
    })
  }

  /**
   * API-RFP returns the rfpId and actionStatuses
   */
  private captureRFPCreation = (participantStaticIds: string[], fn: (cfg: AxiosRequestConfig) => void) => {
    const actionStatuses = Array(participantStaticIds.length).fill({ field: 'someField' })

    this.axiosMock.onPost(new RegExp(`.*api-rfp.*/v0/request`)).reply((config: AxiosRequestConfig) => {
      fn(config)
      return [
        200,
        {
          staticId: uuid4(),
          actionStatuses
        }
      ]
    })
  }

  private passThroughRemaining() {
    this.axiosMock.onAny().passThrough()
  }
}
