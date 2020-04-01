import 'jest'
import * as jestMock from 'jest-mock'

import { IClassType } from './utils'

export function mock<T>(classType: IClassType<T>): any {
  const mockType = jestMock.generateFromMetadata(jestMock.getMetadata(classType))
  return new mockType()
}
