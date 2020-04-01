import { parse } from 'qs'
import { decompressFromBase64 } from 'lz-string'
import * as express from 'express'
import { URL } from 'url'

const isObject = val => {
  return val.constructor === Object
}

const isNumber = val => {
  return !isNaN(parseFloat(val)) && isFinite(val)
}

const isBoolean = val => {
  return val === 'false' || val === 'true'
}

const isArray = val => {
  return Array.isArray(val)
}

const isRegex = val => {
  return !!val.$regex
}

const isEtrmId = val => {
  return !!val.etrmId
}

const parseValue = val => {
  // Order matters.
  if (typeof val === 'undefined') {
    return undefined
  } else if (isBoolean(val)) {
    return parseBoolean(val)
  } else if (isArray(val)) {
    return parseArray(val)
  } else if (isEtrmId(val)) {
    return parseEtrmId(val)
  } else if (isRegex(val)) {
    return parseRegex(val)
  } else if (isObject(val)) {
    return parseObject(val)
  } else if (isNumber(val)) {
    return parseNumber(val)
  } else {
    return val
  }
}

const parseObject = (obj): object => {
  return Object.entries(obj).reduce((memo, [k, v]) => {
    return {
      [k]: parseValue(v),
      ...memo
    }
  }, {})
}

const parseArray = arr => {
  return arr.map(v => parseValue(v))
}

const parseNumber = val => {
  return Number(val)
}

const parseRegex = val => {
  return {
    $regex: new RegExp(val.$regex)
  }
}

const parseEtrmId = val => {
  return val
}

const parseBoolean = val => {
  return val === 'true'
}

export const queryParser = (query: any = {}): any => {
  const object = {
    query: query.query || {},
    projection: query.projection,
    options: {
      sort: (query.options || {}).sort || {},
      limit: (query.options || {}).limit || 200, // TODO LS better default once we have pagination 100,
      skip: (query.options || {}).skip || 0 // TODO LS better default once we have pagination 100,0,
    }
  }
  return parseObject(object)
}

export const queryStringParser = (request: express.Request, arrayLimit = 1000): any => {
  const url = request.protocol + '://' + request.get('host') + request.originalUrl
  // tslint:disable-next-line
  const queryString = new URL(url).search.replace('?', '')
  const parsedQueryString = parse(queryString, { arrayLimit })
  const regex = /(?:^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{1,3}={0,3})?$)/
  const qsFilter = regex.test(parsedQueryString.filter)
    ? decompressFromBase64(parsedQueryString.filter)
    : parsedQueryString.filter
  return queryParser(parse(qsFilter, { arrayLimit }))
}
