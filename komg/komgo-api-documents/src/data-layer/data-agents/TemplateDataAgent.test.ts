import 'reflect-metadata'

import mockingoose from 'mockingoose'

import * as TestData from '../models/test-entities'

import TemplateDataAgent from './TemplateDataAgent'
import { createCommonTests } from './test-utils'
import { ITemplate } from '../models/template'

describe('TemplateDataAgent', () => {
  createCommonTests(mockingoose.Template, new TemplateDataAgent(), TestData.template())

  it('should throw if template has an id', async () => {
    const template: ITemplate = {
      id: 'some ID',
      productId: 'kyc',
      name: 'templateName',
      types: ['crs'],
      metadata: [{ name: '', value: '' }]
    }

    const agent = new TemplateDataAgent()
    try {
      await agent.validateNewRecord(template)
    } catch (e) {
      expect(e).toBeDefined()
    }
  })

  it('should throw when update if template already has id', async () => {
    const template: ITemplate = {
      id: 'ID',
      productId: 'kyc',
      name: 'templateName',
      types: ['crs'],
      metadata: [{ name: '', value: '' }]
    }

    const updateTemplate: ITemplate = {
      id: 'new ID',
      productId: 'kyc',
      name: 'templateName',
      types: ['crs'],
      metadata: [{ name: '', value: '' }]
    }

    const agent = new TemplateDataAgent()
    try {
      await agent.validateUpdateRecord(template, updateTemplate)
    } catch (e) {
      expect(e).toBeDefined()
    }
  })
})
