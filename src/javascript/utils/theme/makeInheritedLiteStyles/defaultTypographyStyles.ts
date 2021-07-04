import { darken } from 'polished'
import defaultColors from 'javascript/utils/theme/makeInheritedLiteStyles/defaultColors'
import { TypographyType } from 'javascript/utils/theme/types/ApiStylesType'

const defaultTypographyStyles: TypographyType = {
  /** Body */
  bodyColor: '#2a2f2f',
  bodyFontFamily: '"Droid Sans", Arial',
  bodyFontSize: 16,
  bodyFontWeight: 'normal',
  bodyLineHeight: 1.5,
  bodyUppercase: false,
  /** Headings */
  headingsColor: '#2a2f2f',
  headingsFontFamily: '"Droid Sans", Arial',
  headingsFontSize: 24,
  headingsFontWeight: 'bold',
  headingsLineHeight: 1.5,
  headingsUppercase: false,
  /** Links */
  linksColor: defaultColors.brand,
  linksColorHover: darken(0.1, defaultColors.brand),
  linksFontWeight: 'normal',
  linksUnderlined: false,
}

export default defaultTypographyStyles
