import 'reflect-metadata'

import mockingoose from 'mockingoose'

import * as TestData from '../models/test-entities'
import { IType } from '../models/type'

import InvalidItem from './exceptions/InvalidItem'
import InvalidOperation from './exceptions/InvalidOperation'
import { createCommonTests } from './test-utils'
import TypeDataAgent from './TypeDataAgent'

const field = Object.freeze({
  id: 'field-id',
  name: 'Field',
  type: 'string',
  isArray: false
})

const type: IType = {
  id: TestData.TYPE_ID,
  productId: TestData.PRODUCT_ID,
  categoryId: TestData.CATEGORY_ID,
  name: 'type-name',
  fields: [],
  predefined: false
}

const newField = {
  name: 'Field',
  type: 'string',
  isArray: false
}

const typePredefined = Object.freeze({
  id: TestData.TYPE_ID,
  categoryId: TestData.CATEGORY_ID,
  name: 'type-name',
  fields: [field],
  predefined: true
})

describe('TypeDataAgent', () => {
  let agent

  beforeEach(() => {
    agent = new TypeDataAgent()
  })

  createCommonTests(mockingoose.Type, new TypeDataAgent(), type)

  it('fails to update if updated type has duplicated names', async () => {
    mockingoose.Type.toReturn(type, 'findOne')
    const invalidType = {
      ...type,
      fields: [newField, newField]
    }

    const result = agent.update(TestData.PRODUCT_ID, invalidType)
    await expect(result).rejects.toThrow(InvalidItem)
  })

  it('fails to update if updated type has duplicated ids', async () => {
    mockingoose.Type.toReturn(type, 'findOne')
    const invalidType = {
      ...type,
      fields: [
        {
          id: 'id',
          name: 'name1'
        },
        {
          id: 'id',
          name: 'name2'
        }
      ]
    }

    const result = agent.update(TestData.PRODUCT_ID, invalidType)
    await expect(result).rejects.toThrow('Fields should have unique ids')
  })

  it('throw InvalidOperation if deleting a predefined document type', async () => {
    mockingoose.Type.toReturn(typePredefined, 'findOne')

    const result = agent.delete(TestData.PRODUCT_ID, typePredefined.id)
    await expect(result).rejects.toThrow(new InvalidOperation('Cannot change a predefined document type'))
  })

  it('throw InvalidOperation if updating a predefined document type', async () => {
    mockingoose.Type.toReturn(typePredefined, 'findOne')

    const result = agent.update(TestData.PRODUCT_ID, typePredefined)
    await expect(result).rejects.toThrow(new InvalidOperation('Cannot change a predefined document type'))
  })
})
