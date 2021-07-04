import makeLiteStyles from 'javascript/utils/theme/makeLiteStyles'
import { css } from 'styled-components'

const tabStyles = makeLiteStyles(styles => {
  return css`
    .tabs {
      border: ${styles.tabs.borderWidth}px solid ${styles.tabs.borderColor};
      border-radius:  ${styles.tabs.radius}px;
      
      .tabs__item {
        font-family: ${styles.tabs.fontFamily};
        font-weight: ${styles.tabs.fontWeight};
        font-size: ${styles.tabs.fontSize}px;
        background-color: ${styles.tabs.bgColor};
        border-right: ${styles.tabs.borderWidth}px solid ${styles.tabs.borderColor};
        color: ${styles.tabs.color};

        ${styles.tabs.uppercase &&
          css`
            text-transform: uppercase;
        `}

        :last-child {
          border-right: none;
        }

        &--active {
          background-color: ${styles.tabs.bgColorActive};
          color: ${styles.tabs.colorActive};
        }
      }
      &--underline {
        border: none
        .tabs__item {
          border-color: ${styles.tabs.color};
          border-right-width: 0
          &--active {
            background: transparent;
            border-color: ${styles.tabs.borderColor};
            color: ${styles.typography.bodyColor}
          }
        }
      }
    }
  `
})

export default tabStyles