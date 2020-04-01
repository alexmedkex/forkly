declare module 'react-idle-timer'
declare module 'jwt-decode'
declare module 'react-pdf'
declare module 'react-toastify'

// images
declare module '*.svg'
declare module '*.png'
declare module '*.jpg'

// jest-styled-components
interface AsymmetricMatcher {
  $$typeof: symbol
  sample?: string | RegExp | object | any[] | (() => void)
}

type Value = string | RegExp | AsymmetricMatcher | undefined

interface Options {
  media?: string
  modifier?: string
  supports?: string
}

// tslint:disable-next-line
declare namespace jest {
  interface Matchers<R> {
    toHaveStyleRule(property: string, value: Value, options?: Options): R
  }
}
