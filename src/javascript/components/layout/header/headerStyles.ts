import makeLiteStyles from 'javascript/utils/theme/makeLiteStyles'
import { css } from 'styled-components'
import getBoxShadowSnippetFromShadowType from 'javascript/utils/helper-functions/get-box-shadow-snippet-from-shadow-type'

const headerStyles = makeLiteStyles(
  styles => css`
    .header {
      background-color: ${styles.header.bgColor};
      border-bottom: ${styles.header.borderColor} solid
        ${styles.header.borderWidth}px;
      ${getBoxShadowSnippetFromShadowType(
        styles.header.shadowType,
        styles.header.shadowColor
      )};
      position: relative;

      .header__controls {
        .text-button {
          color: ${styles.header.linksColor};
          &:hover {
            color: ${styles.header.linksColorHover};
          }
        }
      }

      .header__user {
        color: ${styles.header.linksColor};
        &:hover {
          color: ${styles.header.linksColorHover};
          text-shadow: none;
        }
      }

      .header__welcome {
        color: ${styles.header.linksColor};
      }

      a.brand > img {
        max-height: 60px;
      }

      .programme-search {
        background: transparent
      }

      ${styles.header.iconColor &&
        css`
          .button--icon {
            background-color: ${styles.header.iconColor}
            border-color: ${styles.header.iconColor}
            &:focus, &:hover {
              background-color: ${styles.header.iconColorHover}
              border-color: ${styles.header.iconColorHover}
            }
          }
      `}
    }
    .page > main.login {
      background-color: ${styles.header.bgColor};
    }
  `,
)

export default headerStyles
