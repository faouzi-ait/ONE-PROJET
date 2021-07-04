import makeLiteStyles from 'javascript/utils/theme/makeLiteStyles'
import { css } from 'styled-components'

const pressStyles = makeLiteStyles(styles => {
  return css`
    .quote-card {
      &::before {
        background-color: ${styles.colors.brand};
      }
    }
  `
})

export default pressStyles