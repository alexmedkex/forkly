import { parse } from 'qs'

export interface ISelection {
  select: boolean
  redirectTo: string
  type: string // TODO LS we need to decide how to mark the template. I don't think LetterOfCreditType is the right one
}

const REDIRECT_WHITE_LIST = [/^\/letters-of-credit\/new/]

export const buildSelection = (querystring: string): ISelection => {
  const { select = false, type, redirectTo } = parse(querystring, {
    ignoreQueryPrefix: true,
    decoder: str => {
      const keywords = {
        true: true,
        false: false,
        null: null,
        undefined
      }
      if (str in keywords) {
        return keywords[str]
      }
      return decodeURIComponent(str)
    }
  })

  if (redirectTo && !REDIRECT_WHITE_LIST.some(route => redirectTo.match(route))) {
    throw new Error(`Redirect to ${redirectTo} not supported`)
  }

  return {
    redirectTo,
    select,
    type
  }
}
