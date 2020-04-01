import 'reflect-metadata'

import CommonMessageReceived from './CommonMessageReceived'
import { Platform } from './Platform'
import { MessageProcessingError } from './types'

describe('Receoved Common-MQ Message', () => {
  it('should provide return Komgo platform if senderPlatform is komgo', () => {
    const routingKey = 'ignored'
    const msg = new CommonMessageReceived(routingKey, { payload: '' }, { senderPlatform: 'komgo' })

    const platform = msg.getSenderPlatform()

    expect(platform).toBe(Platform.KOMGO)
  })

  it('should provide return VAKT platform if senderPlatform is vakt', () => {
    const routingKey = 'ignored'
    const msg = new CommonMessageReceived(routingKey, { payload: '' }, { senderPlatform: 'vakt' })

    const platform = msg.getSenderPlatform()

    expect(platform).toBe(Platform.VAKT)
  })

  it('should use routingKey if senderPlatform property is empty', () => {
    const routingKey = 'komgo.internal'
    const msg = new CommonMessageReceived(routingKey, { payload: '' }, { senderPlatform: '' })

    const platform = msg.getSenderPlatform()

    expect(platform).toBe(Platform.KOMGO)
  })

  it('should throw exception if platform is not supported', () => {
    const routingKey = 'ignored'
    const msg = new CommonMessageReceived(routingKey, { payload: '' }, { senderPlatform: 'nextPlat' })

    expect.assertions(1)
    try {
      msg.getSenderPlatform()
    } catch (e) {
      expect(e).toBeInstanceOf(MessageProcessingError)
    }
  })

  it('should give priority to senderPlatform property', () => {
    const routingKey = 'komgo.internal'
    const msg = new CommonMessageReceived(routingKey, { payload: '' }, { senderPlatform: 'vakt' })

    const platform = msg.getSenderPlatform()

    expect(platform).toBe(Platform.VAKT)
  })

  it('should provide return Komgo platform for `komgo.internal` if no senderPlatform', () => {
    const routingKey = 'komgo.internal'
    const msg = new CommonMessageReceived(routingKey, { payload: '' }, {})

    const platform = msg.getSenderPlatform()

    expect(platform).toBe(Platform.KOMGO)
  })

  it('should provide return Komgo platform for `any.komgo` if no senderPlatform', () => {
    const routingKey = 'any.KomGo'
    const msg = new CommonMessageReceived(routingKey, { payload: '' }, {})

    const platform = msg.getSenderPlatform()

    expect(platform).toBe(Platform.KOMGO)
  })

  it('should provide return VAKT platform anything else not KOMGO if no senderPlatform', () => {
    const routingKey = 'any.other' // in the future we should support more platforms as routingKeys are defined
    const msg = new CommonMessageReceived(routingKey, { payload: '' }, {})

    const platform = msg.getSenderPlatform()

    expect(platform).toBe(Platform.VAKT)
  })
})
