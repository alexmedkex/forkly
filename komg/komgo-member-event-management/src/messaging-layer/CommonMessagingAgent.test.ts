import 'reflect-metadata'
import * as moxios from 'moxios'

import CommonMessagingAgent from './CommonMessagingAgent'
import { IEncryptedEnvelope, ICommonMessageProperties, IRsaEncryptedPayload } from './types'
import { ICompanyRegistryAgent } from '../data-layer/data-agent/ICompanyRegistryAgent'
import { HEADERS } from './consts'
import { MessageTooLargeError } from './MessageTooLargeError'
import * as stream from 'stream'

const BASE_URL = 'http://host:1234/'
const USERNAME = 'username'
const PASSWORD = 'pass'
const MESSAGE_ID = 'MESSAGE_ID'
const CORRELATION_ID = 'CORRELATION_ID'
const CONTENT_LENGTH = 1000
const REQUEST_TIMEOUT = 1000

const convertObjectToStream = object => {
  const bufferStream = new stream.PassThrough()
  bufferStream.end(new Buffer(JSON.stringify(object)))
  return bufferStream
}

describe('Common Messaging', () => {
  let agent: CommonMessagingAgent

  const routingKey = 'KOMGO.LC.Request'
  const mnid = 'MNID'
  const staticId = 'STATIC_ID'
  const testPayload = { myMessage: 'hello' }
  const testPayloadString = JSON.stringify({ myMessage: 'hello' })
  const receivedRsaEncryptedPayload: IRsaEncryptedPayload = {
    payload: testPayloadString
  }
  const encryptedEnvelope: IEncryptedEnvelope = {
    message: 'encrypted message'
  }
  const properties: ICommonMessageProperties = {
    recipientMnid: 'mnidRecipient',
    senderMnid: 'mnidSender',
    senderStaticId: 'senderStaticId',
    senderPlatform: 'senderPlatform'
  }

  const registryService: ICompanyRegistryAgent = {
    getEntryFromStaticId: jest.fn(),
    getMnidFromStaticId: jest.fn(),
    getPropertyFromMnid: jest.fn()
  }

  beforeEach(() => {
    moxios.install()
    agent = new CommonMessagingAgent(BASE_URL, USERNAME, PASSWORD, CONTENT_LENGTH, REQUEST_TIMEOUT, registryService)

    registryService.getMnidFromStaticId.mockImplementation(() => 'MNID1')
  })

  afterEach(function() {
    moxios.uninstall()
  })

  it('should throw eror if there is an error getting messages from the queue', async done => {
    moxios.stubRequest(`${BASE_URL}/api/queues/%2F/MNID1-QUEUE-ACK/get`, {
      status: 500,
      response: undefined
    })

    moxios.wait(async () => {
      expect(agent.getMessage(staticId)).rejects.toThrowError(Error)
      done()
    })
  })

  it('should send message', async done => {
    moxios.stubRequest(`${BASE_URL}/api/exchanges/%2F/${mnid}/publish`, {
      status: 200,
      response: { routed: true }
    })
    const resultPromise = agent.sendMessage(routingKey, mnid, encryptedEnvelope, properties)
    moxios.wait(async () => {
      const result = await resultPromise
      expect(result.routed).toBeTruthy()
      done()
    })
  })

  it('should throw error if sending message is Too Large', async done => {
    moxios.stubRequest(`${BASE_URL}/api/exchanges/%2F/${mnid}/publish`, {
      status: 413,
      response: {}
    })

    moxios.wait(async () => {
      expect(agent.sendMessage(routingKey, mnid, encryptedEnvelope, properties)).rejects.toThrow(MessageTooLargeError)
      done()
    })
  })

  it('should throw error if sending message is Too Large', async done => {
    moxios.stubRequest(`${BASE_URL}/api/exchanges/%2F/${mnid}/publish`, {
      status: 500,
      response: {}
    })

    moxios.wait(async () => {
      expect(agent.sendMessage(routingKey, mnid, encryptedEnvelope, properties)).rejects.toThrow(Error)
      done()
    })
  })

  it('should receive messages', async done => {
    registryService.getMnidFromStaticId.mockImplementation(() => 'MNID1')
    const headers = {}
    headers[HEADERS.RecipientMnid] = properties.recipientMnid
    headers[HEADERS.SenderMnid] = properties.senderMnid
    headers[HEADERS.SenderPlatform] = properties.senderPlatform
    headers[HEADERS.SenderStaticId] = properties.senderStaticId

    moxios.stubRequest(`${BASE_URL}/api/queues/%2F/MNID1-QUEUE-ACK/get`, {
      status: 200,
      response: convertObjectToStream([])
    })
    moxios.stubRequest(`${BASE_URL}/api/queues/%2F/MNID1-QUEUE/get`, {
      status: 200,

      response: convertObjectToStream([
        {
          routing_key: routingKey,
          payload: { payload: JSON.stringify(encryptedEnvelope) },
          properties: {
            message_id: MESSAGE_ID,
            correlation_id: CORRELATION_ID,
            headers
          }
        }
      ])
    })
    const response: ICommonMessageReceived = {
      message: {
        payload: '{"message":"encrypted message"}'
      },
      properties: {
        messageId: MESSAGE_ID,
        correlationId: CORRELATION_ID,
        recipientMnid: properties.recipientMnid,
        senderMnid: properties.senderMnid,
        senderStaticId: properties.senderStaticId,
        senderPlatform: properties.senderPlatform
      }
    }

    const resultPromise = agent.getMessage(staticId)
    moxios.wait(async () => {
      const result = await resultPromise
      expect(result.message.payload).toEqual(response.message)
      expect(result.properties).toEqual(response.properties)
      done()
    })
  })

  it('should ack messages', async done => {
    moxios.stubRequest(`${BASE_URL}/api/queues/%2F/MNID1-QUEUE-ACK/get`, {
      status: 200,
      response: convertObjectToStream([
        {
          routing_key: routingKey,
          payload: JSON.stringify(testPayload),
          properties: {
            message_id: MESSAGE_ID,
            correlation_id: CORRELATION_ID,
            headers: {
              recipientMnid: properties.recipientMnid
            }
          }
        }
      ])
    })

    const resultPromise = agent.ackMessage(staticId)

    moxios.wait(async () => {
      const result = await resultPromise
      expect(result).toBeTruthy()
      done()
    })
  })

  it('should not ack message if ack queue is empty', async done => {
    moxios.stubRequest(`${BASE_URL}/api/queues/%2F/MNID1-QUEUE-ACK/get`, {
      status: 200,
      response: convertObjectToStream([])
    })

    const resultPromise = agent.ackMessage(staticId)

    moxios.wait(async () => {
      const result = await resultPromise
      expect(result).toBeFalsy()
      done()
    })
  })

  it('should return message unacked if there is one in the ack queue', async done => {
    moxios.stubRequest(`${BASE_URL}/api/queues/%2F/MNID1-QUEUE-ACK/get`, {
      status: 200,
      response: convertObjectToStream([
        {
          routing_key: routingKey,
          payload: testPayloadString,
          properties: {
            message_id: MESSAGE_ID,
            correlation_id: CORRELATION_ID,
            headers: {
              recipientMnid: properties.recipientMnid,
              senderMnid: properties.senderMnid,
              senderPlatform: properties.senderPlatform
            }
          }
        }
      ])
    })
    const response: ICommonMessageReceived = {
      message: receivedRsaEncryptedPayload,
      properties: {
        messageId: MESSAGE_ID,
        correlationId: CORRELATION_ID,
        recipientMnid: properties.recipientMnid,
        senderMnid: properties.senderMnid,
        senderPlatform: properties.senderPlatform
      }
    }

    const resultPromise = agent.getMessage(staticId)

    moxios.wait(async () => {
      const result = await resultPromise
      expect(result.message.payload).toEqual(response.message.payload)
      done()
    })
  })

  it('should throw eror if there are more than 1 message in ack queue when getting messages', async done => {
    moxios.stubRequest(`${BASE_URL}/api/queues/%2F/MNID1-QUEUE-ACK/get`, {
      status: 200,
      response: convertObjectToStream([
        {
          routing_key: routingKey,
          payload: JSON.stringify(encryptedEnvelope),
          properties: {
            message_id: MESSAGE_ID,
            correlation_id: CORRELATION_ID,
            headers: {}
          }
        },
        {
          routing_key: routingKey,
          payload: JSON.stringify(encryptedEnvelope),
          properties: {
            message_id: MESSAGE_ID,
            correlation_id: CORRELATION_ID,
            headers: {}
          }
        }
      ])
    })

    moxios.wait(async () => {
      await expect(agent.getMessage(staticId)).rejects.toThrow()
      done()
    })
  })

  it('should throw eror if there are more than 1 message in ack queue when acking getting messages', async done => {
    moxios.stubRequest(`${BASE_URL}/api/queues/%2F/MNID1-QUEUE-ACK/get`, {
      status: 200,
      response: convertObjectToStream([
        {
          routing_key: routingKey,
          payload: JSON.stringify(encryptedEnvelope),
          properties: {
            message_id: MESSAGE_ID,
            correlation_id: CORRELATION_ID,
            headers: {}
          }
        },
        {
          routing_key: routingKey,
          payload: JSON.stringify(encryptedEnvelope),
          properties: {
            message_id: MESSAGE_ID,
            correlation_id: CORRELATION_ID,
            headers: {}
          }
        }
      ])
    })

    moxios.wait(async () => {
      await expect(agent.ackMessage(staticId)).rejects.toThrow()
      done()
    })
  })

  it('if proxy https variable is present HttpsProxyAgent should be present under axios', () => {
    process.env.HTTPS_PROXY = 'http://fakeproxy:666'
    agent = new CommonMessagingAgent(BASE_URL, USERNAME, PASSWORD, CONTENT_LENGTH, REQUEST_TIMEOUT, registryService)
    expect(agent.axios.defaults.httpsAgent.proxy.protocol).toContain('http')
    expect(agent.axios.defaults.httpsAgent.proxy.host).toContain('fakeproxy')
    expect(agent.axios.defaults.httpsAgent.proxy.port).toBe(666)
  })

  it('if proxy http variable is present HttpProxyAgent should be present under axios', () => {
    process.env.HTTP_PROXY = 'http://fakeproxy:666'
    agent = new CommonMessagingAgent(BASE_URL, USERNAME, PASSWORD, CONTENT_LENGTH, REQUEST_TIMEOUT, registryService)

    let proxyUnsecurefiedAgent = new CommonMessagingAgent(
      BASE_URL,
      USERNAME,
      PASSWORD,
      CONTENT_LENGTH,
      REQUEST_TIMEOUT,
      registryService
    )

    expect(proxyUnsecurefiedAgent.axios.defaults.httpAgent.proxy.protocol).toContain('http')
    expect(proxyUnsecurefiedAgent.axios.defaults.httpAgent.proxy.host).toContain('fakeproxy')
    expect(proxyUnsecurefiedAgent.axios.defaults.httpAgent.proxy.port).toBe(666)
  })
})
