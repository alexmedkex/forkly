import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { TradeValidator } from './TradeValidator'
import { DocumentServiceClient, IDocumentServiceClient } from '../../business-layer/documents/DocumentServiceClient'
import { buildFakeTrade, PaymentTermsOption, PriceOption, TRADE_SCHEMA_VERSION } from '@komgo/types'

let tradeValidator: TradeValidator
let documentServiceClient: IDocumentServiceClient

const SELLER = 'SELLER'
const BUYER = 'BUYER'

describe('TradeValidator', () => {
  beforeEach(() => {
    documentServiceClient = createMockInstance(DocumentServiceClient)
    tradeValidator = new TradeValidator(documentServiceClient, BUYER)
  })

  describe('version 1', () => {
    describe('.validate', () => {
      it('succeed ', async () => {
        documentServiceClient.getDocumentTypes = jest.fn().mockResolvedValue([{ id: 'Q88' }])
        const errors = await tradeValidator.validate(
          buildFakeTrade({ buyerEtrmId: 'buyerEtrmId', buyer: BUYER, seller: SELLER })
        )
        expect(errors).toBeUndefined()
      })

      it('fails ', async () => {
        documentServiceClient.getDocumentTypes = jest.fn().mockResolvedValue([{ id: 'Q88' }])
        const trade = {
          ...buildFakeTrade({
            buyer: BUYER,
            seller: SELLER
          })
        }
        trade.buyerEtrmId = undefined
        const errors = await tradeValidator.validate(trade)
        expect(errors).toEqual([
          {
            dataPath: '',
            keyword: 'required',
            message: "should have required property 'buyerEtrmId'",
            params: { missingProperty: 'buyerEtrmId' },
            schemaPath: '#/allOf/0/else/required'
          },
          {
            dataPath: '',
            keyword: 'if',
            message: 'should match "else" schema',
            params: { failingKeyword: 'else' },
            schemaPath: '#/allOf/0/if'
          }
        ])
      })
    })
  })

  describe('version 2', () => {
    describe('.validate', () => {
      it('succeed ', async () => {
        documentServiceClient.getDocumentTypes = jest.fn().mockResolvedValue([{ id: 'Q88' }])
        const trade = {
          ...buildFakeTrade({
            buyerEtrmId: 'buyerEtrmId',
            deliveryLocation: 'some where',
            version: TRADE_SCHEMA_VERSION.V2,
            buyer: BUYER,
            seller: SELLER
          }),
          priceFormula: '2x',
          priceOption: PriceOption.Fix,
          paymentTermsOption: PaymentTermsOption.Deferred
        }
        const errors = await tradeValidator.validate(trade)
        expect(errors).toBeUndefined()
      })

      describe('failures', () => {
        it('fails with invalid price', async () => {
          documentServiceClient.getDocumentTypes = jest.fn().mockResolvedValue([{ id: 'Q88' }])
          const trade = {
            ...buildFakeTrade({
              buyerEtrmId: 'buyerEtrmId',
              deliveryLocation: 'some where',
              version: TRADE_SCHEMA_VERSION.V2,
              buyer: BUYER,
              seller: SELLER
            }),
            priceFormula: '2x',
            priceOption: PriceOption.Fix,
            paymentTermsOption: PaymentTermsOption.Deferred
          }

          trade.priceOption = 'INVALID_PRICE' as PriceOption
          const errors = await tradeValidator.validate(trade)
          expect(errors).toEqual([
            {
              dataPath: '.priceOption',
              keyword: 'enum',
              message: 'should be equal to one of the allowed values',
              params: { allowedValues: ['FIX', 'FLOATING'] },
              schemaPath: '#/properties/priceOption/enum'
            }
          ])
        })

        it('fails with minTolerance greater than maxTolerance', async () => {
          documentServiceClient.getDocumentTypes = jest.fn().mockResolvedValue([{ id: 'Q88' }])
          const trade = {
            ...buildFakeTrade({
              version: TRADE_SCHEMA_VERSION.V2,
              buyer: BUYER,
              seller: SELLER
            }),
            maxTolerance: 1,
            minTolerance: 2
          }

          const errors = await tradeValidator.validate(trade)
          expect(errors).toEqual([
            {
              dataPath: '.minTolerance',
              keyword: 'required',
              message: 'should be less than maxTolerance',
              params: {},
              schemaPath: '#/properties/minTolerance'
            }
          ])
        })
      })
    })
  })
})
