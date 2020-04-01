import { v4 as uuid4 } from 'uuid'

export const toExtended = <T = object>(document: T): T & { staticId: string } => {
  return {
    ...document,
    staticId: uuid4()
  }
}
