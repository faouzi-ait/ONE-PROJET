import makeLiteStyles from 'javascript/utils/theme/makeLiteStyles'
import { css } from 'styled-components'

const galleryStyles = makeLiteStyles(styles => {
  return css`
    .gallery-modal__arrow {
      background-color: ${styles.buttons.primaryBgColor};
    }
    .gallery-modal {
      button.modal__close {
        background-color: ${styles.buttons.primaryBgColor};
      }
    }
  `
})

export default galleryStyles