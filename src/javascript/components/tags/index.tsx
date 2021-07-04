import makeLiteStyles from 'javascript/utils/theme/makeLiteStyles'
import styled, { css } from 'styled-components'

export const Tags = styled.div.attrs({ className: 'tags' })``

export const Tag = styled.span.attrs({ className: 'tag' })``

export const tagStyles = makeLiteStyles(
  styles => css`
    .tag__icon {
      fill: ${styles.tags.color};
    }
    .tag,
    .card__tag,
    .card__count {
      font-family: ${styles.tags.fontFamily};
      font-weight: ${styles.tags.fontWeight};
      font-size: ${styles.tags.fontSize}px;
      color: ${styles.tags.color};
      ${styles.tags.uppercase &&
        css`
          text-transform: uppercase;
        `}
      background-color: ${styles.tags.bgColor};
      border-radius: ${styles.tags.radius}px;
      border-color: ${styles.tags.borderColor};
      border-width: ${styles.tags.borderWidth}px;

      &--Unregistered,
      &--unregistered {
        background-color: ${styles.colors.error};
        border: none;
        border-radius: 0
        font-size: 12px
      }
      ${styles.tags.borderWidth &&
        css`
          border-style: solid;
      `}
    }
    a.tag {
      &:hover {
        background-color: ${styles.tags.bgColorHover};
        border-color: ${styles.tags.borderColorHover};
        color: ${styles.tags.colorHover}
      }
    }
    a.tag:hover {
      background-color: ${styles.tags.bgColorHover};
      border-color: ${styles.tags.borderColorHover};
      color: ${styles.tags.colorHover}
    }
  `,
)
