import makeLiteStyles from 'javascript/utils/theme/makeLiteStyles'
import { css } from 'styled-components'

const footerStyles = makeLiteStyles(
  styles => css`
    .footer {
      background-color: ${styles.footer.bgColor};
      border-top: ${styles.footer.borderColor} solid ${styles.footer.borderWidth}px;
      &__item {
        color: ${styles.footer.copyColor};
        margin-bottom: 6px;
      }
      &__link {
        font-size: ${styles.footer.copyFontSize}px;
        color: ${styles.footer.linksColor};
        &:hover {
          color: ${styles.footer.linksColorHover};
          text-decoration: none;
        }
      }
      &__copy {
        color: ${styles.footer.copyColor};
        font-size: ${styles.footer.copyFontSize}px;
      }
    }
  `,
)

export default footerStyles
