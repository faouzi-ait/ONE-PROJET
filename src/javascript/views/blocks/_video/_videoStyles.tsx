import makeLiteStyles from 'javascript/utils/theme/makeLiteStyles'
import { css } from 'styled-components'

const videoStyles = makeLiteStyles(styles => {
  return css`
    .video__poster {
      &::before {
        border-color: ${styles.colors.brand};
      }
    }
  `
})

export default videoStyles