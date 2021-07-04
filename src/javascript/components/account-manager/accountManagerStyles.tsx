import { css } from 'styled-components'

import makeLiteStyles from 'javascript/utils/theme/makeLiteStyles'

const accountManagerStyles = makeLiteStyles(styles => {
  return css`
    .account-manager {
      &__title {
        color: ${styles.typography.headingsColor}
        font-size: ${styles.typography.headingsFontSize}
        font-weight: ${styles.typography.headingsFontWeight}
        font-family: ${styles.typography.headingsFontFamily}
      }
      &__text {
        color: ${styles.typography.bodyColor}
        font-size: ${styles.typography.bodyFontSize}
        font-weight: ${styles.typography.bodyFontWeight}
        font-family: ${styles.typography.bodyFontFamily}
      }
    }
  `
})

export default accountManagerStyles
