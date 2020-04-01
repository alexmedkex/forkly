import { domainSpecificCasingOverrides } from '..//features/letter-of-credit-legacy/components/InputControllers/acronyms'

export const capitalize = (str: string) => {
  return (
    str &&
    str
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.substring(1).toLowerCase())
      .join(' ')
  )
}

// deliveryPeriod.endDate => Delivery Period End Date
export const dotNotationToTitleize = str => {
  if (!str) {
    return str
  }

  const base = str.replace(/([A-Z])/g, ' $1').replace(/(\..)/g, v => v.replace('.', ' ').toUpperCase())
  return base.charAt(0).toUpperCase() + base.slice(1)
}

export const camelCaseToSentenceCase = str =>
  str &&
  sentenceCase(
    str
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, s => s.toUpperCase())
      .trim()
  )

export const diffToDotNotation = str => str && str.replace(/\//g, '.').substr(1)

export const diffNotationToTitleize = str => str && dotNotationToTitleize(diffToDotNotation(str))

export const sentenceCase = (str: string = '') => {
  return (
    str &&
    str
      .replace(/_/g, ' ')
      .split(' ')
      .map((word, idx) => {
        return idx === 0 ? word.charAt(0).toUpperCase() + word.substring(1).toLowerCase() : word.toLowerCase()
      })
      .join(' ')
  )
}

export const sentenceCaseWithAcronyms = (input: string = '', acronyms: string[] = domainSpecificCasingOverrides) => {
  if (!input) {
    return input
  }

  let str = sentenceCase(input)

  const replacer = (original: string, acronym: string) => {
    const originalPieces = original.split(' ')

    return originalPieces
      .map(
        o =>
          o.length === acronym.length
            ? o.replace(acronym.toLowerCase(), acronym).replace(sentenceCase(acronym), acronym)
            : o
      )
      .join(' ')
  }

  acronyms.forEach(acronym => {
    str = replacer(str, acronym)
  })

  return str
}

export const toKebabCase = (str: string) =>
  str &&
  str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map(x => x.toLowerCase())
    .join('-')

export const truncate = (str: string = '', lenght: number) =>
  str && str.length > lenght ? `${str.substring(0, lenght)}...` : str

export const replaceUnderscores = (input: string) => {
  return input && input.replace(/_/g, ' ')
}

export const toMegabytes = (bytes: number | string) => `${(+bytes / 1024000).toFixed(2)} Mb`

export const pluralize = (word: string, count: number, pluralSuffix = 's') =>
  count > 1 ? `${word}${pluralSuffix}` : word

export const toYesNoDash = input => (input === undefined || input === null ? '-' : input ? 'Yes' : 'No')
