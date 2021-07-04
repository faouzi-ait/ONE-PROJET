import { css } from 'styled-components'
import { transparentize } from 'polished'

const getBoxShadowSnippetFromShadowType = (
  shadowType: string,
  color: string = '#000000',
) => {
  if (shadowType === 'heavy') {
    return css`
      box-shadow: 0 8px 16px ${transparentize(0.3, color)};
    `
  } else if (shadowType === 'medium') {
    return css`
      box-shadow: 0 6px 12px ${transparentize(0.24, color)};
    `
  } else if (shadowType === 'light') {
    return css`
      box-shadow: 0 4px 8px ${transparentize(0.18, color)};
    `
  } else {
    return ''
  }
}

export default getBoxShadowSnippetFromShadowType

/**

Usage:

styled.div`
  ${({ theme }) => getBoxShadowSnippetFromType(theme.div.boxShadowType)}
`

 */
