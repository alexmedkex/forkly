import 'reflect-metadata'

import mockingoose from 'mockingoose'

import * as TestData from '../models/test-entities'

import CategoryDataAgent from './CategoryDataAgent'
import { createCommonTests } from './test-utils'

describe('CategoryDataAgent', () => {
  createCommonTests(mockingoose.Category, new CategoryDataAgent(), TestData.category())
})
