import 'reflect-metadata'

import mockingoose from 'mockingoose'

import * as TestData from '../models/test-entities'

import ReceivedDocumentsDataAgent from './ReceivedDocumentsDataAgent'
import { createCommonTests } from './test-utils'

describe('ReceivedDocumentsDataAgent', () => {
  createCommonTests(mockingoose.ReceivedDocuments, new ReceivedDocumentsDataAgent(), TestData.receivedDocuments())
})
