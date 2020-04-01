import { ServerError } from './types'
import { FormikContext, ArrayHelpers } from 'formik'
import crypto from 'crypto'

export const buildFakeError = ({
  message = 'message',
  errorCode = 'E001',
  requestId = 'abc-123',
  origin = 'origin',
  fields = {}
} = {}): ServerError => {
  return {
    message,
    errorCode,
    requestId,
    origin,
    fields
  }
}

export const fakeJWTIdToken = (
  payload: {} = {
    email: 'some@email',
    exp: 1554540588448
  },
  header: {} = {
    alg: 'HS256',
    typ: 'JWT'
  }
): string => {
  const encodedHeader = encode(header)
  const encodedPayload = encode(payload)
  const encodedSignature = generateSignature(`${encodedHeader}.${encodedPayload}`)
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`
}

const encode = (json: object) =>
  Buffer.from(JSON.stringify(json))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

const generateSignature = (str, secret = 'my-secret') =>
  crypto
    .createHmac('sha256', secret)
    .update(str)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

export function fakeFormikContext<T>(
  initialValues: T,
  { errors = {}, touched = {}, setFieldValue = () => null, setFieldTouched = () => null } = {}
): FormikContext<T> {
  return {
    values: initialValues,
    errors,
    touched,
    isValidating: false,
    isSubmitting: false,
    submitCount: 0,
    setStatus: () => null,
    setError: () => null,
    setErrors: () => null,
    setSubmitting: () => null,
    setTouched: () => null,
    setValues: () => null,
    setFieldValue,
    setFieldTouched,
    setFieldError: () => null,
    validateForm: async () => ({}),
    validateField: async () => ({}),
    resetForm: () => null,
    submitForm: () => null,
    setFormikState: () => null,
    handleSubmit: () => null,
    handleReset: () => null,
    handleBlur: () => () => null,
    handleChange: () => () => null,
    dirty: false,
    isValid: true,
    initialValues,
    registerField: () => null,
    unregisterField: () => null
  }
}

export const fakeArrayHelpers: ArrayHelpers = {
  push: jest.fn(),
  handlePush: jest.fn(),
  swap: jest.fn(),
  handleSwap: jest.fn(),
  move: jest.fn(),
  handleMove: jest.fn(),
  insert: jest.fn(),
  handleInsert: jest.fn(),
  replace: jest.fn(),
  handleReplace: jest.fn(),
  unshift: jest.fn(),
  handleUnshift: jest.fn(),
  handleRemove: jest.fn(),
  handlePop: jest.fn(),
  remove: jest.fn(),
  pop: jest.fn()
}
