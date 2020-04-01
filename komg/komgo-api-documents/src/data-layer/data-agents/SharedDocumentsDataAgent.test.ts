import 'reflect-metadata'

import * as _ from 'lodash'
import mockingoose from 'mockingoose'

import * as TestData from '../models/test-entities'

import SharedDocumentsDataAgent from './SharedDocumentsDataAgent'
import { createCommonTests } from './test-utils'

const sharedDocuments = TestData.sharedDocuments()

describe('SharedDocumentsDataAgent', () => {
  createCommonTests(mockingoose.SharedDocuments, new SharedDocumentsDataAgent(), sharedDocuments)

  let sharedDocumentsDataAgent: SharedDocumentsDataAgent

  const sharedDocumentsToBeExpected = {
    _id: sharedDocuments.id,
    ..._.omit(sharedDocuments, ['id'])
  }

  beforeEach(async () => {
    sharedDocumentsDataAgent = new SharedDocumentsDataAgent()

    mockingoose.SharedDocuments.toReturn(sharedDocuments, 'find')
  })

  it('gets all shared documents with context', async () => {
    const result = await sharedDocumentsDataAgent.getAllWithContext(TestData.PRODUCT_ID, TestData.context())
    expect(JSON.stringify(result)).toBe(JSON.stringify(sharedDocumentsToBeExpected))
  })

  it('gets all shared documents by requestId', async () => {
    const result = await sharedDocumentsDataAgent.getAllByRequestId(TestData.PRODUCT_ID, TestData.INCOMING_REQUEST_ID)
    expect(JSON.stringify(result)).toBe(JSON.stringify(sharedDocumentsToBeExpected))
  })
})
