import makeLiteStyles from 'javascript/utils/theme/makeLiteStyles'
import { css } from 'styled-components'
import { tint } from 'polished'

const pageLoaderStyles = makeLiteStyles(styles => {
  return css`
    .loader {
      &::before {
        border-color: ${styles.colors.brand};
        border-bottom-color: transparent
      }
      &::after {
        border-color: ${tint(0.3, styles.colors.brand)};
        border-bottom-color: transparent;
      }
    }
  `
})

export default pageLoaderStyles