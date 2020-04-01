import { ICargo, ITrade, IDiff } from '@komgo/types'
import { compare } from 'fast-json-patch'
import { ReplaceOperation } from 'fast-json-patch/lib/core'
import { get } from 'lodash'
import { ILetterOfCredit } from '../types/ILetterOfCredit'

const BLACK_LIST = ['createdAt', 'updatedAt', 'deletedAt', '__v', '_id']

const toDiff = (op: ReplaceOperation<any>, previous, type: 'ITrade' | 'ICargo' | 'ILC'): IDiff => {
  const path = op.path.split('/').slice(1)
  return {
    op: op.op,
    path: op.path,
    value: op.value,
    oldValue: get(previous, path),
    type
  }
}

// Remove a list of properties from an object.
export const omitDeep = (obj = {}, keys: string[]) => {
  return keys.reduce((memo: any, key: string) => {
    return omitKeyDeep(memo, key)
  }, obj)
}

function omitKeyDeep(obj = {}, key) {
  if (Array.isArray(obj)) {
    return omitDeepArrayWalk(obj, key)
  }
  const keys = Object.keys(obj)
  const newObj = {}
  keys.forEach(i => {
    if (i !== key) {
      const val = obj[i]
      if (Array.isArray(val)) {
        newObj[i] = omitDeepArrayWalk(val, key)
      } else if (typeof val === 'object' && val !== null) {
        newObj[i] = omitKeyDeep(val, key)
      } else {
        newObj[i] = val
      }
    }
  })
  return newObj
}

function omitDeepArrayWalk(arr, key) {
  return arr.map(val => {
    if (Array.isArray(val)) {
      return omitDeepArrayWalk(val, key)
    } else if (typeof val === 'object') {
      return omitKeyDeep(val, key)
    }
    return val
  })
}

export const tradeDiff = (previous: ITrade, latest: ITrade): IDiff[] => {
  return !previous || !latest
    ? []
    : compare(omitDeep(previous, BLACK_LIST), omitDeep(latest, BLACK_LIST)).map((op: ReplaceOperation<any>) =>
        toDiff(op, previous, 'ITrade')
      )
}

export const cargoDiff = (previous: ICargo, latest: ICargo): IDiff[] => {
  return !previous || !latest
    ? []
    : compare(omitDeep(previous, BLACK_LIST), omitDeep(latest, BLACK_LIST)).map((op: ReplaceOperation<any>) =>
        toDiff(op, previous, 'ICargo')
      )
}

export const letterOfCreditDiff = (previous: ILetterOfCredit, latest: ILetterOfCredit): IDiff[] =>
  compare(omitDeep(previous, BLACK_LIST), omitDeep(latest, BLACK_LIST)).map((op: ReplaceOperation<any>) =>
    toDiff(op, previous, 'ILC')
  )
