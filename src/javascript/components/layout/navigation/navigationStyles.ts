import { css } from 'styled-components'
import makeLiteStyles from 'javascript/utils/theme/makeLiteStyles'

const navigationStyles = makeLiteStyles(
  styles => css`
    .navigation {
      background-color: ${styles.navigation.bgColor};

      &__link {
        color: ${styles.navigation.linksColor};
        font-size: ${styles.navigation.linksFontSize}px
        padding: ${styles.navigation.linksSpacing}px 0px;
        &:hover {
          color: ${styles.navigation.linksColorHover};
        }
        &::before {
          display: none
        }
        &--is-active {
          color: ${styles.navigation.linksColorHover};
        }
      }

      &__item--divide {
        border-bottom: 1px solid ${styles.navigation.dividerColor};
      }

      &__sub-nav {
        list-style: none;
      }
    }
  `,
)

export default navigationStyles
