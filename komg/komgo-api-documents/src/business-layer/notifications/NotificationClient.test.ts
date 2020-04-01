import 'reflect-metadata'

import { INotificationCreateRequest, NotificationLevel, NotificationManager } from '@komgo/notification-publisher'
import * as ServerMock from 'mock-http-server'

import { NOTIFICATION_TYPE, NOTIFICATION_USER } from '../messaging/enums'

import { NotificationClient } from './NotificationClient'
import NotificationSendError from './NotificationSendError'

const notification: INotificationCreateRequest = {
  productId: 'productId',
  type: NOTIFICATION_TYPE.DocumentTask,
  level: NotificationLevel.danger,
  toUser: NOTIFICATION_USER.ComplianceManagerOrAnalyst,
  payload: { any: 'payload' },
  message: 'string'
}

describe('NotificationClient', () => {
  let client: NotificationClient

  const server = new ServerMock({ host: 'localhost', port: 9001 })

  beforeEach(function(done) {
    server.start(done)
    client = new NotificationClient(new NotificationManager('http://localhost:9001'), 0)
  })

  afterEach(function(done) {
    server.stop(done)
  })

  it('sends notification', async done => {
    server.on({
      method: 'POST',
      path: '/v0/notifications',
      reply: {
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({})
      }
    })

    await client.sendNotification(notification)

    const requests = server.requests({ method: 'POST', path: '/v0/notifications' })
    expect(requests.length).toEqual(1)
    done()
  })

  it('retries sending a notification on 5xx', async done => {
    server.on({
      method: 'POST',
      path: '/v0/notifications',
      reply: {
        status: 500
      }
    })

    const call = client.sendNotification(notification)
    await expect(call).rejects.toThrow(
      new NotificationSendError('Failed to send notification. Request failed with status code 500')
    )

    const requests = server.requests({ method: 'POST', path: '/v0/notifications' })
    expect(requests.length).toEqual(4)

    done()
  })

  it('does not retries sending a notification on 4xx', async done => {
    server.on({
      method: 'POST',
      path: '/v0/notifications',
      reply: {
        status: 400
      }
    })

    const call = client.sendNotification(notification)
    await expect(call).rejects.toThrow(
      new NotificationSendError('Failed to send notification. Request failed with status code 400')
    )

    const requests = server.requests({ method: 'POST', path: '/v0/notifications' })
    expect(requests.length).toEqual(1)

    done()
  })

  it('does not fail sending a notification on 404', async done => {
    server.on({
      method: 'POST',
      path: '/v0/notifications',
      reply: {
        status: 404
      }
    })

    await client.sendNotification(notification)

    const requests = server.requests({ method: 'POST', path: '/v0/notifications' })
    expect(requests.length).toEqual(1)

    done()
  })
})
