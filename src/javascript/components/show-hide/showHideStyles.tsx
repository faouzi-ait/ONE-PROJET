import makeLiteStyles from 'javascript/utils/theme/makeLiteStyles'
import { css } from 'styled-components'

const showHideStyles = makeLiteStyles(
  styles => css`
    .show-hide {
      &__title {
        font-size: ${styles.typography.headingsFontSize * 0.9}px;
        font-weight: ${styles.typography.headingsFontWeight};
      }
      &__sub-title {
        font-size: ${styles.typography.bodyFontSize}px;
      }
      &__trigger {
        border: 2px solid ${styles.colors.brand};
        &::before {
          border-color: ${styles.colors.brand};
        }
      }

      &--active {
        .show-hide__trigger {
          background-color: ${styles.colors.brand};
          &::before {
            border-color: white;
          }
        }
      }
    }
  `,
)

export default showHideStyles
