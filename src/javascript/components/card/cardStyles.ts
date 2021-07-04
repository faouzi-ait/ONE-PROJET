import makeLiteStyles from 'javascript/utils/theme/makeLiteStyles'
import { css } from 'styled-components'
import getBoxShadowSnippetFromShadowType from 'javascript/utils/helper-functions/get-box-shadow-snippet-from-shadow-type'

const cardStyles = makeLiteStyles(
  styles => css`
    .card {
      background-color: ${styles.cards.bgColor};
      border-radius: ${styles.cards.radius}px;
      border: solid ${styles.cards.borderWidth}px ${styles.cards.borderColor};
      box-sizing: border-box;
      overflow: hidden;
      ${getBoxShadowSnippetFromShadowType(
        styles.cards.shadowType,
        styles.cards.shadowColor,
      )}

      &__media {
        margin-right: 0;
        width: calc(50% - 2px);
        border-radius: 0;

        &:nth-of-type(odd) {
          margin-right: 4px;
        }

        &:first-of-type:last-of-type {
          width: 100%;
        }
      }

      &__media-link{
        margin-right: 0;
        border-radius: 0;
      }

      &__title {
        font-weight: ${styles.cards.headingsFontWeight};
        font-size: ${styles.cards.headingsFontSize}px;
        ${styles.cards.headingsUppercase &&
          css`
            text-transform: uppercase;
          `}
        font-family: ${styles.cards.headingsFontFamily};
      }

      &__copy {
        font-size: ${styles.typography.bodyFontSize}px;
        font-weight: ${styles.typography.bodyFontWeight};
      }

      &:hover {
        ${getBoxShadowSnippetFromShadowType(
          styles.cards.shadowTypeHover,
          styles.cards.shadowColorHover,
        )}
        .card__title {
          color: ${styles.colors.brand};
        }
      }

      &__title,
      &__copy {
        color: ${styles.cards.headingsColor};
      }

      &__icon {
        fill: ${styles.buttons.primaryBgColor};
      }

      &--small {
        .card__title {
          font-size: 14px
        }
      }

      &--poster {
        border: none;
        min-height: 240px;
      }

      &--with-like {
        min-height: 370px
      }
    }
  `,
)

export default cardStyles
