import 'reflect-metadata'
import mockingoose from 'mockingoose'

import { incomingRequest } from '../models/test-entities'

import IncomingRequestDataAgent from './IncomingRequestDataAgent'
import { createCommonTests } from './test-utils'

describe('IncomingRequestDataAgent', () => {
  createCommonTests(mockingoose.IncomingRequest, new IncomingRequestDataAgent(), incomingRequest())
})
