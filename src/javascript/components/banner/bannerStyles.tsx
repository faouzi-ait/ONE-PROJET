import { css } from 'styled-components'
import { transparentize } from 'polished'

import makeLiteStyles from 'javascript/utils/theme/makeLiteStyles'
import breakpoint from 'javascript/utils/theme/breakpoint'

const bannerStyles = makeLiteStyles(styles => {
  return css`
    .banner {
      &:after {
        background-color: ${transparentize((1 - styles.banners.overlayOpacity * 0.01), styles.banners.overlayColor)};
      }
      &__title {
        font-size: ${styles.banners.headingsFontSize}px;
        color: ${styles.banners.headingsColor};

        ${breakpoint('large')`
          font-size: calc(${styles.banners.headingsFontSize}px * 0.5);
        `}
      }
      &__copy {
        font-size: ${styles.banners.copyFontSize}px;
        color: ${styles.banners.copyColor};

        ${breakpoint('large')`
          font-size: calc(${styles.banners.copyFontSize}px * 0.8);
        `}
      }
      &__programme-title {
        font-size: ${styles.typography.bodyFontSize}px;
        font-weight: ${styles.typography.bodyFontWeight}
      }
    }
  `
})

export default bannerStyles