import { buildFakeReceivablesDiscountingExtended } from '@komgo/types'
import 'reflect-metadata'

import { PRODUCT_ID, SubProductId } from '../../constants'
import { UpdateType } from '../types'

import { OutboundMessageFactory } from './OutboundMessageFactory'

describe('OutboundMessageFactory test', () => {
  let outboundMessageFactory: OutboundMessageFactory

  beforeEach(() => {
    outboundMessageFactory = new OutboundMessageFactory('companyStaticId')
  })

  it('Creates and RD update message', () => {
    const routingKey = 'KOMGO.RD.UPDATE.ReceivablesDiscounting'
    const rd = buildFakeReceivablesDiscountingExtended(true)

    const result = outboundMessageFactory.createRDUpdateMessage(rd.staticId, rd, UpdateType.ReceivablesDiscounting)

    expect(result).toEqual({
      version: 1,
      context: {
        productId: PRODUCT_ID,
        subProductId: SubProductId.ReceivableDiscounting,
        rdId: rd.staticId,
        updateType: UpdateType.ReceivablesDiscounting
      },
      messageType: routingKey,
      data: {
        entry: rd,
        senderStaticId: 'companyStaticId',
        updateType: UpdateType.ReceivablesDiscounting
      }
    })
  })
})
