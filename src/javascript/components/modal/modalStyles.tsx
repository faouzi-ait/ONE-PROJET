import makeLiteStyles from 'javascript/utils/theme/makeLiteStyles'
import getTextColorBasedOnBgColor from 'javascript/utils/helper-functions/get-text-color-from-background-color'
import { css } from 'styled-components'
import { transparentize } from 'polished'

const modalStyles = makeLiteStyles(styles => {
  return css`
    .modal {
      background-color: ${transparentize((1 - styles.modals.backgroundOpacity * 0.01), styles.modals.backgroundColor)};

      &__wrapper {
        background-color: ${styles.colors.light};
        color: ${getTextColorBasedOnBgColor(styles.colors.light)};
        .info {
          color: ${getTextColorBasedOnBgColor(styles.colors.light)};
        }
      }

      &__header {
        background-color: ${styles.colors.background};
      }

      &__title {
        padding-left: 5px
      }

      &__resume-video {
        p {
          color: ${styles.typography.bodyColor};
          font-family: ${styles.typography.bodyFontFamily};
          font-weight: ${styles.typography.bodyFontWeight};
          font-size: ${styles.typography.bodyFontSize};
        }
      }

      &__title-icon {
        fill: ${styles.typography.bodyColor};
      }

      .form__label,
      .programme-filters__label,
      .programme-filters__column {
        color: ${getTextColorBasedOnBgColor(styles.colors.light)};
      }
    }
  `
})

export default modalStyles