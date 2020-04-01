import { EnumParams, ErrorObject, PatternParams, RequiredParams } from 'ajv'
import { FormikErrors, FormikValues } from 'formik'
import { dateFormats } from './date'

const emptyStringPattern = '^(?![\\s]).{1,}'

export const toFormikErrors = (errors: ErrorObject[] = [], prefix = ''): FormikErrors<FormikValues> => {
  const getNestedPath = (error: ErrorObject) => (error.dataPath !== '' ? error.dataPath.replace('.', '') + '.' : '')
  const errorWithReplaceDot = (error: ErrorObject) => error.dataPath.replace('.', '')
  const requiredProp = (error: ErrorObject) => getNestedPath(error) + (error.params as RequiredParams).missingProperty
  const empty = (error: ErrorObject) => ''

  const mapPropKeyToFunction = new Map<string, (error: ErrorObject) => string>([
    ['format', errorWithReplaceDot],
    ['enum', errorWithReplaceDot],
    ['required', requiredProp],
    ['type', errorWithReplaceDot],
    ['minimum', errorWithReplaceDot],
    ['maxLength', errorWithReplaceDot],
    ['minLength', errorWithReplaceDot],
    ['minItems', errorWithReplaceDot],
    ['maximum', errorWithReplaceDot],
    ['exclusiveMinimum', errorWithReplaceDot],
    ['pattern', errorWithReplaceDot],
    ['isNotEmpty', errorWithReplaceDot],
    ['formatMaximum', errorWithReplaceDot],
    ['formatMinimum', errorWithReplaceDot],
    ['range', errorWithReplaceDot],
    ['if', empty],
    ['anyOf', errorWithReplaceDot]
  ])

  const getProp = (error: ErrorObject): string | undefined => {
    const getPropFunction = mapPropKeyToFunction.get(error.keyword)
    if (!getPropFunction) {
      throw new Error(`getProp failed: '${error.keyword}' not supported `)
    }
    return getPropFunction(error)
  }

  const formatMessage = (error: ErrorObject) =>
    `'${getProp(error)}' ${(error.message || '').replace(`'date'`, dateFormats.inputs)}`
  const enumMessage = (error: ErrorObject) =>
    `'${getProp(error)}' ${error.message} (${(error.params as EnumParams).allowedValues.join(' or ')})`
  const requiredMessage = (error: ErrorObject) => `'${getProp(error)}' should not be empty`

  const messageWithProp = (error: ErrorObject) => `'${getProp(error)}' ${error.message}`
  const messageWithPropAndHumanReadable = (error: ErrorObject) =>
    `'${getProp(error)}' ${error.message
      .replace('>=', 'greater than or equal to')
      .replace('<=', 'less than or equal to')
      .replace('>', 'strictly greater than')}`
  const patternMessage = (error: ErrorObject) => {
    const params = error.params as PatternParams
    if (params && params.pattern && params.pattern === emptyStringPattern) {
      return `'${getProp(error)}' should not be empty`
    }
    return `'${getProp(error)}' ${error.message}`
  }
  const isNotEmptyMessage = (error: ErrorObject) => `Field ${error.dataPath.replace('.', '')} should not be empty`
  const formatAndRange = (error: ErrorObject) => `Field ${error.dataPath.replace('.', '')} ${error.message}`

  const mapMessageKeyToFunction = new Map<string, (error: ErrorObject) => string>([
    ['format', formatMessage],
    ['enum', enumMessage],
    ['required', requiredMessage],
    ['type', messageWithProp],
    ['minimum', messageWithPropAndHumanReadable],
    ['exclusiveMinimum', messageWithPropAndHumanReadable],
    ['maxLength', messageWithProp],
    ['minLength', messageWithProp],
    ['maximum', messageWithPropAndHumanReadable],
    ['pattern', patternMessage],
    ['isNotEmpty', isNotEmptyMessage],
    ['formatMaximum', formatAndRange],
    ['formatMinimum', formatAndRange],
    ['range', formatAndRange],
    ['minItems', messageWithProp],
    ['anyOf', messageWithProp]
  ])

  const getMessage = (error: ErrorObject): string => {
    const getMessageFunction = mapMessageKeyToFunction.get(error.keyword)
    if (!getMessageFunction) {
      throw new Error(`getMessage failed: '${error.keyword}' not supported `)
    }
    return getMessageFunction(error)
  }

  return errors.reduce((memo: any, error: any) => {
    const prop = getProp(error)
    if (prop) {
      const message = getMessage(error)
      if (memo[prop]) {
        return {
          ...memo
        }
      }
      return {
        ...memo,
        [prefix + prop]: message
      }
    }
    return memo
  }, {})
}
