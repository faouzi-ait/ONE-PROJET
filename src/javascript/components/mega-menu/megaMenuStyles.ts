import { css } from 'styled-components'
import makeLiteStyles from 'javascript/utils/theme/makeLiteStyles'

const megaMenuStyles = makeLiteStyles(
  styles => css`
    .mega-menu {
      .text-button {
        color: ${styles.header.linksColor};
        &:hover {
          color: ${styles.header.linksColorHover};
        }
      }
      
      &__item {
        &:before {
          top: calc(${styles.navigation.linksSpacing}px + 2px)
        }
      }

      &__close {
        background-color: ${styles.buttons.iconBgColor} !important;
        border-color: ${styles.buttons.iconBgColor} !important;
        &:focus, &:hover {
          background-color: ${styles.buttons.iconBgColorHover}
          border-color: ${styles.buttons.iconBgColorHover}
        }
        &__icon {
          fill: ${styles.buttons.secondaryColor};
        }
      }

      &__popout {
        background-color: ${styles.navigation.bgColor};
      }

      &__sub-item {
        padding: 0
      }

      &__link {
        color: ${styles.navigation.linksColor};
        font-size: ${styles.navigation.linksFontSize}px;
        padding: ${styles.navigation.linksSpacing}px 0px;
        &:hover {
          color: ${styles.navigation.linksColorHover};
        }        
      }
    }
  `,
)

export default megaMenuStyles
