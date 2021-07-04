import makeLiteStyles from 'javascript/utils/theme/makeLiteStyles'
import getTextColorBasedOnBgColor from 'javascript/utils/helper-functions/get-text-color-from-background-color'
import { css } from 'styled-components'
import { tint } from 'polished'

const blockStyles = makeLiteStyles(styles => {
  return css`
  .section {
    background-color: ${styles.colors.background}
    color: ${styles.typography.bodyColor}
    &__copy {
      color: ${styles.typography.bodyColor}
    }
    &__header {
      font-size: ${styles.typography.headingsFontSize}
    }
  }
  .section,
  .content-block{
      &--light {
        background-color: ${styles.colors.light}
        color: ${getTextColorBasedOnBgColor(styles.colors.light)};

        .content-block__heading {
          color: ${getTextColorBasedOnBgColor(styles.colors.light)}
        }

        .wysiwyg {
          h1,
          h2,
          h3,
          h4,
          h5,
          h6 {
            color: ${getTextColorBasedOnBgColor(styles.colors.light)}
          }
        }
      }
      &--shade {
        background-color: ${styles.colors.shaded}
        color: ${getTextColorBasedOnBgColor(styles.colors.shaded)};

        .content-block__heading {
          color: ${getTextColorBasedOnBgColor(styles.colors.shaded)}
        }

        .wysiwyg {
          h1,
          h2,
          h3,
          h4,
          h5,
          h6 {
            color: ${getTextColorBasedOnBgColor(styles.colors.shaded)}
          }
        }
      }
      &--image {
        color: white;

        .content-block__heading {
          color: white;
        }

        .wysiwyg {
          h1,
          h2,
          h3,
          h4,
          h5,
          h6 {
            color: white;
          }
        }
      }
      &--brand {
        background-color: ${tint(0.8, styles.colors.brand)}
        color: ${getTextColorBasedOnBgColor(tint(0.8, styles.colors.brand))}

        .content-block__heading {
          color: ${getTextColorBasedOnBgColor(tint(0.8, styles.colors.brand))}
        }

        .wysiwyg {
          h1,
          h2,
          h3,
          h4,
          h5,
          h6 {
            color: ${getTextColorBasedOnBgColor(tint(0.8, styles.colors.brand))}
          }
        }
      }
      &--draft {
        border-color: ${styles.colors.brand};
        &:before {
          background-color: ${styles.colors.brand};
        }

      }
    }
  `
})

export default blockStyles