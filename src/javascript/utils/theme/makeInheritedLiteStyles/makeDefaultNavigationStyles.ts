import { NavigationType } from 'javascript/utils/theme/types/ApiStylesType'
import { MakeDefaultStyles } from '../types/styles/MakeDefaultStyles'
import { darken } from 'polished'

const defaultNavigationStyles: MakeDefaultStyles<NavigationType> = ({
  colors,
  typography,
}) => ({
  bgColor: colors.background,
  dividerColor: darken(0.1, colors.background),
  linksColor: colors.brand,
  linksColorHover: darken(0.1, colors.brand),
  linksFontSize: typography.bodyFontSize,
  linksSpacing: 10,
  linksUnderlined: typography.linksUnderlined,
})

export default defaultNavigationStyles
