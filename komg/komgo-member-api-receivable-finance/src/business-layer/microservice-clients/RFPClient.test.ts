import { ReplyType } from '@komgo/types'
import Axios, { AxiosInstance } from 'axios'
import MockAdapter from 'axios-mock-adapter'
import 'reflect-metadata'

import { createRetryingAxios } from '../../utils/axiosRetryFactory'
import { MicroserviceClientError } from '../errors'

import { RFPClient } from './RFPClient'

const API_RFP_DOMAIN = 'http://api-rfp'

describe('RFPClient', () => {
  let dataAgent: RFPClient
  let axiosMock: MockAdapter
  let axiosInstance: AxiosInstance

  beforeAll(() => {
    axiosMock = new MockAdapter(Axios)
    axiosInstance = createRetryingAxios(0)
  })

  beforeEach(() => {
    dataAgent = new RFPClient(API_RFP_DOMAIN, axiosInstance)
  })

  describe('postRFPRequest', () => {
    const mockRFPRequestQuery = {
      productId: 'productId',
      subProductId: 'subProductId'
    }

    it('should post a new RFP Request successfully', async () => {
      const expectedData = {
        staticId: 'rfpId',
        actionStatuses: [
          {
            recipientStaticId: 'recipientStaticId',
            status: 'Processed'
          }
        ]
      }

      axiosMock.onPost(/api-rfp.*/).replyOnce(200, expectedData)

      const result = await dataAgent.postRFPRequest(mockRFPRequestQuery as any)

      expect(result).toEqual(expectedData)
    })

    it('should throw an error if no data is returned', async () => {
      const expectedData = null

      axiosMock.onPost(/api-rfp.*/).replyOnce(200, expectedData)

      await expect(dataAgent.postRFPRequest(mockRFPRequestQuery as any)).rejects.toThrowError(MicroserviceClientError)
    })

    it('should throw an error if data returned does not contain a staticId field', async () => {
      const expectedData = {
        notAStaticId: 'notAStaticId'
      }

      axiosMock.onPost(/api-rfp.*/).replyOnce(200, expectedData)

      await expect(dataAgent.postRFPRequest(mockRFPRequestQuery as any)).rejects.toThrowError(MicroserviceClientError)
    })

    it('should throw an error if data returned does not contain an actionStatuses field', async () => {
      const expectedData = {
        staticId: 'staticId'
      }

      axiosMock.onPost(/api-rfp.*/).replyOnce(200, expectedData)

      await expect(dataAgent.postRFPRequest(mockRFPRequestQuery as any)).rejects.toThrowError(MicroserviceClientError)
    })

    it('should throw an error if data returned contains an empty actionStatuses array field', async () => {
      const expectedData = {
        staticId: 'staticId',
        actionStatuses: []
      }

      axiosMock.onPost(/api-rfp.*/).replyOnce(200, expectedData)

      await expect(dataAgent.postRFPRequest(mockRFPRequestQuery as any)).rejects.toThrowError(MicroserviceClientError)
    })

    it('should throw an error if the request fails', async () => {
      axiosMock.onPost(/api-rfp.*/).networkErrorOnce(500)

      await expect(dataAgent.postRFPRequest(mockRFPRequestQuery as any)).rejects.toThrowError(MicroserviceClientError)
    })
  })

  describe('postRFPResponse', () => {
    const RFP_ID = 'rfpId'
    const RESPONSE_TYPE = ReplyType.Submitted
    const mockRFPResponse = {
      responseData: 'responseData',
      taskActionId: 'taskActionId',
      participantStaticId: 'pId'
    }

    it('should post a new RFP Response successfully with type Submitted', async () => {
      const expectedData = {
        rfpId: 'rfpId',
        actionStatus: {
          recipientStaticId: 'recipientStaticId',
          status: 'Processed'
        }
      }

      axiosMock.onPost(/api-rfp.*/).replyOnce(200, expectedData)

      const result = await dataAgent.postRFPResponse(RFP_ID, mockRFPResponse as any, RESPONSE_TYPE)

      expect(result).toEqual(expectedData)
    })

    it('should post a new RFP Response successfully with type Reject', async () => {
      const expectedData = {
        rfpId: 'rfpId',
        actionStatus: {
          recipientStaticId: 'recipientStaticId',
          status: 'Processed'
        }
      }

      axiosMock.onPost(/api-rfp.*/).replyOnce(200, expectedData)

      const result = await dataAgent.postRFPResponse(RFP_ID, mockRFPResponse as any, ReplyType.Reject)

      expect(result).toEqual(expectedData)
    })

    it('should post a new RFP Response successfully with type Accepted', async () => {
      const expectedData = {
        rfpId: 'rfpId',
        actionStatus: {
          recipientStaticId: 'recipientStaticId',
          status: 'Processed'
        }
      }

      axiosMock.onPost(/api-rfp.*/).replyOnce(200, expectedData)

      const result = await dataAgent.postRFPResponse(RFP_ID, mockRFPResponse as any, ReplyType.Accepted)

      expect(result).toEqual(expectedData)
    })

    it('should throw an error if no data is returned', async () => {
      const expectedData = null

      axiosMock.onPost(/api-rfp.*/).replyOnce(200, expectedData)

      await expect(dataAgent.postRFPResponse(RFP_ID, mockRFPResponse as any, RESPONSE_TYPE)).rejects.toThrowError(
        MicroserviceClientError
      )
    })

    it('should throw an error if data returned does not contain a rfpId field', async () => {
      const expectedData = {
        notARFPId: 'notARFPId'
      }

      axiosMock.onPost(/api-rfp.*/).replyOnce(200, expectedData)

      await expect(dataAgent.postRFPResponse(RFP_ID, mockRFPResponse as any, RESPONSE_TYPE)).rejects.toThrowError(
        MicroserviceClientError
      )
    })

    it('should throw an error if data returned does not contain an actionStatus field', async () => {
      const expectedData = {
        staticId: 'staticId'
      }

      axiosMock.onPost(/api-rfp.*/).replyOnce(200, expectedData)

      await expect(dataAgent.postRFPResponse(RFP_ID, mockRFPResponse as any, RESPONSE_TYPE)).rejects.toThrowError(
        MicroserviceClientError
      )
    })

    it('should throw an error if the request fails', async () => {
      axiosMock.onPost(/api-rfp.*/).networkErrorOnce(500)

      await expect(dataAgent.postRFPResponse(RFP_ID, mockRFPResponse as any, RESPONSE_TYPE)).rejects.toThrowError(
        MicroserviceClientError
      )
    })
  })
})
