import styled, { css } from 'styled-components'
import makeLiteStyles from 'javascript/utils/theme/makeLiteStyles'

export const LiteFooterTagline = styled.p`
  text-align: center;
  ${makeLiteStyles(
    styles => css`
      color: ${styles.footer.copyColor};
      font-size: ${styles.footer.copyFontSize}px;
    `,
  )}
  font-weight: bold;
  margin: 0;
  margin-bottom: 10px;
`
