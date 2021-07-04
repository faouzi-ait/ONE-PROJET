import makeLiteStyles from 'javascript/utils/theme/makeLiteStyles'
import { css } from 'styled-components'

const carouselStyles = makeLiteStyles(styles => {
  return css`
    .carousel {
      overflow: visible
    }

    .carousel__arrow {
      background-color: ${styles.buttons.primaryBgColor};
    }

    .carousel__dot {
      border: 2px solid ${styles.colors.brand};
    }

    .carousel__dot--active {
      background: ${styles.colors.brand};
    }

    .carousel__scroll-handle {
      background: ${styles.colors.brand};
    }

    .content-block--promo-carousel .carousel {
      padding-top: 10px
      padding-bottom: 20px
    }
  `
})

export default carouselStyles