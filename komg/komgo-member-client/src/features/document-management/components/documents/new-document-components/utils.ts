import { HasId, HasName } from '../../../store/types'

export const hasIdAndNameToOption = (collection: Array<HasId & HasName>): Array<{ key: string }> => {
  const originalCollection = collection.map(el => {
    return { key: el.id, text: el.name, value: el.id }
  })
  return originalCollection.reduce((unique: Array<{ key: string }>, o: { key: string }) => {
    if (!unique.some((obj: { key: string }) => obj.key === o.key)) {
      unique.push(o)
    }
    return unique
  }, [])
}
