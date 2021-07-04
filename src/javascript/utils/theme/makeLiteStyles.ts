import { ThemeType } from './types/ThemeType'
import { ThemedCssFunction } from 'styled-components'
import { isLiteClient } from 'javascript/utils/theme/liteClientName'

type MakeLiteStyles = (
  stylesFunction: (
    styles: ThemeType['styles'],
  ) => ReturnType<ThemedCssFunction<ThemeType>> | string,
) => (props: {
  theme: ThemeType
}) => ReturnType<ThemedCssFunction<ThemeType>> | string

const makeLiteStyles: MakeLiteStyles = stylesFunction => props => {
  if (isLiteClient()) {
    if (props.theme && !props.theme.styles) {
      return ''
    }
    return stylesFunction(props.theme.styles)
  }
  return ''
}

export default makeLiteStyles

/** USAGE:

import { css } from 'styled-components'

export const backgroundStyles = makeLiteStyles(styles => css`
  body {
    background-color: ${styles.background.color};
  }
`)

*/
