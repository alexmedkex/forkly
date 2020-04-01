import { HasIdAndName } from './AccordionList'

const defaultHasIdAndName: HasIdAndName = { id: '-1', name: 'foo' }

export const fakeHasIdAndName = (param: Partial<HasIdAndName>): HasIdAndName => {
  return {
    id: param.id || defaultHasIdAndName.id,
    name: param.name || defaultHasIdAndName.name
  }
}
