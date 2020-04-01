import { IHistoryEntry, IHistory } from '@komgo/types'
import { isEqual, isEmpty } from 'lodash'

import { IHasHistoryNecessaryFields } from '../business-layer/types'

const IGNORED_FIELDS = ['createdAt', 'updatedAt', 'staticId', '_id', 'sourceId']

/**
 * Create history from a list of entities
 *
 * @param entities List of entities to compute the history from
 * @param listOfIgnoredFields list of fields to ignore from the entities in the history computation
 */
export function createHistory<T extends IHasHistoryNecessaryFields>(
  entities: T[],
  listOfIgnoredFields: Array<keyof T> = []
): IHistory<T> {
  return rCreateHistory(entities, listOfIgnoredFields)
}

/**
 * Create history recursive function
 *
 * @param entities List of entities to compute the history from
 * @param listOfIgnoredFields list of fields to ignore from the entities in the history computation
 * @param listOfProcessedFields Internal list of already processed fields
 * @param historyEntry Internal object that gets filled at every function call
 */
function rCreateHistory<T extends IHasHistoryNecessaryFields>(
  entities: T[],
  listOfIgnoredFields: Array<keyof T> = [],
  listOfProcessedFields: string[] = [],
  historyEntry: IHistoryEntry<T> = {}
) {
  if (entities && entities.length < 2) {
    return
  }

  // entities[0] may not exist if it was added as an optional field later
  const id = entities[0] ? entities[0].staticId || entities[0]._id : undefined

  for (let i = entities.length - 1; i >= 0; i--) {
    const entity = entities[i]
    if (!entity) {
      // the entity is optional, no history for it
      return undefined
    }

    for (const field of Object.keys(entity)) {
      const value = entity[field]

      const updatedAt = entity.updatedAt

      if (!isIgnoredField(field, listOfIgnoredFields as string[]) && Array.isArray(value)) {
        createHistoryArray(
          entities,
          field,
          value,
          updatedAt,
          listOfIgnoredFields,
          listOfProcessedFields,
          historyEntry,
          i
        )
      } else if (!isIgnoredField(field, listOfIgnoredFields as string[]) && isObject(value)) {
        createHistoryObject(entities, field, historyEntry)
      } else {
        createHistoryStandardValue(entities, field, value, updatedAt, listOfIgnoredFields, historyEntry, i)
      }
    }
  }

  return isEmpty(historyEntry) ? undefined : { id, historyEntry }
}

function createHistoryStandardValue<T>(
  entities: T[],
  field: string,
  value: any,
  updatedAt: string,
  listOfIgnoredFields: Array<keyof T>,
  historyEntry: IHistoryEntry<T>,
  index: number
) {
  if (!value) {
    // there is not value for this, ignore
    return
  }
  const historyChange = { updatedAt, value }

  if (index === 0) {
    if (historyEntry[field]) {
      historyEntry[field].push(historyChange)
    }
  } else {
    const prevEntity = entities[index - 1]
    if (prevEntity === null || prevEntity === undefined) return

    if (!isIgnoredField(field, listOfIgnoredFields as string[]) && hasFieldChanged(value, prevEntity[field])) {
      if (historyEntry[field]) {
        historyEntry[field].push(historyChange)
      } else {
        historyEntry[field] = [historyChange]
      }
    }
  }
}

function createHistoryObject<T extends IHasHistoryNecessaryFields>(
  entities: T[],
  field: string,
  historyEntry: IHistoryEntry<T>
) {
  const computedHistory = createHistory(
    entities.map(currEntity => {
      const objectValue = currEntity[field]
      if (objectValue) {
        return { ...objectValue, updatedAt: objectValue.updatedAt || currEntity.updatedAt }
      }
    })
  )

  if (computedHistory) {
    historyEntry[field] = computedHistory
  }
}

function createHistoryArray<T extends IHasHistoryNecessaryFields>(
  entities: T[],
  field: string,
  value: any[],
  updatedAt: string,
  listOfIgnoredFields: Array<keyof T>,
  listOfProcessedFields: string[],
  historyEntry: IHistoryEntry<T>,
  index: number
) {
  // If it's not an array of objects, treat it like a normal value
  if (!isObject(value[0])) {
    createHistoryStandardValue(entities, field, value, updatedAt, listOfIgnoredFields, historyEntry, index)
  } else {
    if (listOfProcessedFields.includes(field)) {
      return
    }

    value.forEach(object => {
      const id = object.staticId || object._id
      // Need dynamic programming here to avoid recomputing the same field history
      const groupedEntities = []
      for (const currEntity of entities) {
        const objectArray: any[] = currEntity[field]
        const foundObject = objectArray.find(v => v.staticId === id || v._id === id)

        if (foundObject) {
          groupedEntities.push({ ...foundObject, updatedAt: foundObject.updatedAt || currEntity.updatedAt })
        }
      }

      const computedHistory = createHistory(groupedEntities, listOfIgnoredFields)
      if (historyEntry[field] && computedHistory) {
        historyEntry[field].push(computedHistory)
      } else if (computedHistory) {
        historyEntry[field] = [computedHistory]
      }
    })
  }

  listOfProcessedFields.push(field)
}

function isObject(value: any) {
  return value !== null && typeof value === 'object' && !(value instanceof Date)
}

function hasFieldChanged(value: any, lastValue: any) {
  if (!lastValue) return true

  if (value instanceof Date) {
    return lastValue.getTime() !== value.getTime()
  } else if (isObject(value)) {
    // In JS, arrays are also objects
    return !isEqual(value, lastValue)
  } else {
    return lastValue !== value
  }
}

function isIgnoredField(field: string, listOfIgnoredFields: string[]) {
  return IGNORED_FIELDS.concat(listOfIgnoredFields).includes(field)
}
