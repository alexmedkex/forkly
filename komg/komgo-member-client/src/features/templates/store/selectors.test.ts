import * as React from 'react'
import { fromJS } from 'immutable'
import { buildFakeTemplate, Product, SubProduct, ITemplate } from '@komgo/types'
import { findLatestTemplate, selectTemplateByProductAndSubProduct } from './selectors'

describe('selectTemplateByProductAndSubProduct', () => {
  let template1: ITemplate
  let template2: ITemplate
  let template3: ITemplate
  let template4: ITemplate
  let templates: any

  beforeEach(() => {
    template1 = buildFakeTemplate({ productId: Product.KYC, subProductId: SubProduct.LetterOfCredit })
    template2 = buildFakeTemplate({
      staticId: 'template2id',
      productId: Product.TradeFinance,
      subProductId: SubProduct.LetterOfCredit
    })
    template3 = buildFakeTemplate({
      staticId: 'template3id',
      productId: Product.TradeFinance,
      subProductId: SubProduct.StandByLetterOfCredit
    })
    template4 = buildFakeTemplate({
      staticId: 'template4id',
      productId: Product.TradeFinance,
      subProductId: SubProduct.StandByLetterOfCredit
    })

    templates = fromJS({
      [template1.staticId]: template1,
      [template2.staticId]: template2,
      [template3.staticId]: template3,
      [template4.staticId]: template4
    })
  })
  it('selects none with no match', () => {
    const output = selectTemplateByProductAndSubProduct(templates, Product.KYC, SubProduct.Trade)

    expect(output.size).toEqual(0)
  })
  it('selects one with one match', () => {
    const output = selectTemplateByProductAndSubProduct(templates, Product.TradeFinance, SubProduct.LetterOfCredit)

    expect(output.size).toEqual(1)
    expect(output.get(0).get('staticId')).toEqual(template2.staticId)
  })
  it('selects two with two matches', () => {
    const output = selectTemplateByProductAndSubProduct(
      templates,
      Product.TradeFinance,
      SubProduct.StandByLetterOfCredit
    )

    expect(output.size).toEqual(2)
    expect(output.get(0).get('staticId')).toEqual(template3.staticId)
    expect(output.get(1).get('staticId')).toEqual(template4.staticId)
  })
})

describe('findLatestTemplate', () => {
  let templates
  let template1: ITemplate
  let template2: ITemplate
  let template3: ITemplate

  it('returns the latest', () => {
    template1 = buildFakeTemplate({
      staticId: 'template2id',
      createdAt: '2019-06-17T10:36:13.578Z'
    })
    template2 = buildFakeTemplate({
      staticId: 'template2id',
      createdAt: '2019-08-17T10:36:13.578Z'
    })
    template3 = buildFakeTemplate({
      staticId: 'template3id',
      createdAt: '2019-07-17T10:36:13.578Z'
    })

    templates = fromJS({
      [template1.staticId]: template1,
      [template2.staticId]: template2,
      [template3.staticId]: template3
    })

    templates = fromJS(templates)

    const template = findLatestTemplate(templates)
    expect(template.staticId).toEqual(template2.staticId)
  })
})
