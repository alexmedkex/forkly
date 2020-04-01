// tslint:disable-next-line:no-implicit-dependencies
import * as jestMock from 'jest-mock'

export type IClassType<T> = new (...args: any[]) => T

export function mock<T>(classType: IClassType<T>): any {
  const mockType = jestMock.generateFromMetadata(jestMock.getMetadata(classType))
  return new mockType()
}
