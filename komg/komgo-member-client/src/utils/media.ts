import { css, ThemedCssFunction } from 'styled-components'

export const SIZES = {
  desktop: 1100
}

export const media = (Object.keys(SIZES) as Array<keyof typeof SIZES>).reduce(
  (memo, label) => {
    memo[label] = (first: any, ...interpolations: any[]) => css`
      @media (min-width: ${SIZES[label] / 16}em) {
        ${css(first, ...interpolations)};
      }
    `

    return memo
  },
  {} as {
    [key in keyof typeof SIZES]: ThemedCssFunction<any /* TODO LS need to upgrade styledComponent ThemeInterface*/>
  }
)
