import { css } from 'styled-components'

const defaultBreakpoints = {
  small: '639px',
  medium: '767px',
  large: '1023px',
  xlarge: '1279px',
}

type Sizes = 'small' | 'medium' | 'large' | 'xlarge'

const breakpoint = (size: Sizes) => (...styles) => {
  return css`
    @media (max-width: ${defaultBreakpoints[size]}) {
      ${css(
        // @ts-ignore
        ...styles
      )};
    }
  `
}

export default breakpoint
