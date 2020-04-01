import 'reflect-metadata'

import mockingoose from 'mockingoose'

import * as TestData from '../models/test-entities'

import OutgoingRequestDataAgent from './OutgoingRequestDataAgent'
import { createCommonTests } from './test-utils'

describe('OutgoingRequestDataAgent', () => {
  createCommonTests(mockingoose.OutgoingRequest, new OutgoingRequestDataAgent(), TestData.outgoingRequest())
})
