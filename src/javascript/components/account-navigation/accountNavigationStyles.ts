import { css } from 'styled-components'
import makeLiteStyles from 'javascript/utils/theme/makeLiteStyles'

const accountNavigationStyles = makeLiteStyles(
  styles => css`
    .account-navigation {

      &__link {
        color: ${styles.navigation.linksColor};
        font-size: ${styles.navigation.linksFontSize}px;
        padding:  0px ${styles.navigation.linksSpacing - 12}px;
        &:hover {
          color: ${styles.navigation.linksColorHover};
        }
      }

      &__item {
        border-color: ${styles.navigation.dividerColor};
      }
    }
  `,
)

export default accountNavigationStyles
